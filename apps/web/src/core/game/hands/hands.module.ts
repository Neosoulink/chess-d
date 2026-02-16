import { Module } from "@quick-threejs/reactive";
import { AppModule } from "@quick-threejs/reactive/worker";
import { ChessboardModule } from "@chess-d/chessboard";
import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";

import { HandService } from "./hands.service";
import { PiecesController } from "../pieces/pieces.controller";

@singleton()
export class HandModule implements Module {
	private readonly _subscriptions: (Subscription | undefined)[] = [];
	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(HandService) private readonly _service: HandService,
		@inject(PiecesController)
		private readonly _piecesController: PiecesController
	) {
		this._subscriptions.push(
			this._app.timer.step$().subscribe(({ delta }) => {
				this._service.update(delta);
			}),
			this._chessboard.pieces
				.getPieceSelected$()
				?.subscribe(this._service.handlePieceSelected.bind(this._service)),
			this._chessboard.pieces
				.getPieceMoving$()
				?.subscribe(this._service.handlePieceMoving.bind(this._service)),
			this._piecesController.animatedPlayerMovedPiece$?.subscribe(
				this._service.handleAnimatedPlayerMovedPiece.bind(this._service)
			),
			this._chessboard.pieces
				.getPieceDeselected$()
				?.subscribe(this._service.handlePieceDeselected.bind(this._service))
		);
	}

	init(): void {
		this._service.setup();
	}

	dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
	}
}
