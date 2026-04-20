import { FC, useMemo } from "react";
import { useSearchParams } from "react-router";

import { PlayChat, PlayOverview, PlaySummary } from "./_components";
import { PlayModeAI, PlayModeFree, PlayModeMultiplayer } from "./_modes";
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

	if (!app || !isResourcesLoaded) return null;

	return (
		<>
			{gameMode !== GameMode.simulation && <PlayChat />}
			<PlayOverview />
			<PlaySummary />

			{gameMode === GameMode.ai || gameMode === GameMode.simulation ? (
				<PlayModeAI />
			) : gameMode === GameMode.multiplayer ? (
				<PlayModeMultiplayer />
			) : (
				<PlayModeFree />
			)}
		</>
	);
};
