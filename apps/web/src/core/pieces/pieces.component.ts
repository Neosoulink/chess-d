import { inject, singleton } from "tsyringe";
import { BufferGeometry, Vector3Like } from "three";
import { Physics } from "@chess-d/rapier-physics";

import {
	InstancedPieceModel,
	PiecesGroups,
	PieceType,
	ColorVariant,
	BOARD_MATRIX_RANGE_SIZE,
	MatrixPieceModel,
	BoardCoord,
	DroppedPiecesGroups
} from "../../shared";
import { BoardComponent } from "../board/board.component";
import { ResourceComponent } from "../resource/resource.component";

@singleton()
export class PiecesComponent {
	public groups?: PiecesGroups;
	public droppedGroups?: DroppedPiecesGroups;

	constructor(
		@inject(BoardComponent)
		private readonly boardComponent: BoardComponent,
		@inject(ResourceComponent)
		private readonly resourceComponent: ResourceComponent,
		@inject(Physics) private readonly physics: Physics
	) {}

	private _initPawns<Color extends ColorVariant>(color: Color) {
		const group = this.createGroup(
			PieceType.pawn,
			color,
			BOARD_MATRIX_RANGE_SIZE,
			this.resourceComponent.getGeometryByPieceType(PieceType.pawn)
		);
		const isBlack = color === ColorVariant.black;

		group.pieces.forEach((piece, index) => {
			group.setPieceCoord(piece.instanceId, this.boardComponent.instancedCell, {
				col: isBlack ? BOARD_MATRIX_RANGE_SIZE - 1 - index : index,
				row: isBlack ? BOARD_MATRIX_RANGE_SIZE - 2 : 1
			});
		});

		return group;
	}

	private _initRocks<Color extends ColorVariant>(color: Color) {
		const group = this.createGroup(
			PieceType.rock,
			color,
			2,
			this.resourceComponent.getGeometryByPieceType(PieceType.rock)
		);
		const isBlack = color === ColorVariant.black;

		group.pieces.forEach((piece, index) => {
			group.setPieceCoord(piece.instanceId, this.boardComponent.instancedCell, {
				col: index === 0 ? 0 : BOARD_MATRIX_RANGE_SIZE - 1,
				row: isBlack ? BOARD_MATRIX_RANGE_SIZE - 1 : 0
			});
		});

		return group;
	}

	private _initKnights<Color extends ColorVariant>(color: Color) {
		const group = this.createGroup(
			PieceType.knight,
			color,
			2,
			this.resourceComponent.getGeometryByPieceType(PieceType.knight)
		);
		const isBlack = color === ColorVariant.black;

		group.pieces.forEach((piece, index) => {
			group.setPieceCoord(piece.instanceId, this.boardComponent.instancedCell, {
				col: isBlack
					? index === 0
						? BOARD_MATRIX_RANGE_SIZE - 2
						: 1
					: index === 0
						? 1
						: BOARD_MATRIX_RANGE_SIZE - 2,
				row: isBlack ? BOARD_MATRIX_RANGE_SIZE - 1 : 0
			});
		});

		return group;
	}

	private _initBishops<Color extends ColorVariant>(color: Color) {
		const group = this.createGroup(
			PieceType.bishop,
			color,
			2,
			this.resourceComponent.getGeometryByPieceType(PieceType.bishop)
		);
		const isBlack = color === ColorVariant.black;

		group.pieces.forEach((piece, index) => {
			group.setPieceCoord(piece.instanceId, this.boardComponent.instancedCell, {
				col: isBlack
					? index === 0
						? BOARD_MATRIX_RANGE_SIZE - 3
						: 2
					: index === 0
						? 2
						: BOARD_MATRIX_RANGE_SIZE - 3,
				row: isBlack ? BOARD_MATRIX_RANGE_SIZE - 1 : 0
			});
		});

		return group;
	}

	private _initQueens<Color extends ColorVariant>(color: Color) {
		const group = this.createGroup(
			PieceType.queen,
			color,
			1,
			this.resourceComponent.getGeometryByPieceType(PieceType.queen)
		);
		const isBlack = color === ColorVariant.black;

		group.pieces.forEach((piece) => {
			group.setPieceCoord(piece.instanceId, this.boardComponent.instancedCell, {
				col: 3,
				row: isBlack ? BOARD_MATRIX_RANGE_SIZE - 1 : 0
			});
		});

		return group;
	}

	private _initKings<Color extends ColorVariant>(color: Color) {
		const group = this.createGroup(
			PieceType.king,
			color,
			1,
			this.resourceComponent.getGeometryByPieceType(PieceType.king)
		);
		const isBlack = color === ColorVariant.black;

		group.pieces.forEach((piece) => {
			group.setPieceCoord(piece.instanceId, this.boardComponent.instancedCell, {
				col: 4,
				row: isBlack ? BOARD_MATRIX_RANGE_SIZE - 1 : 0
			});
		});

		return group;
	}

	public createGroup<Type extends PieceType, Color extends ColorVariant>(
		type: Type,
		color: Color,
		count: number,
		geometry: BufferGeometry,
		pieces?: InstancedPieceModel<Type, Color>["pieces"]
	) {
		const group = new InstancedPieceModel(type, color, count, geometry, pieces);
		group.initPhysics(this.physics);

		return group;
	}

	public setGroupType<Type extends PieceType, Color extends ColorVariant>(
		type: Type,
		color: Color,
		newGroup: InstancedPieceModel<Type, Color>
	): InstancedPieceModel<Type, Color> | undefined {
		if (!(this.groups?.[color][type] instanceof InstancedPieceModel)) return;

		// @ts-ignore <unsupported never type>
		this.groups[color][type] = newGroup;

		return this.groups[color][type] as unknown as typeof newGroup;
	}

	public initPieces() {
		const createGroup = <C extends ColorVariant = ColorVariant>(color: C) => ({
			[PieceType.pawn]: this._initPawns(color),
			[PieceType.rock]: this._initRocks(color),
			[PieceType.knight]: this._initKnights(color),
			[PieceType.bishop]: this._initBishops(color),
			[PieceType.queen]: this._initQueens(color),
			[PieceType.king]: this._initKings(color)
		});

		const createDroppedGroup = () => ({
			[PieceType.pawn]: [],
			[PieceType.rock]: [],
			[PieceType.knight]: [],
			[PieceType.bishop]: [],
			[PieceType.queen]: [],
			[PieceType.king]: []
		});

		this.groups = {
			[ColorVariant.black]: createGroup(ColorVariant.black),
			[ColorVariant.white]: createGroup(ColorVariant.white)
		};

		this.droppedGroups = {
			[ColorVariant.black]: createDroppedGroup(),
			[ColorVariant.white]: createDroppedGroup()
		};
	}

	public getPieceByCoord<Type extends PieceType, Color extends ColorVariant>(
		pieceGroup: Type,
		pieceColor: Color,
		coord: BoardCoord
	): MatrixPieceModel<Type, Color> | undefined {
		const group = this.groups?.[pieceColor]?.[pieceGroup];
		const pieceId = Object.keys(group?.pieces ?? {}).find((id) => {
			const piece = group?.pieces[parseInt(id)];

			if (
				group &&
				piece &&
				piece.coord.col === coord.col &&
				piece.coord.row === coord.row
			)
				return true;

			return false;
		});

		if (!group || !pieceId) return undefined;

		return group.pieces[parseInt(pieceId)] as unknown as MatrixPieceModel<
			Type,
			Color
		>;
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

		this.setGroupType(piece.type, piece.color, newGroup);

		return piece;
	}

	public promotePiece<Color extends ColorVariant, ToType extends PieceType>(
		piece: MatrixPieceModel<PieceType.pawn, Color>,
		toPiece: ToType
	) {
		const promotedPieceGroup = this.groups?.[piece.color]?.[
			toPiece
		] as unknown as InstancedPieceModel<ToType, Color>;
		const droppedPiecesGroup =
			this.droppedGroups?.[piece.color]?.[PieceType.pawn];
		const droppedPiece = this.dropPiece(piece);

		if (!droppedPiece || !droppedPiecesGroup || !promotedPieceGroup) return;

		const newPiece = new MatrixPieceModel(
			toPiece,
			piece.color,
			piece.instanceId,
			piece.type
		);

		promotedPieceGroup.createPiece(newPiece, this.physics);
		droppedPiecesGroup.push(droppedPiece);
	}
}
