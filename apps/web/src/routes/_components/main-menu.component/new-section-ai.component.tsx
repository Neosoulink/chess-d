import { SupportedAiModel } from "@chess-d/ai";
import { FC } from "react";
import { useNavigate } from "react-router";

import { MainMenuSection } from "../../../shared/enum";
import { useMainMenuStore } from "../../_stores";

export const NewGameAISection: FC = () => {
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

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);

		const aiOpponent = formData.get("select-ai") as
			| keyof typeof SupportedAiModel
			| null;

		if (!aiOpponent || SupportedAiModel[aiOpponent] === undefined) return;

		navigate(`/play?mode=ai&ai=${aiOpponent}`);
	};

	return (
		<section className="flex flex-col gap-8 items-start">
			<h2 className="text-xl">Select AIs for the simulation:</h2>

			<form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
				<div>
					<label
						htmlFor="select-ai"
						className="block mb-2 text-sm font-medium capitalize"
					>
						Select AI opponent player
					</label>
					<select
						id="select-ai"
						name="select-ai"
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 capitalize"
					>
						{renderSupportedAiModels()}
					</select>
				</div>

				<button type="submit" className="shadow-md p-2 rounded">
					Start Match
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
