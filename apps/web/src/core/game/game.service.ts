import { ObservablePayload } from "@chess-d/shared";
import { AppModule } from "@quick-threejs/reactive";
import { Vector2Like } from "three";
import { singleton } from "tsyringe";

import { GAME_RESET_TOKEN } from "../../shared/tokens";
import { MessageData } from "../../shared/types";
import { GameController } from "./game.controller";

@singleton()
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

	public reset(value?: ObservablePayload<GameController["reset$"]>) {
		self.postMessage({
			token: GAME_RESET_TOKEN,
			value
		} satisfies MessageData);
	}
}
