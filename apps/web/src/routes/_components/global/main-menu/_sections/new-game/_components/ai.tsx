import { SupportedAiModel } from "@chess-d/ai";
import { FC, useEffect, useMemo } from "react";

import { MainMenuLabelInput } from "../../../_components/label-input";

export const MainMenuNewGameAI: FC<{
	aiOpponent?: keyof typeof SupportedAiModel;
	onChange(aiOpponent?: keyof typeof SupportedAiModel): void;
}> = ({ aiOpponent, onChange }) => {
	const supportedAiModels = useMemo(() => {
		return Object.keys(SupportedAiModel)
			.filter((ai) => isNaN(Number(ai)))
			.map((ai) => ({
				value: ai,
				label: ai
			}));
	}, []);

	useEffect(() => {
		onChange("basicBot");
		return () => onChange(undefined);
	}, []);

	return (
		<div className="w-full flex flex-col gap-6">
			<MainMenuLabelInput
				labelProps={{
					children: "AI Opponent"
				}}
				inputProps={{
					type: "select",
					name: "ai-opponent",
					id: "ai-opponent",
					value: aiOpponent,
					className: "w-full",
					onChange: (e) =>
						onChange(e.target.value as keyof typeof SupportedAiModel)
				}}
				selectOptions={supportedAiModels}
			/>
		</div>
	);
};
