import { FC, useCallback, useEffect } from "react";
import { useLocation } from "react-router";

import { MainMenuSection } from "../../../../shared/enum";
import { stopEventPropagation } from "../../../../shared/utils";
import { useMainMenuStore } from "../../../_stores";
import { NewGameSection } from "./new-section.component";
import { MainSection } from "./main-section.component";
import { SaveLoadSection } from "./save-load-section";
import { NewGameSimulationSection } from "./new-section-simulation.component";
import { NewGameAISection } from "./new-section-ai.component";
import { NewGameHumanSection } from "./new-section-human.component";
import { Button, Modal } from "../../core";
import { Icon } from "../../core/icon";

export interface MainMenuProps {}

export const MainMenu: FC<MainMenuProps> = () => {
	const location = useLocation();

	const { isOpen, currentSection, setSection, toggle, open, close } =
		useMainMenuStore();

	const handleEscPress = useCallback(
		(event: KeyboardEvent) => {
			if (event.key !== "Escape") return;

			if (!isOpen) return open();
			close();
		},
		[isOpen, close, open]
	);

	const handleBurgerClick = useCallback(() => {
		if (!isOpen) setSection(MainMenuSection.main);
		toggle();
	}, [isOpen, setSection, toggle]);

	const renderSection = useCallback(() => {
		if (currentSection === MainMenuSection.newGame) return <NewGameSection />;

		if (currentSection === MainMenuSection.newGameAI)
			return <NewGameAISection />;

		if (currentSection === MainMenuSection.newGameHuman)
			return <NewGameHumanSection />;

		if (currentSection === MainMenuSection.newGameSimulation)
			return <NewGameSimulationSection />;

		if (
			currentSection === MainMenuSection.saveGame ||
			currentSection === MainMenuSection.loadGame
		)
			return <SaveLoadSection />;

		return <MainSection />;
	}, [currentSection]);

	useEffect(() => close(), [close, location]);

	useEffect(() => {
		document.addEventListener("keydown", handleEscPress);
		return () => document.removeEventListener("keydown", handleEscPress);
	}, [handleEscPress]);

	return (
		<>
			<Button
				className="fixed top-12 right-12 z-[60]"
				onClick={handleBurgerClick}
			>
				{isOpen ? <Icon.Cross size={32} /> : <Icon.Menu size={32} />}
			</Button>

			<Modal show={!!isOpen} onClick={close}>
				<div onClick={stopEventPropagation} className=" relative w-fit h-fit">
					{renderSection()}
				</div>
			</Modal>
		</>
	);
};
