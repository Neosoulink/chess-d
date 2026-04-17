import { FC, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

import { getGameModeFromUrl } from "@/shared/utils";
import { GameMode } from "@/shared/enum";
import { MAIN_MENU_SECTIONS } from "@/shared/constants";
import { useGameStore, useMainMenuStore } from "@/router/_stores";
import { Icon } from "@/router/_components/core";
import { GameOverviewButton } from "../_components/button";
import { GameOverviewHintButton } from "../_components/hint-button";

export const GameOverviewControls: FC = () => {
	const { undoMove, redoMove } = useGameStore();
	const { setOpen, setSections } = useMainMenuStore();
	const [searchParams] = useSearchParams();

	const gameMode = useMemo(
		() => getGameModeFromUrl(searchParams),
		[searchParams]
	);

	const openSaveMenu = useCallback(() => {
		setOpen(true);
		setSections(MAIN_MENU_SECTIONS.saveGame);
	}, [setOpen, setSections]);

	return (
		<div className="flex gap-1 items-center justify-center">
			{gameMode !== GameMode.multiplayer && (
				<>
					<GameOverviewButton onClick={undoMove}>
						<Icon.ActionUndo />
					</GameOverviewButton>

					<GameOverviewButton onClick={redoMove}>
						<Icon.ActionRedo />
					</GameOverviewButton>

					{gameMode !== GameMode.simulation && <GameOverviewHintButton />}
				</>
			)}

			<GameOverviewButton onClick={openSaveMenu}>
				<Icon.Save />
			</GameOverviewButton>
		</div>
	);
};
