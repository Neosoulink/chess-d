import { ObservablePayload } from "@chess-d/shared";
import { AppModule } from "@quick-threejs/reactive/worker";
import { Vector2Like } from "three";
import { Lifecycle, scoped } from "tsyringe";

import { GAME_RESET_TOKEN } from "../../shared/tokens";
import { GameResetState, MessageData } from "../../shared/types";

@scoped(Lifecycle.ContainerScoped)
export class GameService {
	public readonly cursor = { x: 0, y: 0 } satisfies Vector2Like;

	public updateCursorPosition(
		payload: ObservablePayload<
			ReturnType<Exclude<AppModule["mousemove$"], undefined>>
		>
	) {
		this.cursor.x = (payload.clientX / payload.width) * 2 - 1;
		this.cursor.y = -(payload.clientY / payload.height) * 2 + 1;
	}

	public reset(value?: GameResetState) {
		self.postMessage({ token: GAME_RESET_TOKEN, value } satisfies MessageData);
	}
}
