import { SupportedAiModel } from "@chess-d/ai";
import { FC, useEffect, useMemo } from "react";

import { MainMenuLabelInput } from "../../../_components/label-input";

export const MainMenuNewGameSimulation: FC<{
	aiPlayer1?: keyof typeof SupportedAiModel;
	aiPlayer2?: keyof typeof SupportedAiModel;
	onChange(props: {
		aiPlayer?: keyof typeof SupportedAiModel;
		playerIndex: number;
	}): void;
}> = ({ aiPlayer1, aiPlayer2, onChange }) => {
	const supportedAiModels = useMemo(() => {
		return Object.keys(SupportedAiModel)
			.filter((ai) => isNaN(Number(ai)))
			.map((ai) => ({
				value: ai,
				label: ai
			}));
	}, []);

	const renderPayersSelection = (num: number) => {
		const id = `ai-opponent-${num}`;
		return (
			<MainMenuLabelInput
				key={id}
				id={id}
				labelProps={{
					children: `AI player ${num}`
				}}
				inputProps={{
					type: "select",
					name: "ai-opponent",
					id: "ai-opponent",
					className: "w-full",
					value: num === 1 ? aiPlayer1 : aiPlayer2,
					onChange: (e) =>
						onChange({
							aiPlayer: e.target.value as keyof typeof SupportedAiModel,
							playerIndex: num
						})
				}}
				selectOptions={supportedAiModels}
			/>
		);
	};

	useEffect(() => {
		onChange({
			aiPlayer: "basicBot",
			playerIndex: 1
		});
		onChange({
			aiPlayer: "basicBot",
			playerIndex: 2
		});

		return () => {
			onChange({
				aiPlayer: undefined,
				playerIndex: 1
			});
			onChange({
				aiPlayer: undefined,
				playerIndex: 2
			});
		};
	}, []);

	return Array.from({ length: 2 }).map((_, index) =>
		renderPayersSelection(index + 1)
	);
};
