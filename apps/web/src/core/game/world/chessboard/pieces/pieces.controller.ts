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
import { Chess, Move } from "chess.js";
import { gsap } from "gsap";
import { Vector3Like } from "three";
import {
	filter,
	fromEvent,
	map,
	merge,
	Observable,
	share,
	switchMap
} from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { MessageData } from "../../../../../shared/types";
import { PIECE_WILL_MOVE_TOKEN } from "../../../../../shared/tokens";
import { GameController } from "../../../game.controller";
import { EngineController } from "../../../engine/engine.controller";

@scoped(Lifecycle.ContainerScoped)
export class PiecesController {
	public readonly reset$: Observable<string>;
	public readonly promoted$?: Observable<
		ObservablePayload<
			ReturnType<ChessboardModule["pieces"]["getPiecePromoted$"]>
		>
	>;
	public readonly playerMovedPiece$: Observable<Move>;
	public readonly animatedPlayerMovedPiece$: Observable<{
		start?: boolean;
		pieceHeight: number;
		piece: MatrixPieceModel;
		position: Vector3Like;
		move: Move;
		end?: boolean;
	}>;

	constructor(
		@inject(Chess)
		private readonly _game: Chess,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(GameController) private readonly _gameController: GameController,
		@inject(EngineController)
		private readonly _engineController: EngineController
	) {
		this.reset$ = merge(
			this._gameController.reset$.pipe(map(() => undefined)),
			this._engineController.undo$.pipe(map(() => undefined)),
			this._engineController.redo$.pipe(map(() => undefined))
		).pipe(
			map(() => this._game.fen()),
			share()
		);
		this.promoted$ = this._chessboard.pieces.getPiecePromoted$()?.pipe(share());
		this.playerMovedPiece$ = fromEvent<MessageEvent<MessageData<Move>>>(
			self,
			"message"
		).pipe(
			filter(
				(payload) =>
					payload.data.token === PIECE_WILL_MOVE_TOKEN &&
					!!payload.data.value?.to
			),
			map((payload) => payload.data!.value!),
			share()
		);

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

						gsap.to(payload.position, {
							duration: 0.5,
							x: cell.position.x + BOARD_RANGE_CELLS_HALF_SIZE,
							y: cell.position.y + pieceHeight,
							z: cell.position.z - BOARD_RANGE_CELLS_HALF_SIZE,
							onStart: () => {
								subscriber.next({ ...payload, start: true });
							},
							onUpdate: () => subscriber.next(payload),
							onComplete: () => {
								subscriber.next({ ...payload, end: true });
								subscriber.complete();
							}
						});
					})
			),
			share()
		);
	}
}
