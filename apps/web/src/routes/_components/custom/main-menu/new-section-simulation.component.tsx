import { SupportedAiModel } from "@chess-d/ai";
import { FC } from "react";
import { useNavigate } from "react-router";

import { MainMenuSection } from "../../../../shared/enum";
import { useMainMenuStore } from "../../../_stores";
import { Button, Input } from "../../core";
import { ModalSection } from "../modal-section";

export const NewGameSimulationSection: FC = () => {
	const navigate = useNavigate();
	const { setSection } = useMainMenuStore();

	const renderSupportedAiModels = () => {
		return Object.keys(SupportedAiModel)
			.filter((ai) => isNaN(Number(ai)))
			.map((ai) => (
				<option key={ai} value={ai} className="capitalize">
					{ai}
				</option>
			));
	};

	const renderPayersSelection = (num: number) => {
		return (
			<div key={`select-ai-${num}`}>
				<label
					htmlFor={`select-ai-${num}`}
					className="block mb-2 text-sm font-medium"
				>
					AI Player {num}
				</label>

				<Input
					asSelect
					id={`select-ai-${num}`}
					name={`select-ai-${num}`}
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 capitalize"
				>
					{renderSupportedAiModels()}
				</Input>
			</div>
		);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);

		const ai1 = formData.get("select-ai-1") as
			| keyof typeof SupportedAiModel
			| null;
		const ai2 = formData.get("select-ai-2") as
			| keyof typeof SupportedAiModel
			| null;

		if (
			!ai1 ||
			!ai2 ||
			SupportedAiModel[ai1] === undefined ||
			SupportedAiModel[ai2] === undefined
		)
			return;

		navigate(`/play?mode=simulation&ai1=${ai1}&ai2=${ai2}`);
	};

	return (
		<ModalSection
			title="New Game (AI vs AI)"
			onGoBack={() => setSection(MainMenuSection.newGame)}
		>
			<div>
				<h2 className="text-xl mb-4">Select AIs for the simulation:</h2>

				<form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
					<div className="grid gap-6 md:grid-cols-2">
						{Array.from({ length: 2 }).map((_, index) =>
							renderPayersSelection(index + 1)
						)}
					</div>

					<Button type="submit" className="bg-black/30 p-2">
						Start Simulation
					</Button>
				</form>
			</div>
		</ModalSection>
	);
};
