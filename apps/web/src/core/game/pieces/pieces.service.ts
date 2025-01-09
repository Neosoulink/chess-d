import {
	CoreModule as ChessCoreModule,
	InstancedPieceModel,
	MatrixPieceModel
} from "@chess-d/chessboard";
import {
	ColorSide,
	DEFAULT_FEN,
	PieceType,
	squareToCoord
} from "@chess-d/shared";
import { Move } from "chess.js";
import { inject, singleton } from "tsyringe";

@singleton()
export class PiecesService {
	constructor(
		@inject(ChessCoreModule) private readonly _chessboard: ChessCoreModule
	) {}

	public reset(fen = DEFAULT_FEN) {
		this._chessboard.pieces.component.reInit(fen);
	}

	public resetPieces() {
		for (const color of [ColorSide.white, ColorSide.black]) {
			for (const pieceType of [
				PieceType.bishop,
				PieceType.king,
				PieceType.knight,
				PieceType.pawn,
				PieceType.queen,
				PieceType.rook
			]) {
				const group = this._chessboard.pieces.component.groups[color][
					pieceType
				] as InstancedPieceModel;
				for (const piece of group.pieces) {
					piece.physics?.rigidBody.setBodyType(1, false);
					group.setPieceCoord(
						piece.instanceId,
						this._chessboard.board.component.instancedCell,
						piece.coord
					);
				}
			}
		}
	}

	public handlePlayerMovedPiece(move: Move) {
		const piece = this._chessboard.pieces.component.getPieceByCoord(
			move.piece as PieceType,
			move.color as ColorSide,
			squareToCoord(move.from)
		);
		if (!(piece instanceof MatrixPieceModel)) return;

		const instancedPiece = this._chessboard.pieces.component.groups[
			piece.color
		][piece.type] as InstancedPieceModel;
		const pieceGeometry = this._chessboard.resource.component.getGeometryByType(
			piece.type
		);

		const cell = this._chessboard.board.component.instancedCell.getCellByCoord(
			squareToCoord(move.to)
		)!;
		const startCoord = squareToCoord(move.from);
		const endCoord = squareToCoord(move.to);

		this._chessboard.pieces.controller.pieceDeselected$$.next({
			piece,
			cell,
			startPosition: piece.position,
			startCoord,
			startSquare: move.from,
			endCoord,
			endSquare: move.to,
			colorSide: ColorSide.black,
			instancedPiece,
			pieceGeometry
		});
	}
}
