import { AppModule, Module } from "@quick-threejs/reactive";
import { CoreModule as Chessboard } from "@chess-d/chessboard";
import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";

import { HandService } from "./hands.service";
import { PiecesController } from "../pieces/pieces.controller";
@singleton()
export class HandModule implements Module {
	private readonly _subscriptions: (Subscription | undefined)[] = [];
	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(Chessboard) private readonly _chessboard: Chessboard,
		@inject(HandService) private readonly _service: HandService,
		@inject(PiecesController)
		private readonly _piecesController: PiecesController
	) {
		this._subscriptions.push(
			this._app.timer.step$().subscribe(({ deltaTime }) => {
				this._service.update(deltaTime);
			}),
			this._chessboard.pieces.controller.pieceSelected$?.subscribe(
				this._service.handlePieceSelected.bind(this._service)
			),
			this._chessboard.pieces.controller.pieceMoving$?.subscribe(
				this._service.handlePieceMoving.bind(this._service)
			),
			this._piecesController.animatedPlayerMovedPiece$?.subscribe(
				this._service.handleAnimatedPlayerMovedPiece.bind(this._service)
			),
			this._chessboard.pieces.controller.pieceDeselected$?.subscribe(
				this._service.handlePieceDeselected.bind(this._service)
			)
		);
	}

	init(): void {
		this._service.init();
	}

	dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
	}
}
