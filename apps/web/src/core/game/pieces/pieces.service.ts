import {
	CoreModule as ChessCoreModule,
	InstancedPieceModel,
	MatrixPieceModel
} from "@chess-d/chessboard";
import {
	BOARD_RANGE_CELLS_HALF_SIZE,
	ColorSide,
	DEFAULT_FEN,
	ObservablePayload,
	PieceType,
	squareToCoord
} from "@chess-d/shared";
import { Move } from "chess.js";
import { gsap } from "gsap";
import { inject, singleton } from "tsyringe";
import { HandService } from "../hands/hands.service";
import { Vector3Like } from "three";
import { PiecesController } from "./pieces.controller";

@singleton()
export class PiecesService {
	public readonly timeline = gsap.timeline();

	constructor(
		@inject(ChessCoreModule) private readonly _chessboard: ChessCoreModule,
		@inject(HandService) private readonly _handService: HandService
	) {}

	public reset(fen = DEFAULT_FEN) {
		this._chessboard.pieces.component.reInit(fen);
		this.timeline.clear();
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
				this.timeline.clear();
			}
		}
	}

	public handleAnimatedPlayerMovedPiece(
		payload: ObservablePayload<PiecesController["animatedPlayerMovedPiece$"]>
	) {
		const { start, piece, position, move, end } = payload;

		if (start) this.resetPieces();

		this._chessboard.pieces.component.movePieceByPosition(piece, position);

		if (end) this.handlePlayerMovedPiece(move);
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

		piece.physics?.rigidBody.setBodyType(0, true);
		piece.physics?.collider.setMass(1);

		this._chessboard.pieces.controller.pieceDeselected$$.next({
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
}
