import { ChessboardModule as ChessboardModuleBase } from "@chess-d/chessboard";
import { Module } from "@quick-threejs/reactive";
import { Subscription } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { ChessboardController } from "./chessboard.controller";
import { ChessboardService } from "./chessboard.service";
import { PiecesModule } from "./pieces/pieces.module";
import { EngineController } from "../../engine/engine.controller";
import { MessageData } from "@/shared/types";
import { PIECE_BOARD_COLLISION_TOKEN } from "@/shared/tokens";
import {
	BOARD_CELL_SIZE,
	BOARD_RANGE_CELLS_HALF_SIZE,
	squareToCoord
} from "@chess-d/shared";

@scoped(Lifecycle.ContainerScoped)
export class ChessboardModule implements Module {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(ChessboardController)
		private readonly _controller: ChessboardController,
		@inject(ChessboardService)
		private readonly _service: ChessboardService,
		@inject(PiecesModule) private readonly _pieces: PiecesModule,
		@inject(ChessboardModuleBase)
		private readonly _chessboard: ChessboardModuleBase,
		@inject(EngineController)
		private readonly _engineController: EngineController
	) {
		this._subscriptions.push(
			this._controller.reset$.subscribe(
				this._service.reset.bind(this._service)
			),
			this._controller.cursorCoord$?.subscribe((position) => {
				if (!position) return (this._service.cursorCoordMarker.visible = false);

				this._service.cursorCoordMarker.visible = true;
				this._service.cursorCoordMarker.position.copy(position).add({
					x: 0,
					y: 0.06,
					z: 0
				});

				return true;
			}),
			this._controller.settingsUpdate$?.subscribe(
				this._service.resetVisual.bind(this._service)
			),
			this._chessboard.pieces
				.getPieceDropped$()
				?.subscribe(this._service.resetVisual.bind(this._service)),
			this._chessboard.pieces
				.getPiecePromoted$()
				?.subscribe(this._service.resetVisual.bind(this._service)),
			this._chessboard.getPieceCollidedBoard$().subscribe((value) =>
				self.postMessage({
					token: PIECE_BOARD_COLLISION_TOKEN,
					value
				} satisfies MessageData)
			),
			this._controller.hintMarker$?.subscribe(
				this._service.setHintMarker.bind(this._service)
			),
			this._engineController.undo$.subscribe(
				this._service.resetVisual.bind(this._service)
			),
			this._engineController.redo$.subscribe(
				this._service.resetVisual.bind(this._service)
			),
			this._engineController.goToMove$.subscribe(
				this._service.resetVisual.bind(this._service)
			),
			this._controller.resetMarkers$.subscribe(
				this._service.resetMarkers.bind(this._service)
			)
		);
	}

	public init(): void {
		this._pieces.init();
	}

	public dispose(): void {
		this._pieces.dispose();

		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this._subscriptions = [];
	}
}
