import { ColorSide, type PlayerEntity } from "@chess-d/shared";
import { Subject } from "rxjs";

import { PlayerMessagePayload } from "../types";

export class PlayerModel
	extends Subject<PlayerMessagePayload>
	implements PlayerEntity
{
	color = ColorSide.black;

	id?: string | undefined;
	host?: boolean | undefined;
	connectedAt?: number | undefined;

	setIdentity(player: PlayerEntity): void {
		this.color = player.color as ColorSide;
		this.id = player.id;
		this.host = player.host;
		this.connectedAt = player.connectedAt;
	}
}
