import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";
import { PlayersModule } from "./players/players.module";

@singleton()
export class CoreModule implements Module {
	constructor(
		@inject(PlayersModule) public readonly playerModule: PlayersModule
	) {}

	init(...props: any[]): void {
		this.playerModule.init(...props);
	}

	dispose(): void {
		throw new Error("Method not implemented.");
	}
}
