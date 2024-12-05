import { ColorSide, type PlayerEntity } from "@chess-d/shared";
import { Subject } from "rxjs";

import { PlayerMessagePayload } from "../types";

export class PlayerModel
	extends Subject<PlayerMessagePayload>
	implements PlayerEntity
{
	color = ColorSide.black;
}
