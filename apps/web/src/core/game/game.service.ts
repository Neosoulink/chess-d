import { ObservablePayload } from "@chess-d/shared";
import { AppModule } from "@quick-threejs/reactive/worker";
import { Vector2Like } from "three";
import { inject, Lifecycle, scoped } from "tsyringe";

import { GAME_RESET_TOKEN } from "../../shared/tokens";
import { GameResetState, MessageData } from "../../shared/types";

@scoped(Lifecycle.ContainerScoped)
export class GameService {
	public readonly cursor = { x: 0, y: 0 } satisfies Vector2Like;

	constructor(@inject(AppModule) private readonly _app: AppModule) {}

	public updateCursorPosition(
		payload: ObservablePayload<
			ReturnType<Exclude<AppModule["mousemove$"], undefined>>
		>
	) {
		const pixelRatio = this._app.sizes.pixelRatio();

		this.cursor.x = (payload.clientX / payload.windowWidth) * 2 - 1;
		this.cursor.y = -(payload.clientY / payload.windowHeight) * 2 + 1;
	}

	public reset(value?: GameResetState) {
		self.postMessage({ token: GAME_RESET_TOKEN, value } satisfies MessageData);
	}
}
