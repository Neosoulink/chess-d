import {
	ChessboardModule,
	InstancedPieceModel,
	MatrixPieceModel
} from "@chess-d/chessboard";
import {
	BOARD_RANGE_CELLS_HALF_SIZE,
	ColorSide,
	ObservablePayload,
	PieceType,
	squareToCoord
} from "@chess-d/shared";
import { Move } from "chess.js";
import { gsap } from "gsap";
import { Vector3Like } from "three";
import { filter, fromEvent, map, Observable, share, switchMap } from "rxjs";
import { inject, singleton } from "tsyringe";

import { MessageEventPayload } from "../../../shared/types";
import { PIECE_WILL_MOVE_TOKEN } from "../../../shared/tokens";

@singleton()
export class PiecesController {
	public readonly playerMovedPiece$: Observable<Move> = fromEvent<
		MessageEvent<MessageEventPayload<Move>>
	>(self, "message").pipe(
		filter(
			(payload) =>
				payload.data.token === PIECE_WILL_MOVE_TOKEN && !!payload.data.value?.to
		),
		map((payload) => payload.data!.value!)
	);
	public readonly animatedPlayerMovedPiece$: Observable<{
		start?: boolean;
		pieceHeight: number;
		piece: MatrixPieceModel;
		position: Vector3Like;
		move: Move;
		end?: boolean;
	}>;

	constructor(
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule
	) {
		this.animatedPlayerMovedPiece$ = this.playerMovedPiece$?.pipe(
			map((move) => {
				const piece = this._chessboard.pieces.getPieceByCoord(
					move.piece as PieceType,
					move.color as ColorSide,
					squareToCoord(move.from)
				)!;
				const piecesGroup = this._chessboard.pieces.getGroups()[piece.color][
					piece.type
				] as InstancedPieceModel;
				const pieceHeight =
					(piecesGroup.geometry.boundingBox?.max.y || 0) -
						(piecesGroup.geometry.boundingBox?.min.y || 0) || 0.5;

				return { pieceHeight, piece, move };
			}),
			filter((payload) => !!payload?.piece),
			switchMap(
				({ move, piece, pieceHeight }) =>
					new Observable<
						ObservablePayload<PiecesController["animatedPlayerMovedPiece$"]>
					>((subscriber) => {
						const cell = this._chessboard.board
							.getInstancedCell()
							.getCellByCoord(squareToCoord(move.to))!;
						const payload: ObservablePayload<
							PiecesController["animatedPlayerMovedPiece$"]
						> = {
							move,
							piece,
							pieceHeight,
							position: piece?.position.clone() || {
								x: 0,
								y: 0,
								z: 0
							}
						};

						subscriber.next({ ...payload, start: true });

						gsap
							.to(payload.position, {
								duration: 0.5,
								x: cell.position.x + BOARD_RANGE_CELLS_HALF_SIZE,
								y: cell.position.y + pieceHeight,
								z: cell.position.z - BOARD_RANGE_CELLS_HALF_SIZE,
								onUpdate: () => subscriber.next(payload)
							})
							.then(() => {
								subscriber.next({ ...payload, end: true });
								subscriber.complete();
							});
					})
			),
			share()
		);
	}
}
