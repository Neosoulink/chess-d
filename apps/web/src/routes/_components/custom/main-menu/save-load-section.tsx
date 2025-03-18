import { Chessboard2 } from "@chrisoakman/chessboard2/dist/chessboard2.min.js";
import { FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import {
	GameMode,
	MainMenuSection,
	SupportedSaveSlots
} from "../../../../shared/enum";
import { GameSave } from "../../../../shared/types";
import { useGameStore, useMainMenuStore } from "../../../_stores";
import { Button, Icon } from "../../core";
import { ModalSection } from "../modal-section";

/** @internal */
const SLOTS = Object.values(SupportedSaveSlots).filter(
	(slot) => typeof slot === "number"
);

/** @internal */
const getGameModeTitle = (mode: GameMode) => {
	switch (mode) {
		case GameMode.ai:
			return "AI Mode";

		case GameMode.human:
			return "Online Mode";

		case GameMode.simulation:
			return "Simulation Mode";

		default:
			return "Free Mode";
	}
};

/** @internal */
const GameSaveItem: FC<{
	save?: GameSave;
	title?: string;
	deactivate?: boolean;
	onClick?: () => void;
	onErase?: () => void;
}> = ({ save, title, deactivate, onClick, onErase }) => {
	const mapWrapperRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<Chessboard2>(null);

	useEffect(() => {
		const fen = save?.fen || "";

		if (fen) setTimeout(() => mapRef.current?.position(fen, true), 0);
	}, [save?.fen]);

	useEffect(() => {
		const mapParentElement = mapWrapperRef.current;
		const mapElement = document.createElement("div");

		let mapBoard: Chessboard2 | undefined;

		mapParentElement?.appendChild(mapElement);

		if (mapParentElement && save?.fen) {
			mapBoard = Chessboard2(mapElement, {
				draggable: false
			});
			mapRef.current = mapBoard;
		}

		return () => {
			mapBoard?.destroy();
			mapElement.remove();
		};
	}, [save?.fen]);

	return (
		<div className="rounded overflow-hidden flex">
			<Button
				className={`flex flex-1 bg-black/30 w-full !gap-0 !h-30 !rounded-none ${deactivate ? "!pointer-events-none" : ""}`}
				onClick={onClick}
			>
				<div ref={mapWrapperRef} className="bg-black/30 h-30 w-30" />

				<div className="flex flex-col gap-1 flex-1 px-4 py-2 w-full text-left">
					{!!save && (
						<>
							<h4 className="text-lg font-semibold">{title || save.id}</h4>

							<div className="flex flex-col space-y-1">
								<small>{save.fen}</small>

								<small>
									{save.pgn.substring(0, 75)}
									{(save.pgn.length || 0) > 75 ? "..." : ""}
								</small>

								<small className="bg-black/30 rounded px-2 w-fit">
									{getGameModeTitle(save.mode)}
								</small>
							</div>
						</>
					)}

					{!save && <h4 className="text-lg font-semibold">Empty Slot</h4>}
				</div>
			</Button>

			{!!onErase && (
				<Button
					className="bg-red-500/30 p-2 !gap-0 !rounded-none"
					disabled={deactivate}
					onClick={onErase}
				>
					<Icon.Cross />
				</Button>
			)}
		</div>
	);
};

export const SaveLoadSection: FC = () => {
	const {
		close: closeMenu,
		setSection,
		currentSection,
		isOpen
	} = useMainMenuStore();
	const { getSaves, saveState, setInitialGameState, eraseStateSave } =
		useGameStore();
	const [saves, setSaves] = useState<(GameSave | undefined)[]>([]);

	const navigate = useNavigate();

	const handleGameSaveItemClick = (slot: Parameters<typeof saveState>[0]) => {
		const saves = getSaves();
		const isSave = currentSection === MainMenuSection.saveGame;

		if (isSave) saveState(slot);
		else {
			const save = saves[slot];

			if (!save) return;

			setInitialGameState({
				fen: save.fen,
				pgn: save.pgn,
				redoHistory: save.redoHistory
			});
			navigate(
				save.mode === GameMode.ai
					? "/play?mode=ai"
					: save.mode === GameMode.human
						? "/play?mode=human"
						: save.mode === GameMode.simulation
							? "/play?mode=simulation"
							: "/play?mode=free"
			);
		}

		setSaves(saves);
		closeMenu();
	};

	const handleGameSaveItemErase = (slot: Parameters<typeof saveState>[0]) => {
		eraseStateSave(slot);
		setSaves(getSaves());
	};

	useEffect(() => {
		const loadedSaves = getSaves();

		if (loadedSaves) setSaves(loadedSaves);
	}, [isOpen, getSaves]);

	return (
		<ModalSection
			title={
				currentSection === MainMenuSection.saveGame ? "Save Game" : "Load Game"
			}
			editPiecesPosition={false}
			onGoBack={() => setSection(MainMenuSection.main)}
			onClose={closeMenu}
		>
			<div>
				<h3 className="mb-2 text-2xl">
					{currentSection === MainMenuSection.saveGame ? "Save" : "Load"} slots
				</h3>

				<div className="space-y-2 ">
					{SLOTS.map((key) => (
						<GameSaveItem
							key={key}
							save={saves[key]}
							onClick={() => handleGameSaveItemClick(key as SupportedSaveSlots)}
							deactivate={
								!saves[key] && currentSection === MainMenuSection.loadGame
							}
							onErase={
								saves[key]
									? () => handleGameSaveItemErase(key as SupportedSaveSlots)
									: undefined
							}
						/>
					))}
				</div>
			</div>
		</ModalSection>
	);
};
