import { register, RegisterModule } from "@quick-threejs/reactive";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";

import { useGameStore } from "../_stores";
import { FreeModeComponent } from "./_components/free-mode.component";
import { getGameModeFromUrl } from "../../shared/utils";
import { useSearchParams } from "react-router";
import { GameMode } from "../../shared/enum";
import { WithAIComponent } from "./_components/with-ai.component";

/** @internal */
const workerLocation = new URL(
	"../../core/game/game.worker.ts",
	import.meta.url
) as unknown as string;

export const PlayRoute: FC = () => {
	const { app, setApp } = useGameStore();
	const [searchParams] = useSearchParams();
	const gameMode = useMemo(
		() => getGameModeFromUrl(searchParams),
		[searchParams]
	);

	const state = useRef<{
		isPending: boolean;
		isReady: boolean;
	}>({ isPending: false, isReady: false });

	const init = useCallback(
		() =>
			new Promise<RegisterModule>((resolve) => {
				if (state.current.isPending || state.current.isReady) return;
				state.current.isPending = true;

				register({
					location: workerLocation,
					enableDebug: !!import.meta.env?.DEV,
					axesSizes: 5,
					gridSizes: 10,
					withMiniCamera: true,
					onReady: (_app) => {
						state.current.isPending = false;
						state.current.isReady = true;

						resolve(_app);
					}
				});
			}),
		[]
	);

	const dispose = useCallback(() => {
		if (state.current.isPending || !state.current.isReady) return;

		state.current.isPending = false;
		state.current.isReady = false;

		app?.dispose();

		setApp(undefined);
	}, [app, setApp]);

	const renderGameMode = useCallback(() => {
		switch (gameMode) {
			case GameMode.ai:
				return <WithAIComponent />;

			default:
				return <FreeModeComponent />;
		}
	}, [gameMode]);

	useEffect(() => {
		if (!app) init().then(setApp);

		return () => {
			if (app) dispose();
		};
	}, [app, init, dispose, setApp]);

	if (!app) return null;

	return renderGameMode();
};
