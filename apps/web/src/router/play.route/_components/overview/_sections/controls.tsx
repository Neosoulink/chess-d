import { FC, useCallback } from "react";

import { MAIN_MENU_SECTIONS } from "@/shared/constants";
import { useGameStore, useMainMenuStore } from "@/router/_stores";
import { Icon } from "@/router/_components/core";
import { GameOverviewButton } from "../_components/button";

export const GameOverviewControls: FC = () => {
	const { undoMove, redoMove } = useGameStore();
	const { setOpen, setSections } = useMainMenuStore();

	const openSaveMenu = useCallback(() => {
		setOpen(true);
		setSections(MAIN_MENU_SECTIONS.saveGame);
	}, [setOpen, setSections]);

	return (
		<div className="flex gap-1 items-center justify-center">
			<GameOverviewButton onClick={undoMove}>
				<Icon.ActionUndo />
			</GameOverviewButton>

			<GameOverviewButton onClick={redoMove}>
				<Icon.ActionRedo />
			</GameOverviewButton>

			<GameOverviewButton>
				<Icon.Hint />
			</GameOverviewButton>

			<GameOverviewButton onClick={openSaveMenu}>
				<Icon.Save />
			</GameOverviewButton>
		</div>
	);
};
