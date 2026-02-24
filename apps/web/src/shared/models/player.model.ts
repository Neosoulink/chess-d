import { ColorSide, type PlayerEntity } from "@chess-d/shared";
import { Subject } from "rxjs";

import { PlayerMessagePayload } from "../types";

export class PlayerModel
	extends Subject<PlayerMessagePayload>
	implements PlayerEntity
{
	public color = ColorSide.black;

	public id?: string | undefined;
	public host?: boolean | undefined;
	public connectedAt?: number | undefined;

	public setEntity(player: PlayerEntity): void {
		this.color = player.color;
		this.id = player.id;
		this.host = player.host;
		this.connectedAt = player.connectedAt;
	}

	public getEntity(): PlayerEntity {
		return {
			color: this.color,
			id: this.id,
			host: this.host,
			connectedAt: this.connectedAt
		};
	}
}
