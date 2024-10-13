import { inject, singleton } from "tsyringe";
import { Vector3Like } from "three";
import { Physics } from "@chess-d/rapier-physics";

import {
	InstancedPieceModel,
	PiecesGroups,
	PieceType,
	ColorVariant,
	MatrixPieceModel,
	BoardCoord,
	DroppedPiecesGroups
} from "../../shared";
import { EngineComponent } from "../engine/engine.component";
import { BoardComponent } from "../board/board.component";
import { ResourceComponent } from "../resource/resource.component";

@singleton()
export class PiecesComponent {
	public readonly groups: PiecesGroups = {
		[ColorVariant.white]: {},
		[ColorVariant.black]: {}
	};
	public readonly droppedGroups: DroppedPiecesGroups = {
		[ColorVariant.white]: {},
		[ColorVariant.black]: {}
	};

	constructor(
		@inject(EngineComponent)
		private readonly engineComponent: EngineComponent,
		@inject(BoardComponent)
		private readonly boardComponent: BoardComponent,
		@inject(ResourceComponent)
		private readonly resourceComponent: ResourceComponent,
		@inject(Physics) private readonly physics: Physics
	) {}

	public createGroup<Type extends PieceType, Color extends ColorVariant>(
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

	public setGroup<Type extends PieceType, Color extends ColorVariant>(
		newGroup: InstancedPieceModel<Type, Color>
	): InstancedPieceModel<Type, Color> | undefined {
		// @ts-ignore <unsupported never type>
		this.groups[newGroup.piecesColor][newGroup.piecesType] = newGroup;

		return this.groups[newGroup.piecesColor][
			newGroup.piecesType
		] as unknown as typeof newGroup;
	}

	public initPieces() {
		const fenCoords = this.engineComponent.getFenCoords();

		if (fenCoords)
			[ColorVariant.black, ColorVariant.white].forEach((color) => {
				const pieceCoords = fenCoords[color];
				Object.keys(pieceCoords).forEach((_pieceType) => {
					const coords = pieceCoords[_pieceType];
					const pieceType = _pieceType.toLowerCase() as PieceType;

					const newGroup = this.createGroup(pieceType, color, coords ?? []);

					this.setGroup(newGroup);
					this.droppedGroups[color][pieceType] = [];
				});
			});
	}

	public getPieceByCoord<Type extends PieceType, Color extends ColorVariant>(
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

	public movePieceByPosition<
		Type extends PieceType,
		Color extends ColorVariant
	>(piece: MatrixPieceModel<Type, Color>, position: Vector3Like) {
		this.groups?.[piece.color]?.[piece.type]?.setPiecePosition(
			piece.instanceId,
			position
		);
	}

	public movePieceByCoord<Type extends PieceType, Color extends ColorVariant>(
		piece: MatrixPieceModel<Type, Color>,
		coord: BoardCoord
	) {
		this.groups?.[piece.color]?.[piece.type]?.setPieceCoord(
			piece.instanceId,
			this.boardComponent.instancedCell,
			coord
		);
	}

	public dropPiece<Type extends PieceType, Color extends ColorVariant>(
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

	public promotePiece<Color extends ColorVariant, ToType extends PieceType>(
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
}
