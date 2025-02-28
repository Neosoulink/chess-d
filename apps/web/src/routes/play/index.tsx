import { FC, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import {
	FreeModeComponent,
	WithAIComponent,
	WithHumanComponent
} from "./_components";
import { GameMode } from "../../shared/enum";
import { getGameModeFromUrl } from "../../shared/utils";
import { useGameStore } from "../_stores";

export const PlayRoute: FC = () => {
	const { app, isResourcesLoaded } = useGameStore();
	const [searchParams] = useSearchParams();
	const gameMode = useMemo(
		() => getGameModeFromUrl(searchParams),
		[searchParams]
	);

	const renderGameMode = useCallback(() => {
		if (gameMode === GameMode.ai || gameMode === GameMode.simulation)
			return <WithAIComponent />;

		if (gameMode === GameMode.human) return <WithHumanComponent />;

		return <FreeModeComponent />;
	}, [gameMode]);

	if (!app || !isResourcesLoaded) return null;

	return renderGameMode();
};
