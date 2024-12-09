import { FC } from "react";
import { Link, useNavigate } from "react-router";

import { GameMode, MainMenuSection } from "../../../shared/enum";
import { useGameStore, useMainMenuStore } from "../../_stores";

export const NewGameSection: FC = () => {
	const navigate = useNavigate();

	const { reset: resetGame } = useGameStore();
	const { setSection } = useMainMenuStore();

	const GameModeOptions: {
		label: string;
		title: string;
		mode: keyof typeof GameMode;
		action: () => void;
	}[] = [
		{
			label: "AI",
			mode: "ai",
			title: "Play against the computer",
			action: () => setSection(MainMenuSection.newGameAI)
		},
		{
			label: "Human",
			mode: "human",
			title: "Play against another human player",
			action: () => setSection(MainMenuSection.newGameHuman)
		},
		{
			label: "Free Mode",
			mode: "free",
			title: "Play against yourself",
			action: () => {
				navigate("/play?mode=free");
				resetGame();
			}
		},
		{
			label: "Simulation",
			mode: "simulation",
			title: "Watch the AIs playing against each other",
			action: () => setSection(MainMenuSection.newGameSimulation)
		}
	];

	return (
		<section className="flex flex-col gap-8 items-start">
			<div>
				<h2 className="text-xl mb-2">Choose your game mode:</h2>

				<div className="flex flex-wrap gap-4 text-xl">
					{GameModeOptions.map((option) => (
						<button
							key={option.mode}
							{...{
								title: option.title,
								onClick: option.action,
								className: "p-5 rounded shadow-md hover:bg-gray-100"
							}}
						>
							{option.label}
						</button>
					))}
				</div>
			</div>

			<button
				className="shadow-md p-2 rounded"
				onClick={() => setSection(MainMenuSection.main)}
			>
				Go Back
			</button>
		</section>
	);
};
