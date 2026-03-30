import { SupportedAiModel } from "@chess-d/ai";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { GameMode } from "@/shared/enum";
import { MAIN_MENU_SECTIONS } from "@/shared/constants";
import { useMainMenuStore } from "@/routes/_stores";
import { ModalSection, TitleDivider } from "@/routes/_components/custom";
import { MainMenuLabelInput } from "../../_components/label-input";
import { MainMenuNewGameMultiplayer } from "./_components/human";
import { MainMenuNewGameAI } from "./_components/ai";
import { MainMenuNewGameSimulation } from "./_components/simulation";
import { NewGameChessConfig } from "./_components/chess-configs";

export const MainMenuNewGameSection = () => {
	const navigate = useNavigate();
	const { setSections, currentSections } = useMainMenuStore();

	const [gameModeConfigs, setGameModeConfigs] = useState<{
		gameMode?: GameMode | "none";
		aiOpponent?: keyof typeof SupportedAiModel;
		multiRoomId?: string;
		multiJoinRoom?: boolean;
		simulationAI1?: keyof typeof SupportedAiModel;
		simulationAI2?: keyof typeof SupportedAiModel;
	}>({});

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
		let to = "/play?mode=human";

		if (gameModeConfigs.multiJoinRoom && gameModeConfigs.multiRoomId)
			to = `${to}&roomID=${gameModeConfigs.multiRoomId}`;

		navigate(to);
	};

	const handleAiMode = () => {
		const aiOpponent = gameModeConfigs.aiOpponent;

		if (!aiOpponent || SupportedAiModel[aiOpponent] === undefined) return;

		navigate(`/play?mode=ai&ai=${aiOpponent}`);
	};

	const handleFreeMode = () => {
		navigate("/play?mode=free");
	};

	const handleSimulationMode = () => {
		const ai1 = gameModeConfigs.simulationAI1;
		const ai2 = gameModeConfigs.simulationAI2;

		if (
			!ai1 ||
			!ai2 ||
			SupportedAiModel[ai1] === undefined ||
			SupportedAiModel[ai2] === undefined
		)
			return;

		navigate(`/play?mode=simulation&ai1=${ai1}&ai2=${ai2}`);
	};

	useEffect(() => {
		if (currentSection === MAIN_MENU_SECTIONS.newGame)
			setGameModeConfigs({ gameMode: "none" });
	}, [currentSection]);

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
				...(gameModeConfigs.gameMode === GameMode.human
					? [
							{
								label: gameModeConfigs.multiJoinRoom
									? "Join Match"
									: "New match",
								action: handleMultiMode
							},
							{
								label: "Random Match",
								action: () => navigate("/play?mode=human&random=true")
							}
						]
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
						{ value: GameMode.human, label: "Multiplayer" },
						{ value: GameMode.free, label: "Free" },
						{ value: GameMode.simulation, label: "Simulation" }
					]}
				/>

				{!!isValidGameMode && (
					<>
						{gameModeConfigs.gameMode === GameMode.human && (
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
								aiOpponent={gameModeConfigs.aiOpponent}
								onChange={(aiOpponent) =>
									setGameModeConfigs((prev) => ({
										...prev,
										aiOpponent
									}))
								}
							/>
						)}

						{gameModeConfigs.gameMode === GameMode.simulation && (
							<MainMenuNewGameSimulation
								aiPlayer1={gameModeConfigs.simulationAI1}
								aiPlayer2={gameModeConfigs.simulationAI2}
								onChange={(props) =>
									setGameModeConfigs((prev) => ({
										...prev,
										...(props.playerIndex === 1
											? { simulationAI1: props.aiPlayer }
											: { simulationAI2: props.aiPlayer })
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
