import { ChessboardModule } from "@chess-d/chessboard";
import { ObservablePayload } from "@chess-d/shared";
import { Observable, share } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { WorldController } from "../world.controller";
import { PiecesController } from "../chessboard/pieces/pieces.controller";

@scoped(Lifecycle.ContainerScoped)
export class HandsController {
	public readonly reset$: Observable<
		ObservablePayload<WorldController["resetDone$$"]>
	>;
	public readonly step$: WorldController["step$"];
	public readonly pieceSelected$?: Observable<
		ObservablePayload<
			ReturnType<ChessboardModule["pieces"]["getPieceSelected$"]>
		>
	>;
	public readonly pieceMoving$?: Observable<
		ObservablePayload<ReturnType<ChessboardModule["pieces"]["getPieceMoving$"]>>
	>;
	public readonly animatedPlayerMovedPiece$: Observable<
		ObservablePayload<PiecesController["animatedPlayerMovedPiece$"]>
	>;
	public readonly pieceDeselected$?: Observable<
		ObservablePayload<
			ReturnType<ChessboardModule["pieces"]["getPieceDeselected$"]>
		>
	>;
	constructor(
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(WorldController)
		private readonly _worldController: WorldController,
		@inject(PiecesController)
		private readonly _piecesController: PiecesController
	) {
		this.reset$ = this._worldController.resetDone$$.pipe(share());
		this.step$ = this._worldController.step$;
		this.pieceSelected$ = this._chessboard.pieces
			.getPieceSelected$()
			?.pipe(share());
		this.pieceMoving$ = this._chessboard.pieces
			.getPieceMoving$()
			?.pipe(share());
		this.animatedPlayerMovedPiece$ =
			this._piecesController.animatedPlayerMovedPiece$?.pipe(share());
		this.pieceDeselected$ = this._chessboard.pieces
			.getPieceDeselected$()
			?.pipe(share());
	}
}
