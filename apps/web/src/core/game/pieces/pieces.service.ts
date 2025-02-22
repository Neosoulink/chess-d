import {
	ChessboardModule,
	InstancedPieceModel,
	MatrixPieceModel
} from "@chess-d/chessboard";
import {
	ColorSide,
	DEFAULT_FEN,
	ObservablePayload,
	PieceType,
	squareToCoord
} from "@chess-d/shared";
import { Move } from "chess.js";
import { inject, singleton } from "tsyringe";

import { PiecesController } from "./pieces.controller";

@singleton()
export class PiecesService {
	constructor(
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule
	) {}

	public reset(fen = DEFAULT_FEN) {
		this._chessboard.pieces.reset(fen);
	}

	public resetPieces() {
		for (const color of [ColorSide.white, ColorSide.black]) {
			for (const pieceType of Object.values(PieceType).filter(
				(type) => type.length === 1
			)) {
				const group = this._chessboard.pieces.getGroups()[color][
					pieceType
				] as InstancedPieceModel;
				for (const piece of group.pieces || []) {
					piece.physics?.rigidBody.setBodyType(1, false);
					group.setPieceCoord(
						piece.instanceId,
						this._chessboard.board.getInstancedCell(),
						piece.coord
					);
				}
			}
		}
	}

	public handleAnimatedPlayerMovedPiece(
		payload: ObservablePayload<PiecesController["animatedPlayerMovedPiece$"]>
	) {
		const { start, piece, position, move, end } = payload;

		if (start) this.resetPieces();

		this._chessboard.pieces.setPiecePosition(piece, position);

		if (end) this.handlePlayerMovedPiece(move);
	}

	public handlePlayerMovedPiece(move: Move) {
		const piece = this._chessboard.pieces.getPieceByCoord(
			move.piece as PieceType,
			move.color as ColorSide,
			squareToCoord(move.from)
		);
		if (!(piece instanceof MatrixPieceModel)) return;

		const instancedPiece = this._chessboard.pieces.getGroups()[piece.color][
			piece.type
		] as InstancedPieceModel;
		const pieceGeometry = this._chessboard.resources.getPieceGeometry(
			piece.type
		);

		const cell = this._chessboard.board
			.getInstancedCell()
			.getCellByCoord(squareToCoord(move.to))!;
		const startCoord = squareToCoord(move.from);
		const endCoord = squareToCoord(move.to);

		piece.physics?.rigidBody.setBodyType(0, true);
		piece.physics?.collider.setMass(1);

		this._chessboard.pieces.getPieceDeselected$$().next({
			piece,
			cell,
			startPosition: piece.position,
			startCoord,
			startSquare: move.from,
			endCoord,
			endSquare: move.to,
			colorSide: piece.color as ColorSide,
			instancedPiece,
			pieceGeometry
		});
	}

	public handlePiecePromoted(
		data: ObservablePayload<
			ReturnType<ChessboardModule["pieces"]["getPiecePromoted$"]>
		>
	) {
		const { piece, toPiece } = data;
		const promotedPiece = this._chessboard.pieces.getPieceByCoord(
			toPiece,
			piece.color,
			piece.coord
		);

		promotedPiece?.physics?.rigidBody.setBodyType(0, true);
		promotedPiece?.physics?.collider.setMass(1);
	}
}
