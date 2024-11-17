import { useCallback, useState } from "react";
import { RegisterModule } from "@quick-threejs/reactive";

import { MessageEventPayload, MoveLike } from "../types";
import { PIECE_MOVED_TOKEN } from "../tokens";

/** @description Provide actions to control game (chessboard). */
export const useActions = () => {
	const [app, setApp] = useState<RegisterModule | undefined>();

	const setup = useCallback((app: RegisterModule) => {
		setApp(app);
	}, []);

	const movePiece = (move: MoveLike) => {
		app?.worker()?.postMessage?.({
			token: PIECE_MOVED_TOKEN,
			value: move
		} satisfies MessageEventPayload<MoveLike>);
	};

	return {
		setup,
		movePiece
	};
};
