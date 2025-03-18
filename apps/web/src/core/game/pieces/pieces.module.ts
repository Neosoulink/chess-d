import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";
import { Module } from "@quick-threejs/reactive";

import { PiecesService } from "./pieces.service";
import { PiecesController } from "./pieces.controller";
import { EngineController } from "../engine/engine.controller";
import { GameController } from "../game.controller";
import { Chess } from "chess.js";
import { ChessboardModule } from "@chess-d/chessboard";

@singleton()
export class PiecesModule implements Module {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(Chess) private readonly _game: Chess,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(PiecesService) private readonly _service: PiecesService,
		@inject(PiecesController) private readonly _controller: PiecesController,
		@inject(GameController) private readonly _gameController: GameController,
		@inject(EngineController)
		private readonly _engineController: EngineController
	) {
		this._subscriptions.push(
			this._controller.animatedPlayerMovedPiece$?.subscribe(
				this._service.handleAnimatedPlayerMovedPiece.bind(this._service)
			),
			this._engineController.undo$?.subscribe(() =>
				this._service.reset(this._game.fen())
			),
			this._gameController.reset$.subscribe(() =>
				this._service.reset(this._game.fen())
			),
			this._engineController.redo$?.subscribe(() =>
				this._service.reset(this._game.fen())
			),
			this._chessboard.pieces
				.getPiecePromoted$()
				?.subscribe(this._service.handlePiecePromoted.bind(this._service))
		);
	}

	public init(): void {}

	public dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this._subscriptions = [];
	}
}
