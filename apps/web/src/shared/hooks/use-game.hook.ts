import { useCallback, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { register, RegisterModule } from "@quick-threejs/reactive";

/** @description Game login worker location. */
const workerLocation = new URL(
	"../../core/game/game.worker.ts",
	import.meta.url
) as unknown as string;

/** @description Provide resources about the chess game and the application logic. */
export const useGame = () => {
	const game = useMemo(() => new Chess(), []);

	const [app, setApp] = useState<RegisterModule | undefined>();
	const [isAppReady, setIsAppReady] = useState(false);

	const setup = useCallback(
		() =>
			register({
				location: workerLocation,
				enableDebug: !!import.meta.env?.DEV,
				axesSizes: 5,
				gridSizes: 10,
				withMiniCamera: true,
				onReady: (_app) => {
					setApp(_app);
					setIsAppReady(true);
				}
			}),
		[]
	);

	return { game, app, workerLocation, isAppReady, setup };
};
