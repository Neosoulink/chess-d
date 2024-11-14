import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";

import { PlayersService } from "./players.service";
import { PlayersController } from "./players.controller";
import { MoveLike } from "../../../shared/types/chess";

@singleton()
export class PlayersModule implements Module {
	constructor(
		@inject(PlayersService) public readonly service: PlayersService,
		@inject(PlayersController) public readonly controller: PlayersController
	) {}

	public init(...props: any[]): void {
		self.addEventListener("message", this._onMessage.bind(this));

		this.controller.pieceMoved$$.subscribe(
			this.service.movePiece.bind(this.service)
		);
	}

	public dispose(): void {
		throw new Error("Method not implemented.");
	}

	private _onMessage(e: MessageEvent<{ type: string; payload: MoveLike }>) {
		const move = e.data.payload;

		if ((e.data?.type as string) === "piece_moved" && move?.to)
			this.controller.pieceMoved$$.next(move);
	}
}
