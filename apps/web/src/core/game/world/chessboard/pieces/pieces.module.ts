import { ChessboardModule as ChessboardModuleBase } from "@chess-d/chessboard";
import { Module } from "@quick-threejs/reactive";
import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";

import { PiecesService } from "./pieces.service";
import { PiecesController } from "./pieces.controller";
import { EngineController } from "../../../engine/engine.controller";

@singleton()
export class PiecesModule implements Module {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(PiecesService) private readonly _service: PiecesService,
		@inject(PiecesController) private readonly _controller: PiecesController,
		@inject(ChessboardModuleBase)
		private readonly _chessboard: ChessboardModuleBase,
		@inject(EngineController)
		private readonly _engineController: EngineController
	) {
		this._subscriptions.push(
			this._controller.resetFen$?.subscribe((fen) =>
				this._service.resetFen(fen)
			),
			this._controller.reset$?.subscribe(() => this._service.reset()),
			this._chessboard.pieces
				.getPieceDropped$()
				?.subscribe(this._service.resetMaterials.bind(this._service)),
			this._chessboard.pieces
				.getPiecePromoted$()
				?.subscribe(this._service.resetMaterials.bind(this._service)),
			this._engineController.undo$.subscribe(
				this._service.resetMaterials.bind(this._service)
			),
			this._engineController.redo$.subscribe(
				this._service.resetMaterials.bind(this._service)
			),
			this._controller.animatedPlayerMovedPiece$?.subscribe(
				this._service.handleAnimatedPlayerMovedPiece.bind(this._service)
			),
			this._controller.promoted$?.subscribe(
				this._service.handlePiecePromoted.bind(this._service)
			)
		);
	}

	public init(): void {}

	public dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this._subscriptions = [];
	}
}
