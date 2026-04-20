import {
	SUPPORTED_AI_MODEL_LABELS,
	SupportedAiModel,
	SupportedAiModelKey
} from "@chess-d/ai";
import {
	AI_DEFAULT_DEPTH,
	AI_MAX_DEPTH,
	AI_MIN_DEPTH,
	AI_STOCKFISH_DEFAULT_DEPTH,
	AI_STOCKFISH_MAX_DEPTH
} from "@chess-d/shared";
import { FC, Fragment, useEffect, useMemo } from "react";

import { MainMenuLabelInput } from "../../../_components/label-input";

export const MainMenuNewGameSimulation: FC<{
	aiPlayer1?: {
		model?: keyof typeof SupportedAiModel;
		depth?: number;
		apiKey?: string;
	};
	aiPlayer2?: {
		model?: keyof typeof SupportedAiModel;
		depth?: number;
		apiKey?: string;
	};
	onChange(props: {
		aiPlayer?: {
			model?: keyof typeof SupportedAiModel;
			depth?: number;
			apiKey?: string;
		};
		playerIndex: number;
	}): void;
}> = ({ aiPlayer1, aiPlayer2, onChange }) => {
	const supportedAiModels = useMemo(() => {
		return Object.keys(SupportedAiModel)
			.filter((ai) => isNaN(Number(ai)))
			.map((ai) => ({
				value: ai,
				label: SUPPORTED_AI_MODEL_LABELS[ai as SupportedAiModelKey] ?? ai
			}));
	}, []);

	const renderPayersSelection = (num: number) => {
		const aiPlayerData = num === 1 ? aiPlayer1 : aiPlayer2;
		const maxDepth =
			aiPlayerData?.model &&
			SupportedAiModel[aiPlayerData?.model] === SupportedAiModel.stockfish
				? AI_STOCKFISH_MAX_DEPTH
				: AI_MAX_DEPTH;

		return (
			<Fragment key={`ai-opponent-${num}`}>
				<MainMenuLabelInput
					labelProps={{
						children: `AI player ${num}`
					}}
					inputProps={{
						type: "select",
						name: "ai-opponent",
						id: "ai-opponent",
						className: "w-full",
						value: aiPlayerData?.model as string,
						onChange: (e) =>
							onChange({
								aiPlayer: { ...aiPlayerData, model: e.target.value },
								playerIndex: num
							})
					}}
					selectOptions={supportedAiModels}
				/>

				{aiPlayerData?.model &&
					[
						SupportedAiModel.basicBot,
						SupportedAiModel.zeyu,
						SupportedAiModel.stockfish
					].includes(SupportedAiModel[aiPlayerData.model]) && (
						<MainMenuLabelInput
							labelProps={{
								children: `Depth AI ${num} (${AI_MIN_DEPTH}-${maxDepth})`
							}}
							inputProps={{
								type: "number",
								name: "depth",
								id: "depth",
								value: aiPlayerData.depth ?? AI_DEFAULT_DEPTH,
								min: AI_MIN_DEPTH,
								max: maxDepth,
								placeholder: "Enter the depth",
								onChange: (e) =>
									onChange({
										aiPlayer: {
											...aiPlayerData,
											depth: isNaN(Number(e.target.value))
												? aiPlayerData?.model &&
													SupportedAiModel[aiPlayerData?.model] ===
														SupportedAiModel.stockfish
													? AI_STOCKFISH_DEFAULT_DEPTH
													: AI_DEFAULT_DEPTH
												: Number(e.target.value)
										},
										playerIndex: num
									})
							}}
						/>
					)}

				{aiPlayerData?.model &&
					[
						SupportedAiModel.openAiChatGpt,
						SupportedAiModel.googleGemini,
						SupportedAiModel.anthropicClaude
					].includes(SupportedAiModel[aiPlayerData.model]) && (
						<MainMenuLabelInput
							labelProps={{
								children: `API Key AI ${num} (optional)`
							}}
							inputProps={{
								type: "text",
								name: "api-key",
								id: "api-key",
								value: aiPlayerData.apiKey ?? "",
								placeholder: "Your provider API key",
								onChange: (e) =>
									onChange({
										aiPlayer: { ...aiPlayerData, apiKey: e.target.value },
										playerIndex: num
									})
							}}
						/>
					)}
			</Fragment>
		);
	};

	useEffect(() => {
		[1, 2].forEach((num) => {
			onChange({
				aiPlayer: { model: "basicBot", depth: 3 },
				playerIndex: num
			});
		});

		return () => {
			[1, 2].forEach((num) => {
				onChange({ aiPlayer: undefined, playerIndex: num });
			});
		};
	}, []);

	return Array.from({ length: 2 }).map((_, index) =>
		renderPayersSelection(index + 1)
	);
};
