import { inject, singleton } from "tsyringe";
import { BufferGeometry } from "three";
import { Physics } from "@chess-d/rapier-physics";

import {
	PiecesGroupModel,
	PiecesGroups,
	PieceType,
	ColorVariant,
	BOARD_MATRIX_RANGE_SIZE
} from "../../shared";
import { BoardComponent } from "../chess-board/board.component";
import { ResourceComponent } from "../resource/resource.component";

@singleton()
export class PiecesComponent {
	public groups?: PiecesGroups;

	constructor(
		@inject(BoardComponent)
		private readonly BoardComponent: BoardComponent,
		@inject(ResourceComponent)
		private readonly resourceComponent: ResourceComponent,
		@inject(Physics) private readonly _physics: Physics
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

			group.setPieceCoords(piece.id, this.BoardComponent.mesh, {
				col: isBlack ? index : BOARD_MATRIX_RANGE_SIZE - 1 - index,
				row: isBlack ? 1 : BOARD_MATRIX_RANGE_SIZE - 2
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
			group.setPieceCoords(piece.id, this.BoardComponent.mesh, {
				col: isBlack
					? index === 0
						? 0
						: BOARD_MATRIX_RANGE_SIZE - 1
					: index === 0
						? BOARD_MATRIX_RANGE_SIZE - 1
						: 0,
				row: isBlack ? 0 : BOARD_MATRIX_RANGE_SIZE - 1
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

			group.setPieceCoords(piece.id, this.BoardComponent.mesh, {
				col: isBlack
					? index === 0
						? 1
						: BOARD_MATRIX_RANGE_SIZE - 2
					: index === 0
						? BOARD_MATRIX_RANGE_SIZE - 2
						: 1,
				row: isBlack ? 0 : BOARD_MATRIX_RANGE_SIZE - 1
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

			group.setPieceCoords(piece.id, this.BoardComponent.mesh, {
				col: isBlack
					? index === 0
						? 2
						: BOARD_MATRIX_RANGE_SIZE - 3
					: index === 0
						? BOARD_MATRIX_RANGE_SIZE - 3
						: 2,
				row: isBlack ? 0 : BOARD_MATRIX_RANGE_SIZE - 1
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

			group.setPieceCoords(piece.id, this.BoardComponent.mesh, {
				col: isBlack ? 3 : BOARD_MATRIX_RANGE_SIZE - 4,
				row: isBlack ? 0 : BOARD_MATRIX_RANGE_SIZE - 1
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

			group.setPieceCoords(piece.id, this.BoardComponent.mesh, {
				col: isBlack ? 4 : BOARD_MATRIX_RANGE_SIZE - 5,
				row: isBlack ? 0 : BOARD_MATRIX_RANGE_SIZE - 1
			});
		});

		return group;
	}

	public createGroup<Type extends PieceType, Color extends ColorVariant>(
		type: Type,
		color: Color,
		count: number,
		geometry: BufferGeometry,
		pieces?: PiecesGroupModel<Type, Color>["pieces"]
	) {
		const group = new PiecesGroupModel(type, color, count, geometry, pieces);
		group.initPhysics(this._physics);

		return group;
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
}
