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

export interface MainMenuComponentProps {}

export const MainMenuComponent: FC<MainMenuComponentProps> = () => {
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
		<div
			className={`fixed h-dvh w-dvw flex justify-center items-center z-50 top-0 left-0 p-4 bg-gradient-to-b from-gray-900/40 via-gray-950/80 to-gray-900/40 transition-opacity duration-300 overflow-hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
			onClick={close}
		>
			<div
				onClick={stopEventPropagation}
				className="bg-gray-50 text-gray-950 p-12 rounded-xl max-w-[584px] min-w-[584px] relative"
			>
				<button
					className="absolute top-5 right-5 text-xl h-10 w-10 flex justify-center items-center rounded-full shadow-md hover:bg-gray-100 select-none hover:shadow-lg transition-[shadow,background-color] duration-300"
					onClick={close}
				>
					x
				</button>

				<header className="flex flex-col gap-4">{renderSection()}</header>
			</div>
		</div>
	);
};
