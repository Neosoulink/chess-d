import { RegisterModule } from "@quick-threejs/reactive";
import { useCallback, useState } from "react";
import { MoveLike } from "../types";

/** @description Provide actions to control game (chessboard). */
export const useActions = () => {
	const [app, setApp] = useState<RegisterModule | undefined>();

	const setup = useCallback((app: RegisterModule) => {
		setApp(app);
	}, []);

	const movePiece = (move: MoveLike) => {
		app?.worker()?.postMessage?.({
			type: "piece_moved",
			payload: move
		});
	};

	return {
		setup,
		movePiece
	};
};
