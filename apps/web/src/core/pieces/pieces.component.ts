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
	BoardCoord
} from "../../shared";
import { BoardComponent } from "../board/board.component";
import { ResourceComponent } from "../resource/resource.component";

@singleton()
export class PiecesComponent {
	public groups?: PiecesGroups;

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

		Object.keys(group.pieces).forEach((id, index) => {
			const piece = group.pieces[parseInt(id)];
			if (!piece) return;
			const isBlack = piece.color === ColorVariant.black;

			group.setPieceCoord(piece.id, this.boardComponent.instancedCell, {
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

		Object.keys(group.pieces).forEach((id, index) => {
			const piece = group.pieces[parseInt(id)];
			if (!piece) return;
			const isBlack = piece.color === ColorVariant.black;
			group.setPieceCoord(piece.id, this.boardComponent.instancedCell, {
				col: index === 0 ? 0 : BOARD_MATRIX_RANGE_SIZE - 1,
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

		Object.keys(group.pieces).forEach((id, index) => {
			const piece = group.pieces[parseInt(id)];
			if (!piece) return;
			const isBlack = piece.color === ColorVariant.black;

			group.setPieceCoord(piece.id, this.boardComponent.instancedCell, {
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

	private _initKnights<Color extends ColorVariant>(color: Color) {
		const group = this.createGroup(
			PieceType.knight,
			color,
			2,
			this.resourceComponent.getGeometryByPieceType(PieceType.knight)
		);

		Object.keys(group.pieces).forEach((id, index) => {
			const piece = group.pieces[parseInt(id)];
			if (!piece) return;
			const isBlack = piece.color === ColorVariant.black;

			group.setPieceCoord(piece.id, this.boardComponent.instancedCell, {
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

		Object.keys(group.pieces).forEach((id) => {
			const piece = group.pieces[parseInt(id)];
			if (!piece) return;
			const isBlack = piece.color === ColorVariant.black;

			group.setPieceCoord(piece.id, this.boardComponent.instancedCell, {
				col: isBlack ? BOARD_MATRIX_RANGE_SIZE - 4 : 3,
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

		Object.keys(group.pieces).forEach((id) => {
			const piece = group.pieces[parseInt(id)];
			if (!piece) return;
			const isBlack = piece.color === ColorVariant.black;

			group.setPieceCoord(piece.id, this.boardComponent.instancedCell, {
				col: isBlack ? BOARD_MATRIX_RANGE_SIZE - 5 : 4,
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
		this.groups = {
			[ColorVariant.black]: {
				[PieceType.pawn]: this._initPawns(ColorVariant.black),
				[PieceType.rock]: this._initRocks(ColorVariant.black),
				[PieceType.bishop]: this._initBishops(ColorVariant.black),
				[PieceType.knight]: this._initKnights(ColorVariant.black),
				[PieceType.queen]: this._initQueens(ColorVariant.black),
				[PieceType.king]: this._initKings(ColorVariant.black)
			},
			[ColorVariant.white]: {
				[PieceType.pawn]: this._initPawns(ColorVariant.white),
				[PieceType.rock]: this._initRocks(ColorVariant.white),
				[PieceType.bishop]: this._initBishops(ColorVariant.white),
				[PieceType.knight]: this._initKnights(ColorVariant.white),
				[PieceType.queen]: this._initQueens(ColorVariant.white),
				[PieceType.king]: this._initKings(ColorVariant.white)
			}
		};
	}

	public movePieceByPosition<
		Type extends PieceType,
		Color extends ColorVariant
	>(piece: MatrixPieceModel<Type, Color>, position: Vector3Like) {
		this.groups?.[piece.color]?.[piece.type]?.setPiecePosition(
			piece.id,
			position
		);
	}

	public movePieceByCoord<Type extends PieceType, Color extends ColorVariant>(
		piece: MatrixPieceModel<Type, Color>,
		coord: BoardCoord
	) {
		this.groups?.[piece.color]?.[piece.type]?.setPieceCoord(
			piece.id,
			this.boardComponent.instancedCell,
			coord
		);
	}

	public dropPiece<Type extends PieceType, Color extends ColorVariant>(
		piece: MatrixPieceModel<Type, Color>
	): MatrixPieceModel<Type, Color> | undefined {
		const piecesGroup = this.groups?.[piece.color]?.[piece.type];
		const pieces = piecesGroup?.pieces;

		if (!pieces || !pieces[piece.id]) return;

		const newGroup = piecesGroup.dropPiece(
			piece.id,
			this.physics
		) as unknown as InstancedPieceModel<Type, Color> | undefined;

		if (!newGroup) return;

		this.setGroupType(piece.type, piece.color, newGroup);

		return pieces[piece.id] as MatrixPieceModel<Type, Color> | undefined;
	}
}
