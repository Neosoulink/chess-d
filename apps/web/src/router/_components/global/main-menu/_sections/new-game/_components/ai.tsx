import {
	SUPPORTED_AI_MODEL_LABELS,
	SupportedAiModel,
	SupportedAiModelKey
} from "@chess-d/ai";
import { FC, useEffect, useMemo } from "react";
import { clamp } from "three/src/math/MathUtils.js";

import { MainMenuLabelInput } from "../../../_components/label-input";

export type MainMenuNewGameAIProps = {
	values: {
		ai?: keyof typeof SupportedAiModel;
		apiKey?: string;
		depth?: number;
	};
	onChange(props?: {
		aiOpponent?: keyof typeof SupportedAiModel;
		aiOpponentApiKey?: string;
		aiOpponentDepth?: number;
	}): void;
};

export const MainMenuNewGameAI: FC<MainMenuNewGameAIProps> = ({
	values,
	onChange
}) => {
	const supportedAiModels = useMemo(() => {
		return Object.keys(SupportedAiModel)
			.filter((ai) => isNaN(Number(ai)))
			.map((ai) => ({
				value: ai,
				label: SUPPORTED_AI_MODEL_LABELS[ai as SupportedAiModelKey] ?? ai
			}));
	}, []);

	const handleChange: MainMenuNewGameAIProps["onChange"] = (props) => {
		onChange({ ...values, ...props });
	};

	useEffect(() => {
		onChange({ ...values, aiOpponent: "basicBot" });
		return () => onChange();
	}, []);

	return (
		<>
			<MainMenuLabelInput
				labelProps={{
					children: "AI Opponent"
				}}
				inputProps={{
					type: "select",
					name: "ai-opponent",
					id: "ai-opponent",
					value: values.ai,
					className: "w-full",
					onChange: (e) =>
						handleChange({
							aiOpponent: e.target.value as keyof typeof SupportedAiModel
						})
				}}
				selectOptions={supportedAiModels}
			/>

			{!!values.ai &&
				[SupportedAiModel.basicBot, SupportedAiModel.zeyu].includes(
					SupportedAiModel[values.ai]
				) && (
					<MainMenuLabelInput
						labelProps={{
							children: "Depth (1-6)"
						}}
						inputProps={{
							type: "number",
							name: "depth",
							id: "depth",
							value: values.depth,
							min: 1,
							max: 5,
							placeholder: "Enter the depth",
							onChange: (e) =>
								handleChange({
									aiOpponentDepth: isNaN(Number(e.target.value))
										? 3
										: clamp(Number(e.target.value), 1, 5)
								})
						}}
					/>
				)}

			{!!values.ai &&
				[
					SupportedAiModel.openAiChatGpt,
					SupportedAiModel.googleGemini,
					SupportedAiModel.anthropicClaude
				].includes(SupportedAiModel[values.ai]) && (
					<MainMenuLabelInput
						labelProps={{
							children: "API Key (optional)"
						}}
						inputProps={{
							type: "text",
							name: "api-key",
							id: "api-key",
							value: values.apiKey ?? "",
							placeholder: "Your provider API key",
							onChange: (e) =>
								handleChange({ aiOpponentApiKey: e.target.value })
						}}
					/>
				)}
		</>
	);
};
