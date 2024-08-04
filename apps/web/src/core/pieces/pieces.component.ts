import { inject, singleton } from "tsyringe";

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
		private readonly resourceComponent: ResourceComponent
	) {}

	private _initPawns<Color extends ColorVariant>(color: Color) {
		const group = new PiecesGroupModel(
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

			piece.setCoords(this.chessBoardComponent.board, {
				col: isBlack
					? index
					: this.chessBoardComponent.cellsRangeCount - 1 - index,
				row: isBlack ? 1 : this.chessBoardComponent.cellsRangeCount - 2
			});
		});

		return group;
	}

	private _initRocks<Color extends ColorVariant>(color: Color) {
		const group = new PiecesGroupModel(
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
			piece.setCoords(this.chessBoardComponent.board, {
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
		const group = new PiecesGroupModel(
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

			piece.setCoords(this.chessBoardComponent.board, {
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
		const group = new PiecesGroupModel(
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

			piece.setCoords(this.chessBoardComponent.board, {
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
		const group = new PiecesGroupModel(
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

			piece.setCoords(this.chessBoardComponent.board, {
				col: isBlack ? 3 : this.chessBoardComponent.cellsRangeCount - 4,
				row: isBlack ? 0 : this.chessBoardComponent.cellsRangeCount - 1
			});
		});

		return group;
	}

	private _initKings<Color extends ColorVariant>(color: Color) {
		const group = new PiecesGroupModel(
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

			piece.setCoords(this.chessBoardComponent.board, {
				col: isBlack ? 4 : this.chessBoardComponent.cellsRangeCount - 5,
				row: isBlack ? 0 : this.chessBoardComponent.cellsRangeCount - 1
			});
		});

		return group;
	}

	public initPieces() {
		this.groups = {
			[ColorVariant.black]: {
				pawns: this._initPawns(ColorVariant.black),
				rocks: this._initRocks(ColorVariant.black),
				bishops: this._initBishops(ColorVariant.black),
				knights: this._initKnights(ColorVariant.black),
				queens: this._initQueens(ColorVariant.black),
				kings: this._initKings(ColorVariant.black)
			},
			[ColorVariant.white]: {
				pawns: this._initPawns(ColorVariant.white),
				rocks: this._initRocks(ColorVariant.white),
				bishops: this._initBishops(ColorVariant.white),
				knights: this._initKnights(ColorVariant.white),
				queens: this._initQueens(ColorVariant.white),
				kings: this._initKings(ColorVariant.white)
			}
		};
	}
}
