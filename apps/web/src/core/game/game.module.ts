import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";

import { PlayersModule } from "./players/players.module";

@singleton()
export class GameModule implements Module {
	constructor(@inject(PlayersModule) public readonly players: PlayersModule) {}

	public init(...props: any[]): void {
		this.players.init(...props);
	}

	public dispose(): void {
		this.players.dispose();
	}
}
