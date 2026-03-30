import { Chessboard2 } from "@chrisoakman/chessboard2/dist/chessboard2.min.js";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { GameMode, SupportedSaveSlots } from "@/shared/enum";
import { GameSave } from "@/shared/types";
import { useGameStore, useMainMenuStore } from "@/routes/_stores";
import { Button, Icon, Input } from "@/routes/_components/core";
import { ModalSection } from "@/routes/_components/custom/modal-section";
import { MAIN_MENU_SECTIONS } from "@/shared/constants";

/** @internal */
const SLOTS = Object.values(SupportedSaveSlots).filter(
	(slot) => typeof slot === "number"
);

/** @internal */
const getGameModeTitle = (mode: GameMode) => {
	switch (mode) {
		case GameMode.ai:
			return "AI";

		case GameMode.human:
			return "Multiplayer";

		case GameMode.simulation:
			return "Simulation ";

		default:
			return "Free";
	}
};

/** @internal */
const GameSaveItem: FC<{
	forSave?: boolean;
	save?: GameSave;
	title?: string;
	disabled?: boolean;
	onClick?: () => void;
	onErase?: () => void;
}> = ({ forSave, save, title, disabled, onClick, onErase }) => {
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
		<div className="flex flex-col overflow-hidden">
			<div className="flex flex-1 gap-0 h-30 rounded-none px-0 bg-light/10">
				<div
					ref={mapWrapperRef}
					className="bg-linear-to-b from-neon-cyan/40 to-neon-purple/40 h-30 w-30"
				/>

				<div className="flex flex-col justify-center gap-1 flex-1 p-2 size-full">
					{!!save && (
						<>
							<h4 className="font-semibold whitespace-nowrap">
								{(title || save.id).split(".")[0]}
							</h4>

							<Input
								type="textarea"
								value={`${save.fen}\n${save.pgn}`}
								className="text-xs no-scrollbar resize-none flex-1"
								contentEditable={false}
								readOnly
							/>

							<small className="bg-black/30 px-2 w-fit">
								Mode: {getGameModeTitle(save.mode)}
							</small>
						</>
					)}

					{!save && <h4 className="self-center">Empty Slot</h4>}
				</div>
			</div>

			<div className="flex w-full text-sm ">
				<Button
					className="bg-negative/30 hover:bg-negative/50 h-6 flex-1"
					disabled={disabled || !save}
					onClick={onErase}
				>
					<Icon.Trash />
					Erase
				</Button>

				<Button className="h-6 flex-1" disabled={disabled} onClick={onClick}>
					<Icon.Save />
					{forSave ? "Save" : "Load"}
				</Button>
			</div>
		</div>
	);
};

export const MainMenuSaveLoadSection: FC = () => {
	const navigate = useNavigate();
	const { isOpen, currentSections, setOpen, setSections } = useMainMenuStore();
	const { getSaves, saveState, setInitialGameState, eraseStateSave } =
		useGameStore();

	const [currentSection] = useMemo(() => {
		return currentSections || [];
	}, [currentSections]);
	const isSaveView = useMemo(() => {
		return currentSection === MAIN_MENU_SECTIONS.saveGame;
	}, [currentSection]);

	const [saves, setSaves] = useState<(GameSave | undefined)[]>([]);

	const handleGameSaveItemClick = useCallback(
		(slot: Parameters<typeof saveState>[0]) => {
			const saves = getSaves();

			if (isSaveView) saveState(slot);
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
			setOpen(false);
		},
		[isSaveView, saveState, navigate]
	);

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
			header={{
				title: isSaveView ? "Save Game" : "Load Game",
				icon: "Save"
			}}
			footerOptions={
				isSaveView
					? [
							{
								label: "Close",
								action: () => setOpen(false)
							}
						]
					: [
							{
								label: "Back",
								icon: "ActionUndo",
								action: () => setSections(MAIN_MENU_SECTIONS.main)
							}
						]
			}
		>
			<div className="flex flex-col gap-2">
				{SLOTS.map((key) => (
					<GameSaveItem
						key={key}
						forSave={isSaveView}
						save={saves[key]}
						onClick={() => handleGameSaveItemClick(key as SupportedSaveSlots)}
						disabled={!saves[key] && !isSaveView}
						onErase={
							saves[key]
								? () => handleGameSaveItemErase(key as SupportedSaveSlots)
								: undefined
						}
					/>
				))}
			</div>
		</ModalSection>
	);
};
