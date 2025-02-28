import { FC } from "react";
import { useNavigate } from "react-router";

import { GameMode, MainMenuSection } from "../../../../shared/enum";
import { useMainMenuStore } from "../../../_stores";
import { Button } from "../../core";
import { ModalSection } from "../modal-section";

export const NewGameSection: FC = () => {
	const navigate = useNavigate();
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
			label: "Online",
			mode: "human",
			title: "Play against another human player",
			action: () => setSection(MainMenuSection.newGameHuman)
		},
		{
			label: "Free Mode",
			mode: "free",
			title: "Play against yourself",
			action: () => navigate("/play?mode=free")
		},
		{
			label: "Simulation",
			mode: "simulation",
			title: "Watch the AIs playing against each other",
			action: () => setSection(MainMenuSection.newGameSimulation)
		}
	];

	return (
		<ModalSection
			title="New Game"
			onGoBack={() => setSection(MainMenuSection.main)}
		>
			<div className="flex flex-col gap-4">
				<h2 className="text-2xl">Choose your game mode:</h2>

				<div className="flex flex-wrap gap-4 text-xl">
					{GameModeOptions.map((option) => (
						<Button
							key={option.mode}
							{...{
								title: option.title,
								onClick: option.action,
								className:
									"min-h-28 min-w-28 p-2 rounded-xl bg-black/20 hover:bg-black/30 hover:scale-105 text-shadow"
							}}
						>
							{option.label}
						</Button>
					))}
				</div>
			</div>
		</ModalSection>
	);
};
