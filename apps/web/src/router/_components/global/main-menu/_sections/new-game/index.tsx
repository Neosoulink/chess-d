import { SupportedAiModel } from "@chess-d/ai";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { GameMode } from "@/shared/enum";
import { MAIN_MENU_SECTIONS } from "@/shared/constants";
import { useAudioStore, useMainMenuStore } from "@/router/_stores";
import {
	ModalSection,
	ModalSectionProps,
	TitleDivider
} from "@/router/_components/custom";
import { MainMenuLabelInput } from "../../_components/label-input";
import { MainMenuNewGameMultiplayer } from "./_components/multiplayer";
import { MainMenuNewGameAI } from "./_components/ai";
import { MainMenuNewGameSimulation } from "./_components/simulation";
import { NewGameChessConfig } from "./_components/chess-configs";

export const MainMenuNewGameSection = () => {
	const navigate = useNavigate();
	const { setSections, currentSections } = useMainMenuStore();
	const { refreshInteractiveListeners } = useAudioStore();

	const [gameModeConfigs, setGameModeConfigs] = useState<{
		gameMode?: GameMode | "none";
		aiOpponent?: keyof typeof SupportedAiModel;
		aiOpponentApiKey?: string;
		aiOpponentDepth?: number;
		multiRoomId?: string;
		multiJoinRoom?: boolean;
		simulationAI1?: keyof typeof SupportedAiModel;
		simulationAI1Depth?: number;
		simulationAI1ApiKey?: string;
		simulationAI2?: keyof typeof SupportedAiModel;
		simulationAI2Depth?: number;
		simulationAI2ApiKey?: string;
	}>({
		aiOpponentDepth: 3
	});

	const [currentSection] = useMemo(
		() => currentSections || [],
		[currentSections]
	);
	const isValidGameMode = useMemo(() => {
		return (
			gameModeConfigs.gameMode &&
			Object.values(GameMode).includes(gameModeConfigs.gameMode as GameMode)
		);
	}, [gameModeConfigs.gameMode]);

	const handleMultiMode = () => {
		let to = "/play?mode=multiplayer";

		if (gameModeConfigs.multiJoinRoom && gameModeConfigs.multiRoomId)
			to = `${to}&roomID=${gameModeConfigs.multiRoomId}`;

		navigate(to);
	};

	const handleAiMode = () => {
		const aiOpponent = gameModeConfigs.aiOpponent;
		const depth =
			typeof gameModeConfigs.aiOpponentDepth === "number"
				? gameModeConfigs.aiOpponentDepth
				: undefined;

		let to = "/play?mode=ai";

		if (aiOpponent && SupportedAiModel[aiOpponent] !== undefined)
			to = `${to}&ai=${aiOpponent}`;
		if (depth) to = `${to}&depth=${depth}`;

		navigate(to);
	};

	const handleFreeMode = () => {
		navigate("/play?mode=free");
	};

	const handleSimulationMode = () => {
		const ai1 = gameModeConfigs.simulationAI1;
		const depth1 = gameModeConfigs.simulationAI1Depth;
		const ai2 = gameModeConfigs.simulationAI2;
		const depth2 = gameModeConfigs.simulationAI2Depth;

		let to = "/play?mode=simulation";

		if (ai1 && SupportedAiModel[ai1] !== undefined) to = `${to}&ai1=${ai1}`;
		if (depth1) to = `${to}&depth1=${depth1}`;
		if (ai2 && SupportedAiModel[ai2] !== undefined) to = `${to}&ai2=${ai2}`;
		if (depth2) to = `${to}&depth2=${depth2}`;

		navigate(to);
	};

	useEffect(() => {
		if (currentSection === MAIN_MENU_SECTIONS.newGame)
			setGameModeConfigs({ gameMode: "none", aiOpponentDepth: 3 });
	}, [currentSection]);

	useEffect(() => {
		refreshInteractiveListeners();
	}, [gameModeConfigs]);

	return (
		<ModalSection
			header={{
				title: "New Game Options",
				icon: "Flag"
			}}
			footerOptions={[
				{
					label: "Back",
					icon: "ActionUndo",
					action: () => setSections(MAIN_MENU_SECTIONS.main)
				},
				...(gameModeConfigs.gameMode === GameMode.multiplayer
					? ([
							{
								label: gameModeConfigs.multiJoinRoom
									? "Join Match"
									: "New match",
								action: handleMultiMode
							},
							{
								label: "Random Match",
								icon: "Random",
								action: () => navigate("/play?mode=multiplayer&random=true")
							}
						] satisfies ModalSectionProps["footerOptions"])
					: []),
				...(gameModeConfigs.gameMode === GameMode.ai
					? [
							{
								label: "Start Match",
								action: handleAiMode
							}
						]
					: []),
				...(gameModeConfigs.gameMode === GameMode.free
					? [
							{
								label: "Start Free Match",
								action: handleFreeMode
							}
						]
					: []),
				...(gameModeConfigs.gameMode === GameMode.simulation
					? [
							{
								label: "Start Simulation",
								action: handleSimulationMode
							}
						]
					: [])
			]}
		>
			<NewGameChessConfig />

			<div className="flex flex-col gap-2">
				<TitleDivider title="Game mode" icon="Processor" heading="3" />

				<MainMenuLabelInput
					id="game-mode"
					labelProps={{
						children: "Mode"
					}}
					inputProps={{
						type: "select",
						value: gameModeConfigs.gameMode,
						onChange: (e) =>
							setGameModeConfigs({
								...gameModeConfigs,
								gameMode: e.target.value as GameMode
							})
					}}
					selectOptions={[
						{ value: "none", label: "Select a mode" },
						{ value: GameMode.ai, label: "AI" },
						{ value: GameMode.multiplayer, label: "Multiplayer" },
						{ value: GameMode.free, label: "Free" },
						{ value: GameMode.simulation, label: "Simulation" }
					]}
				/>

				{!!isValidGameMode && (
					<>
						{gameModeConfigs.gameMode === GameMode.multiplayer && (
							<MainMenuNewGameMultiplayer
								joinRoom={!!gameModeConfigs.multiJoinRoom}
								roomId={gameModeConfigs.multiRoomId}
								toggleJoin={() =>
									setGameModeConfigs({
										...gameModeConfigs,
										multiJoinRoom: !gameModeConfigs.multiJoinRoom
									})
								}
								setRoomId={(roomId) =>
									setGameModeConfigs({
										...gameModeConfigs,
										multiRoomId: roomId
									})
								}
							/>
						)}

						{gameModeConfigs.gameMode === GameMode.ai && (
							<MainMenuNewGameAI
								values={{
									ai: gameModeConfigs.aiOpponent,
									apiKey: gameModeConfigs.aiOpponentApiKey,
									depth: gameModeConfigs.aiOpponentDepth
								}}
								onChange={(props) =>
									setGameModeConfigs((prev) => ({
										...prev,
										...props
									}))
								}
							/>
						)}

						{gameModeConfigs.gameMode === GameMode.simulation && (
							<MainMenuNewGameSimulation
								aiPlayer1={{
									model: gameModeConfigs.simulationAI1,
									depth: gameModeConfigs.simulationAI1Depth,
									apiKey: gameModeConfigs.simulationAI1ApiKey
								}}
								aiPlayer2={{
									model: gameModeConfigs.simulationAI2,
									depth: gameModeConfigs.simulationAI2Depth,
									apiKey: gameModeConfigs.simulationAI2ApiKey
								}}
								onChange={(props) =>
									setGameModeConfigs((prev) => ({
										...prev,
										...(props.playerIndex === 1
											? {
													simulationAI1: props.aiPlayer?.model ?? "basicBot",
													simulationAI1Depth: props.aiPlayer?.depth ?? 3,
													simulationAI1ApiKey: props.aiPlayer?.apiKey ?? ""
												}
											: {
													simulationAI2: props.aiPlayer?.model ?? "basicBot",
													simulationAI2Depth: props.aiPlayer?.depth ?? 3,
													simulationAI2ApiKey: props.aiPlayer?.apiKey ?? ""
												})
									}))
								}
							/>
						)}
					</>
				)}
			</div>
		</ModalSection>
	);
};
