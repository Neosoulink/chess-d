import { inject, singleton } from "tsyringe";
import { Vector3, Vector3Like } from "three";
import { copyProperties } from "@quick-threejs/utils";
import {
	BoardCoord,
	ColorSide,
	ExtendedPieceSymbol,
	fenToCoords,
	PieceType
} from "@chess-d/shared";
import { Physics } from "@chess-d/rapier";

import {
	InstancedPieceModel,
	PiecesGroups,
	MatrixPieceModel,
	DroppedPiecesGroups,
	INITIAL_FEN_TOKEN,
	PieceNotificationPayload,
	VECTOR
} from "../../shared";
import { BoardService } from "../board/board.service";
import { ResourcesService } from "../resources/resources.service";
import { WorldService } from "../world/world.service";

@singleton()
export class PiecesService {
	public readonly groups: PiecesGroups = {
		[ColorSide.white]: {},
		[ColorSide.black]: {}
	};
	public readonly droppedGroups: DroppedPiecesGroups = {
		[ColorSide.white]: {},
		[ColorSide.black]: {}
	};

	constructor(
		@inject(INITIAL_FEN_TOKEN) private readonly _initialFen: string,
		@inject(Physics) private readonly _physics: Physics,
		@inject(WorldService) private readonly _worldService: WorldService,
		@inject(BoardService) private readonly _boardService: BoardService,
		@inject(ResourcesService)
		private readonly _resourcesService: ResourcesService
	) {}

	private _createGroup<Type extends PieceType, Color extends ColorSide>(
		type: Type,
		color: Color,
		coords: BoardCoord[],
		pieces?: InstancedPieceModel<Type, Color>["pieces"]
	) {
		const geometry = this._resourcesService.getPieceGeometry(type);

		if (!geometry) throw new Error("Invalid geometry.");

		const group = new InstancedPieceModel(
			type,
			color,
			coords.length,
			geometry,
			pieces
		);

		coords.forEach((coord, instanceId) => {
			group.setPieceCoord(instanceId, this._boardService.instancedCell, coord);
		});

		group.resetPhysics(this._physics);

		return group;
	}

	private _setGroup<Type extends PieceType, Color extends ColorSide>(
		newGroup: InstancedPieceModel<Type, Color>
	) {
		// @ts-ignore <unsupported never type>
		this.groups[newGroup.piecesColor][newGroup.piecesType] = newGroup;
	}

	public clear() {
		[ColorSide.black, ColorSide.white].forEach((color) => {
			Object.keys(this.groups[color]).forEach((key) => {
				const group = this.groups[color][key as PieceType];

				if (!(group instanceof InstancedPieceModel)) return;

				group.dispose(this._physics);
				delete this.groups[color][key as PieceType];
			});

			Object.keys(this.droppedGroups[color]).forEach((key) => {
				const group = this.droppedGroups[color][key as PieceType];

				group?.forEach((piece) => {
					if (piece instanceof MatrixPieceModel) piece.dispose();
				});

				this.droppedGroups[color][key as PieceType] = [];
			});
		});
	}

	public reset(fen = this._initialFen) {
		this.clear();

		const fenCoords = fenToCoords(fen);

		if (fenCoords)
			[ColorSide.black, ColorSide.white].forEach((color) => {
				const pieceCoords = fenCoords[color]!;
				Object.keys(pieceCoords).forEach((_pieceType) => {
					const coords = pieceCoords[_pieceType as ExtendedPieceSymbol];
					const pieceType = _pieceType.toLowerCase() as PieceType;
					const newGroup = this._createGroup(pieceType, color, coords ?? []);

					this._setGroup(newGroup);
					this.droppedGroups[color][pieceType] = [];
				});
			});

		[...Object.keys(this.groups[ColorSide.black])].forEach((key) => {
			const group = this.groups?.[ColorSide.black][key as PieceType];

			if (group instanceof InstancedPieceModel)
				this._worldService.scene.add(group);
		});

		[...Object.keys(this.groups[ColorSide.white])].forEach((key) => {
			const group = this.groups?.[ColorSide.white][key as PieceType];

			if (group instanceof InstancedPieceModel)
				this._worldService.scene.add(group);
		});
	}

	public getPieceByCoord<Type extends PieceType, Color extends ColorSide>(
		pieceGroup: Type,
		pieceColor: Color,
		coord: BoardCoord
	): MatrixPieceModel<Type, Color> | undefined {
		const group = this.groups?.[pieceColor]?.[pieceGroup];
		const piece = group?.pieces.find((piece) => {
			if (
				group &&
				piece &&
				piece.coord.col === coord.col &&
				piece.coord.row === coord.row
			)
				return true;

			return false;
		});

		if (!group || !piece) return undefined;

		return piece as unknown as MatrixPieceModel<Type, Color>;
	}

	public setPiecePosition<Type extends PieceType, Color extends ColorSide>(
		piece: MatrixPieceModel<Type, Color>,
		position: Vector3Like
	) {
		this.groups?.[piece.color]?.[piece.type]?.setPiecePosition(
			piece.instanceId,
			position
		);
	}

	public setPieceCoord<Type extends PieceType, Color extends ColorSide>(
		piece: MatrixPieceModel<Type, Color>,
		coord: BoardCoord,
		offset?: Vector3Like
	) {
		this.groups?.[piece.color]?.[piece.type]?.setPieceCoord(
			piece.instanceId,
			this._boardService.instancedCell,
			coord,
			offset
		);
	}

	public dropPiece<Type extends PieceType, Color extends ColorSide>(
		piece: MatrixPieceModel<Type, Color>
	): MatrixPieceModel<Type, Color> | undefined {
		const droppedPiecesGroup = this.droppedGroups?.[piece.color]?.[piece.type];
		const piecesGroup = this.groups?.[piece.color]?.[piece.type];
		const pieces = piecesGroup?.pieces;

		if (
			!piecesGroup ||
			!(pieces?.[piece.instanceId] instanceof MatrixPieceModel)
		)
			return undefined;

		const newGroup = piecesGroup.dropPiece(
			piece.instanceId,
			this._physics
		) as unknown as InstancedPieceModel<Type, Color> | undefined;

		if (!newGroup) return undefined;

		this._setGroup(newGroup);

		// @ts-ignore <unsupported never type>
		droppedPiecesGroup?.push(piece);

		return piece;
	}

	public promotePiece<Color extends ColorSide, ToType extends PieceType>(
		piece: MatrixPieceModel<PieceType.pawn, Color>,
		toPiece: ToType
	): void {
		const promotedPieceGroup = this.groups?.[piece.color]?.[
			toPiece
		] as unknown as InstancedPieceModel<ToType, Color>;
		const droppedPiece = this.dropPiece(piece);

		if (!droppedPiece || !promotedPieceGroup) return;

		const newPiece = new MatrixPieceModel(
			toPiece,
			piece.color,
			piece.instanceId,
			piece.type
		);
		newPiece.position.copy(piece.position);
		newPiece.coord.col = piece.coord.col;
		newPiece.coord.row = piece.coord.row;

		const newGroup = promotedPieceGroup.addPiece(newPiece, this._physics);
		if (!newGroup) return;

		this._setGroup(newGroup);
	}

	public handlePieceMoving(payload: PieceNotificationPayload) {
		const { cellsIntersection, instancedPiece, piece, lastPosition } = payload;
		const cellPosition = copyProperties(
			cellsIntersection?.point instanceof Vector3
				? cellsIntersection.point
				: (lastPosition ?? VECTOR),
			["x", "z"]
		);

		this.setPiecePosition(piece, {
			...cellPosition,
			y:
				(instancedPiece?.geometry.boundingBox?.max.y ||
					cellsIntersection?.point.y ||
					0.5) + 0.5
		});
	}

	public handlePieceDeselected(payload: PieceNotificationPayload) {
		const { piece, cell, endCoord, startCoord } = payload;

		this.setPieceCoord(piece, endCoord ?? cell?.coord ?? startCoord);
	}

	public updateGroupGeometry<Type extends PieceType, Color extends ColorSide>(
		color: Color,
		key: Type,
		geometry: InstancedPieceModel<Type, Color>["geometry"]
	) {
		const group = this.groups[color][key as PieceType];

		if (!(group instanceof InstancedPieceModel)) return;

		group.geometry = geometry;
		group.resetPhysics(this._physics);
	}

	public updateGroupsGeometries() {
		[ColorSide.black, ColorSide.white].forEach((color) => {
			Object.keys(this.groups[color]).forEach((key) => {
				const geometry = this._resourcesService.getPieceGeometry(
					key as PieceType
				);

				this.updateGroupGeometry(color, key as PieceType, geometry);
			});
		});
	}
}
