import {
	SUPPORTED_AI_MODEL_LABELS,
	SupportedAiModel,
	SupportedAiModelKey
} from "@chess-d/ai";
import { FC, useEffect, useMemo } from "react";

import { MainMenuLabelInput } from "../../../_components/label-input";
import {
	AI_DEFAULT_DEPTH,
	AI_MAX_DEPTH,
	AI_MIN_DEPTH,
	AI_STOCKFISH_DEFAULT_DEPTH,
	AI_STOCKFISH_MAX_DEPTH
} from "@chess-d/shared";

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

	const maxDepth = useMemo(() => {
		return values.ai &&
			SupportedAiModel[values.ai] === SupportedAiModel.stockfish
			? AI_STOCKFISH_MAX_DEPTH
			: AI_MAX_DEPTH;
	}, [values.ai]);

	const handleChange: MainMenuNewGameAIProps["onChange"] = (props) => {
		onChange({ ...values, ...props });
	};

	useEffect(() => {
		onChange({ ...values, aiOpponent: "basicBot" });
		return () => onChange();
	}, []);

	useEffect(() => {
		onChange({
			...values,
			aiOpponentDepth:
				values.ai && SupportedAiModel[values.ai] === SupportedAiModel.stockfish
					? AI_STOCKFISH_DEFAULT_DEPTH
					: AI_DEFAULT_DEPTH
		});
	}, [values.ai]);

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
				[
					SupportedAiModel.basicBot,
					SupportedAiModel.zeyu,
					SupportedAiModel.stockfish
				].includes(SupportedAiModel[values.ai]) && (
					<MainMenuLabelInput
						labelProps={{
							children: `Depth (${AI_MIN_DEPTH}-${maxDepth})`
						}}
						inputProps={{
							type: "number",
							name: "depth",
							id: "depth",
							value: values.depth,
							min: AI_MIN_DEPTH,
							max: maxDepth,
							placeholder: "Enter the depth",
							onChange: (e) =>
								handleChange({
									aiOpponentDepth: isNaN(Number(e.target.value))
										? 3
										: Number(e.target.value)
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
