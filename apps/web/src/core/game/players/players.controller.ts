import { singleton } from "tsyringe";
import { Subject } from "rxjs";

import { MoveLike } from "../../../shared/types/chess";

@singleton()
export class PlayersController {
	public readonly pieceMoved$$ = new Subject<MoveLike>();
}
