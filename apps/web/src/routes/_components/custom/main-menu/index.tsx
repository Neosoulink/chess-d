import { FC, useCallback, useEffect } from "react";
import { useLocation } from "react-router";

import { MainMenuSection } from "../../../../shared/enum";
import { stopEventPropagation } from "../../../../shared/utils";
import { useMainMenuStore } from "../../../_stores";
import { NewGameSection } from "./new-section.component";
import { MainSection } from "./main-section.component";
import { NewGameSimulationSection } from "./new-section-simulation.component";
import { NewGameAISection } from "./new-section-ai.component";
import { NewGameHumanSection } from "./new-section-human.component";
import { Button, Modal } from "../../core";
import { Icon } from "../../core/icon";

export interface MainMenuProps {}

export const MainMenu: FC<MainMenuProps> = () => {
	const location = useLocation();

	const { isOpen, currentSection, open, close } = useMainMenuStore();

	const handleEscPress = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === "Escape" && isOpen) close();
			if (event.key === "Escape" && !isOpen) open();
		},
		[isOpen, close, open]
	);

	const renderSection = useCallback(() => {
		switch (currentSection) {
			case MainMenuSection.newGame:
				return <NewGameSection />;
			case MainMenuSection.newGameAI:
				return <NewGameAISection />;
			case MainMenuSection.newGameHuman:
				return <NewGameHumanSection />;
			case MainMenuSection.newGameSimulation:
				return <NewGameSimulationSection />;
			default:
				return <MainSection />;
		}
	}, [currentSection]);

	useEffect(() => close(), [close, location]);

	useEffect(() => {
		document.addEventListener("keydown", handleEscPress);
		return () => document.removeEventListener("keydown", handleEscPress);
	}, [handleEscPress]);

	return (
		<>
			<Button className="fixed top-12 right-12" onClick={() => open()}>
				<Icon.Menu size={32} />
			</Button>

			<Modal show={!!isOpen} onClick={close}>
				<div onClick={stopEventPropagation} className=" relative w-fit h-fit">
					{renderSection()}
				</div>
			</Modal>
		</>
	);
};
