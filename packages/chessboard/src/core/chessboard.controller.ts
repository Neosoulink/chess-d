import { Subject } from "rxjs";
import { Vector2Like } from "three";
import { singleton } from "tsyringe";

@singleton()
export class ChessboardController {
	public readonly update$$ = new Subject<{
		cursor: Vector2Like;
		timestep: number;
	}>();
}
