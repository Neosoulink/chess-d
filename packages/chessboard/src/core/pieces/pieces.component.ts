import { inject, singleton } from "tsyringe";
import { Vector3, Vector3Like } from "three";
import { AppModule } from "@quick-threejs/reactive";
import { copyProperties } from "@quick-threejs/utils";
import {
	BoardCoord,
	ColorSide,
	ExtendedPieceSymbol,
	fenToCoords,
	PieceType
} from "@chess-d/shared";
import { Physics } from "@chess-d/rapier-physics";

import {
	InstancedPieceModel,
	PiecesGroups,
	MatrixPieceModel,
	DroppedPiecesGroups,
	INITIAL_FEN_TOKEN,
	PieceNotificationPayload,
	VECTOR
} from "../../shared";
import { BoardComponent } from "../board/board.component";
import { ResourceComponent } from "../resource/resource.component";
import { WorldComponent } from "../world/world.component";

@singleton()
export class PiecesComponent {
	public readonly groups: PiecesGroups = {
		[ColorSide.white]: {},
		[ColorSide.black]: {}
	};
	public readonly droppedGroups: DroppedPiecesGroups = {
		[ColorSide.white]: {},
		[ColorSide.black]: {}
	};

	constructor(
		@inject(INITIAL_FEN_TOKEN) private readonly initialFen: string,
		@inject(AppModule) private readonly app: AppModule,
		@inject(Physics) private readonly physics: Physics,
		@inject(WorldComponent) private readonly worldComponent: WorldComponent,
		@inject(BoardComponent) private readonly boardComponent: BoardComponent,
		@inject(ResourceComponent)
		private readonly resourceComponent: ResourceComponent
	) {}

	public createGroup<Type extends PieceType, Color extends ColorSide>(
		type: Type,
		color: Color,
		coords: BoardCoord[],
		pieces?: InstancedPieceModel<Type, Color>["pieces"]
	) {
		const group = new InstancedPieceModel(
			type,
			color,
			coords.length,
			this.resourceComponent.getGeometryByPieceType(type),
			pieces
		);

		coords.forEach((coord, instanceId) => {
			group.setPieceCoord(instanceId, this.boardComponent.instancedCell, coord);
		});

		group.initPhysics(this.physics);

		return group;
	}

	public setGroup<Type extends PieceType, Color extends ColorSide>(
		newGroup: InstancedPieceModel<Type, Color>
	): InstancedPieceModel<Type, Color> | undefined {
		// @ts-ignore <unsupported never type>
		this.groups[newGroup.piecesColor][newGroup.piecesType] = newGroup;

		return this.groups[newGroup.piecesColor][
			newGroup.piecesType
		] as unknown as typeof newGroup;
	}

	public initialize(fen = this.initialFen) {
		const fenCoords = fenToCoords(fen);

		if (fenCoords)
			[ColorSide.black, ColorSide.white].forEach((color) => {
				const pieceCoords = fenCoords[color]!;
				Object.keys(pieceCoords).forEach((_pieceType) => {
					const coords = pieceCoords[_pieceType as ExtendedPieceSymbol];
					const pieceType = _pieceType.toLowerCase() as PieceType;
					const newGroup = this.createGroup(pieceType, color, coords ?? []);

					this.setGroup(newGroup);
					this.droppedGroups[color][pieceType] = [];
				});
			});

		[...Object.keys(this.groups[ColorSide.black])].forEach((key) => {
			const group = this.groups?.[ColorSide.black][key as PieceType];

			if (group instanceof InstancedPieceModel)
				this.worldComponent.scene.add(group);
		});

		[...Object.keys(this.groups[ColorSide.white])].forEach((key) => {
			const group = this.groups?.[ColorSide.white][key as PieceType];

			if (group instanceof InstancedPieceModel)
				this.worldComponent.scene.add(group);
		});
	}

	public reInitialize(fen = this.initialFen) {
		[ColorSide.black, ColorSide.white].forEach((color) => {
			Object.keys(this.groups[color]).forEach((key) => {
				const group = this.groups[color][key as PieceType];

				if (!(group instanceof InstancedPieceModel)) return;

				group.dispose(this.physics);
				delete this.groups[color][key as PieceType];
			});
			console.log("is Second part of the code???", color);

			Object.keys(this.droppedGroups[color]).forEach((key) => {
				const group = this.droppedGroups[color][key as PieceType];

				group?.forEach((piece) => {
					if (piece instanceof MatrixPieceModel) piece.dispose();
				});

				this.droppedGroups[color][key as PieceType] = [];
			});
		});

		this.initialize(fen);
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

	public movePieceByPosition<Type extends PieceType, Color extends ColorSide>(
		piece: MatrixPieceModel<Type, Color>,
		position: Vector3Like
	) {
		this.groups?.[piece.color]?.[piece.type]?.setPiecePosition(
			piece.instanceId,
			position
		);
	}

	public movePieceByCoord<Type extends PieceType, Color extends ColorSide>(
		piece: MatrixPieceModel<Type, Color>,
		coord: BoardCoord
	) {
		this.groups?.[piece.color]?.[piece.type]?.setPieceCoord(
			piece.instanceId,
			this.boardComponent.instancedCell,
			coord
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
			this.physics
		) as unknown as InstancedPieceModel<Type, Color> | undefined;

		if (!newGroup) return undefined;

		this.setGroup(newGroup);

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

		const newGroup = promotedPieceGroup.addPiece(newPiece, this.physics);
		if (!newGroup) return;

		this.setGroup(newGroup);
	}

	public handlePieceMoving(payload: PieceNotificationPayload) {
		const { cellsIntersection, piece, lastPosition } = payload;

		this.movePieceByPosition(piece, {
			...copyProperties(
				cellsIntersection?.point instanceof Vector3
					? cellsIntersection.point
					: (lastPosition ?? VECTOR),
				["x", "z"]
			),
			y: 0.8
		});
	}

	public handlePieceDeselected(payload: PieceNotificationPayload) {
		const { piece, cell, endCoord, startCoord } = payload;

		this.movePieceByCoord(piece, endCoord ?? cell?.coord ?? startCoord);
	}
}
