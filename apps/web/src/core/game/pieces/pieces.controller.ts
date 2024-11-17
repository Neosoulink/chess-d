import { singleton } from "tsyringe";
import { Subject } from "rxjs";

import { MoveLike } from "../../../shared/types/chess.type";

@singleton()
export class PiecesController {
	public readonly pieceMoved$$ = new Subject<MoveLike>();
}
