import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";
import { Module } from "@quick-threejs/reactive";

import { EngineService } from "./engine.service";
import { EngineController } from "./engine.controller";

@singleton()
export class EngineModule implements Module {
	private subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(EngineController) private readonly controller: EngineController,
		@inject(EngineService) private readonly service: EngineService
	) {}

	public init() {
		this.subscriptions.push(
			this.controller.pieceSelected$?.subscribe(
				this.service.handlePieceSelected.bind(this.service)
			),
			this.controller.pieceMoved$?.subscribe(
				this.service.handlePieceMoved.bind(this.service)
			)
		);
	}

	public dispose() {
		this.subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this.subscriptions = [];
	}
}
