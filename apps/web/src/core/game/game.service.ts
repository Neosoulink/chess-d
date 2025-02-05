import { ObservablePayload } from "@chess-d/shared";
import { AppModule } from "@quick-threejs/reactive";
import { Vector2Like } from "three";
import { singleton } from "tsyringe";

@singleton()
export class GameService {
	public cursor: Vector2Like = { x: 0, y: 0 };

	constructor() {}

	updateCursorPosition(
		payload: ObservablePayload<
			ReturnType<Exclude<AppModule["mousemove$"], undefined>>
		>
	) {
		this.cursor = {
			x: (payload.clientX / payload.width) * 2 - 1,
			y: -(payload.clientY / payload.height) * 2 + 1
		};
	}
}
