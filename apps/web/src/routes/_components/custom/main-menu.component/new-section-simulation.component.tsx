import { SupportedAiModel } from "@chess-d/ai";
import { FC } from "react";
import { useNavigate } from "react-router";

import { MainMenuSection } from "../../../../shared/enum";
import { useMainMenuStore } from "../../../_stores";

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
				<select
					id={`select-ai-${num}`}
					name={`select-ai-${num}`}
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 capitalize"
				>
					{renderSupportedAiModels()}
				</select>
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
		<section className="flex flex-col gap-8 items-start">
			<h2 className="text-xl">Select AIs for the simulation:</h2>

			<form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
				<div className="grid gap-6 md:grid-cols-2">
					{Array.from({ length: 2 }).map((_, index) =>
						renderPayersSelection(index + 1)
					)}
				</div>

				<button type="submit" className="shadow-md p-2 rounded">
					Start Simulation
				</button>
			</form>

			<button
				className="shadow-md p-2 rounded"
				onClick={() => setSection(MainMenuSection.newGame)}
			>
				Go Back
			</button>
		</section>
	);
};
