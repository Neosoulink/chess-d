import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";
import { PlayersService } from "./players.service";

@singleton()
export class PlayersModule implements Module {
	constructor(
		@inject(PlayersService) public readonly playerService: PlayersService
	) {}

	init(...props: any[]): void {
		throw new Error("Method not implemented.");
	}

	dispose(): void {
		throw new Error("Method not implemented.");
	}
}
