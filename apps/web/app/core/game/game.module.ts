import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";

import { EngineModule } from "./engine/engine.module";
import { PiecesModule } from "./pieces/pieces.module";

@singleton()
export class GameModule implements Module {
	constructor(
		@inject(EngineModule) public readonly engine: EngineModule,
		@inject(PiecesModule) public readonly pieces: PiecesModule
	) {}

	public init(): void {
		this.engine.init();
		this.pieces.init();
	}

	public dispose(): void {
		this.engine.dispose();
		this.pieces.dispose();
	}
}
