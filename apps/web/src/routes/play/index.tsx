import {
	ContainerizedApp,
	register,
	RegisterModule
} from "@quick-threejs/reactive";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { GameMode } from "../../shared/enum";
import { getGameModeFromUrl } from "../../shared/utils";
import { useGameStore } from "../_stores";
import {
	FreeModeComponent,
	WithAIComponent,
	WithHumanComponent
} from "./_components";

/** @internal */
const workerLocation = new URL(
	"../../core/game/game.worker.ts",
	import.meta.url
) as unknown as string;

export const PlayRoute: FC = () => {
	const { app, setApp } = useGameStore();
	const [localApp, setLocalApp] = useState<ContainerizedApp<RegisterModule>>();
	const [searchParams] = useSearchParams();
	const gameMode = useMemo(
		() => getGameModeFromUrl(searchParams),
		[searchParams]
	);

	const state = useRef<{
		isPending: boolean;
		isReady: boolean;
	}>({ isPending: false, isReady: false });

	const init = useCallback(async () => {
		if (state.current.isPending || state.current.isReady) return;
		state.current.isPending = true;

		console.log("Initializing game...");

		register({
			location: workerLocation,
			enableDebug: !!import.meta.env?.DEV,
			axesSizes: 5,
			gridSizes: 10,
			withMiniCamera: true,
			onReady: (_app) => {
				state.current.isPending = false;
				state.current.isReady = true;

				setApp(_app);
				setLocalApp(_app);
			}
		});
	}, [setApp]);

	const dispose = useCallback(async () => {
		if (state.current.isPending || !state.current.isReady) return;

		await localApp?.container?.dispose();

		state.current.isPending = false;
		state.current.isReady = false;

		setLocalApp(undefined);

		console.log("Game disposed...");
	}, [localApp]);

	const renderGameMode = useCallback(() => {
		if (gameMode === GameMode.ai || gameMode === GameMode.simulation)
			return <WithAIComponent />;

		if (gameMode === GameMode.human) return <WithHumanComponent />;

		return <FreeModeComponent />;
	}, [gameMode]);

	useEffect(() => {
		if (!localApp) init();

		return () => {
			if (app && localApp) dispose();
		};
	}, [app, init, dispose, localApp]);

	if (!app) return null;

	return renderGameMode();
};
