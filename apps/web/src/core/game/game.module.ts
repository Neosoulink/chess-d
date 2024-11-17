import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";

import { EngineModule } from "./engine/engine.module";
import { PlayersModule } from "./players/players.module";

@singleton()
export class GameModule implements Module {
	constructor(
		@inject(EngineModule) public readonly engine: EngineModule,
		@inject(PlayersModule) public readonly players: PlayersModule
	) {}

	public init(...props: any[]): void {
		this.engine.init();
		this.players.init(...props);
	}

	public dispose(): void {
		this.engine.dispose();
		this.players.dispose();
	}
}
