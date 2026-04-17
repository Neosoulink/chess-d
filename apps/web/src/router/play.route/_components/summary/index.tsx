import { FC, useCallback, useEffect, useMemo } from "react";

import { cn } from "@/shared/utils";
import { Button, Divider, Icon, Input, Modal } from "@/router/_components/core";
import { useGameStore, useMainMenuStore } from "@/router/_stores";
import { getGameStateLabel } from "@/shared/utils/game.util";
import { MoveLike } from "@/shared/types";
import { MAIN_MENU_SECTIONS } from "@/shared/constants";

export const PlaySummary: FC = () => {
	const { gameState, showSummary, setShowSummary } = useGameStore();
	const { setOpen: setMainMenuOpen, setSections: setMainMenuSections } =
		useMainMenuStore();

	const stateLabel = useMemo(() => {
		return getGameStateLabel(gameState) ?? "";
	}, [gameState]);

	const formattedHistory = useMemo(() => {
		const history = (gameState?.history?.slice() as MoveLike[]) || [];
		const redoHistory = gameState?.redoHistory?.slice().reverse() || [];

		const _combinedMoves: MoveLike[] = [...history, ...redoHistory];
		const _newMoves: [
			move1?: { active: boolean; move?: MoveLike } | undefined,
			move2?: { active: boolean; move?: MoveLike } | undefined
		][] = [];

		for (let i = 0; i < _combinedMoves.length; i += 2) {
			_newMoves.push([
				{
					active: i === history.length - 1,
					move: _combinedMoves[i]
				},
				_combinedMoves[i + 1]
					? {
							active: i === history.length - 2,
							move: _combinedMoves[i + 1]
						}
					: undefined
			]);
		}

		return _newMoves;
	}, [gameState?.history, gameState?.redoHistory]);

	const openSaveMenu = useCallback(() => {
		setMainMenuOpen(true);
		setMainMenuSections(MAIN_MENU_SECTIONS.saveGame);
	}, [setMainMenuOpen, setMainMenuSections]);

	useEffect(() => {
		if (gameState?.isGameOver) setShowSummary(true);
	}, [gameState?.isGameOver]);

	return (
		<Modal
			show={showSummary}
			withBgColor={false}
			className="flex gap-1 items-center justify-center bg-dark/80"
			onClick={() => setShowSummary(false)}
		>
			<div
				className={cn(
					"relative overflow-hidden",
					"w-3/5 max-w-96 h-full max-h-128 shadow-lg px-4 py-6",
					"bg-linear-to-b from-primary/50 to-secondary/50 transition-transform duration-300 -translate-y-10",
					showSummary && "translate-y-0"
				)}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="absolute inset-0 bg-black/50 z-0 pointer-events-none" />

				<Button
					className="absolute top-5 right-5 size-7 z-20"
					disabled={!showSummary}
					onClick={() => setShowSummary(false)}
				>
					<Icon.Cross size={16} />
				</Button>

				<div className="flex flex-col gap-2 h-full z-10 relative">
					<nav>
						<h3>
							State:{" "}
							<span
								className={cn(
									gameState?.isGameOver
										? gameState?.isDraw && "text-warning"
										: gameState?.isGameOver
											? gameState?.turn !== gameState?.playerSide
												? "text-positive"
												: "text-negative"
											: ""
								)}
							>
								{stateLabel}
							</span>
						</h3>
						{gameState?.isDraw ? (
							<span className="text-warning">No winner</span>
						) : (
							gameState?.isGameOver && (
								<h4 className="text-sm text-light/50">
									{gameState?.turn !== gameState?.playerSide ? (
										<span className="text-positive">You won!</span>
									) : (
										<span className="text-negative">You lost!</span>
									)}
								</h4>
							)
						)}
					</nav>

					<Divider />

					<div className="flex flex-col gap-3 px-1 flex-1 overflow-y-auto">
						<div className="flex-1">
							<h3 className="text-xs">History</h3>
							<ul className="flex flex-col overflow-y-auto max-h-48">
								{formattedHistory.map((moves, i) => (
									<li
										key={`${moves[0]?.move?.from}-${moves[1]?.move?.to}-${i}`}
										className={cn(
											"flex items-center bg-dark/50",
											(moves[0]?.active || moves[1]?.active) && "bg-light/30"
										)}
									>
										<span className="px-2">{i + 1}.</span>

										<div className="flex items-center flex-1 h-8">
											{moves.map((item, i) => (
												<span
													key={`${item?.move?.from}-${item?.move?.to}-${i}`}
													className={cn(
														"flex-1 px-2 h-full flex items-center",
														item?.active && "border-b",
														i === 1 && "bg-dark/50"
													)}
												>
													{item?.move?.san}
												</span>
											))}
										</div>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h3 className="text-xs">Fen</h3>
							<Input
								type="textarea"
								className="text-sm text-wrap w-full resize-none no-scrollbar"
								contentEditable={false}
								readOnly
								value={gameState?.fen ?? "No FEN"}
							/>
						</div>

						<div>
							<h3 className="text-xs">Pgn</h3>
							<Input
								type="textarea"
								className="text-sm text-wrap w-full resize-none no-scrollbar"
								contentEditable={false}
								readOnly
								value={gameState?.pgn ?? "No PGN"}
							/>
						</div>
					</div>

					<Divider />

					<div className="flex items-center gap-2">
						<Button
							className="h-8 w-fit"
							disabled={!showSummary}
							onClick={openSaveMenu}
						>
							<Icon.Save size={14} /> Save
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};
