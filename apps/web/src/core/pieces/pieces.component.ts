import { inject, singleton } from "tsyringe";
import { BufferGeometry } from "three";
import { Physics } from "@chess-d/rapier-physics";

import {
	PiecesGroupModel,
	PiecesGroups,
	PieceType,
	ColorVariant
} from "../../common";
import { ChessBoardComponent } from "../chess-board/chess-board.component";
import { ResourceComponent } from "../resource/resource.component";

@singleton()
export class PiecesComponent {
	public groups?: PiecesGroups;

	constructor(
		@inject(ChessBoardComponent)
		private readonly chessBoardComponent: ChessBoardComponent,
		@inject(ResourceComponent)
		private readonly resourceComponent: ResourceComponent,
		@inject(Physics) private readonly _physics: Physics
	) {}

	private _initPawns<Color extends ColorVariant>(color: Color) {
		const group = this.createGroup(
			PieceType.pawn,
			color,
			this.chessBoardComponent.cellsRangeCount,
			this.resourceComponent.getGeometryByPieceType(PieceType.pawn)
		);
		group.position.copy(this.chessBoardComponent.board.position);

		Object.keys(group.pieces).forEach((pieceKey, index) => {
			const piece = group.pieces[parseInt(pieceKey)];
			if (!piece) return;
			const isBlack = piece.color === ColorVariant.black;

			group.setPieceCoords(piece.id, this.chessBoardComponent.board, {
				col: isBlack
					? index
					: this.chessBoardComponent.cellsRangeCount - 1 - index,
				row: isBlack ? 1 : this.chessBoardComponent.cellsRangeCount - 2
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
		group.position.copy(this.chessBoardComponent.board.position);

		Object.keys(group.pieces).forEach((pieceKey, index) => {
			const piece = group.pieces[parseInt(pieceKey)];
			if (!piece) return;
			const isBlack = piece.color === ColorVariant.black;
			group.setPieceCoords(piece.id, this.chessBoardComponent.board, {
				col: isBlack
					? index === 0
						? 0
						: this.chessBoardComponent.cellsRangeCount - 1
					: index === 0
						? this.chessBoardComponent.cellsRangeCount - 1
						: 0,
				row: isBlack ? 0 : this.chessBoardComponent.cellsRangeCount - 1
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
		group.position.copy(this.chessBoardComponent.board.position);

		Object.keys(group.pieces).forEach((pieceKey, index) => {
			const piece = group.pieces[parseInt(pieceKey)];
			if (!piece) return;
			const isBlack = piece.color === ColorVariant.black;

			group.setPieceCoords(piece.id, this.chessBoardComponent.board, {
				col: isBlack
					? index === 0
						? 1
						: this.chessBoardComponent.cellsRangeCount - 2
					: index === 0
						? this.chessBoardComponent.cellsRangeCount - 2
						: 1,
				row: isBlack ? 0 : this.chessBoardComponent.cellsRangeCount - 1
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
		group.position.copy(this.chessBoardComponent.board.position);

		Object.keys(group.pieces).forEach((pieceKey, index) => {
			const piece = group.pieces[parseInt(pieceKey)];
			if (!piece) return;
			const isBlack = piece.color === ColorVariant.black;

			group.setPieceCoords(piece.id, this.chessBoardComponent.board, {
				col: isBlack
					? index === 0
						? 2
						: this.chessBoardComponent.cellsRangeCount - 3
					: index === 0
						? this.chessBoardComponent.cellsRangeCount - 3
						: 2,
				row: isBlack ? 0 : this.chessBoardComponent.cellsRangeCount - 1
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
		group.position.copy(this.chessBoardComponent.board.position);

		Object.keys(group.pieces).forEach((pieceKey) => {
			const piece = group.pieces[parseInt(pieceKey)];
			if (!piece) return;
			const isBlack = piece.color === ColorVariant.black;

			group.setPieceCoords(piece.id, this.chessBoardComponent.board, {
				col: isBlack ? 3 : this.chessBoardComponent.cellsRangeCount - 4,
				row: isBlack ? 0 : this.chessBoardComponent.cellsRangeCount - 1
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
		group.position.copy(this.chessBoardComponent.board.position);

		Object.keys(group.pieces).forEach((pieceKey) => {
			const piece = group.pieces[parseInt(pieceKey)];
			if (!piece) return;
			const isBlack = piece.color === ColorVariant.black;

			group.setPieceCoords(piece.id, this.chessBoardComponent.board, {
				col: isBlack ? 4 : this.chessBoardComponent.cellsRangeCount - 5,
				row: isBlack ? 0 : this.chessBoardComponent.cellsRangeCount - 1
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
		return new PiecesGroupModel(
			this._physics,
			type,
			color,
			count,
			geometry,
			pieces
		);
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
