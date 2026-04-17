import { ComponentProps, FC, useEffect, useMemo, useRef } from "react";

import { cn, getGameModeFromUrl } from "@/shared/utils";
import { MoveLike } from "@/shared/types";
import { useGameStore } from "@/router/_stores";
import { Button, Icon } from "@/router/_components/core";
import { GameOverviewButton } from "../_components/button";
import { useSearchParams } from "react-router";
import { GameMode } from "@/shared/enum";

/** @internal */
const MovesItem: FC<{
	moveNumber: number;
	moves: [
		move1?: { active: boolean; move?: MoveLike } | undefined,
		move2?: { active: boolean; move?: MoveLike } | undefined
	];
	onGoToMove?: (move: MoveLike) => void;
}> = ({ moveNumber, moves, onGoToMove }) => {
	const hasActiveMove = moves.find((data) => data?.active);

	return (
		<li
			aria-current={hasActiveMove ? "true" : "false"}
			className={cn(
				"relative flex items-center justify-center gap-1 bg-dark/80 px-1 h-8 w-fit"
			)}
		>
			<div
				className={cn(
					"absolute top-0 left-0 w-full h-full bg-linear-to-r from-primary/25 to-secondary/25 transition-opacity duration-250 opacity-0 z-0",
					hasActiveMove && "opacity-100"
				)}
			/>

			{moves.map(
				(data, i) =>
					!!data?.move && (
						<Button
							key={`${data.move.san}-${i}`}
							className={cn(
								"flex-1 text-base font-bold opacity-80 h-6 bg-transparent border-b border-b-transparent hover:text-light hover:opacity-100 z-1 text-nowrap",
								data.active &&
									"text-light opacity-100 bg-light/30 border-b-light",
								moves?.length === 1 && "col-span-1"
							)}
							onClick={() => !!data.move && onGoToMove?.(data.move)}
						>
							{data.move.san}
						</Button>
					)
			)}

			<h3
				className={cn(
					"min-w-4 text-sm text-center text-light/50",
					moves.find((data) => data?.active)?.active && "text-light/70"
				)}
			>
				.{moveNumber}
			</h3>
		</li>
	);
};

export const GameOverviewHistory: FC = () => {
	const { gameState, setShowSummary, goToMove } = useGameStore();
	const [searchParams] = useSearchParams();

	const gameMode = useMemo(
		() => getGameModeFromUrl(searchParams),
		[searchParams]
	);

	const formattedHistory = useMemo(() => {
		const history = (gameState?.history?.slice() as MoveLike[]) || [];
		const redoHistory = gameState?.redoHistory?.slice().reverse() || [];

		const _combinedMoves: MoveLike[] = [...history, ...redoHistory];
		const _newMoves: ComponentProps<typeof MovesItem>["moves"][] = [];

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

	const scrollableContainer = useRef<HTMLUListElement>(null);

	useEffect(() => {
		const container = scrollableContainer.current;
		const item = container?.querySelector("[aria-current='true']") as
			| HTMLLIElement
			| undefined;

		if (!container || !item) return;

		const containerWidth = container.clientWidth;
		const itemLeft = item.offsetLeft;
		const itemWidth = item.offsetWidth;

		container.scrollTo({
			left: itemLeft - containerWidth / 2 + itemWidth / 2,
			behavior: "smooth"
		});
	}, [formattedHistory]);

	return (
		<div className="w-72 flex gap-1 items-center justify-end mask-l-from-95%">
			<div className="flex-1 w-full h-8 flex items-center justify-end">
				<ul
					ref={scrollableContainer}
					className="flex gap-1 overflow-x-auto no-scrollbar pointer-events-auto max-w-full w-fit pl-14"
				>
					{formattedHistory.map((move, i) => (
						<MovesItem
							key={`${move[0]?.move?.from}-${move[1]?.move?.to}-${i}`}
							moveNumber={i + 1}
							moves={move}
							onGoToMove={
								gameMode !== GameMode.multiplayer ? goToMove : undefined
							}
						/>
					))}
				</ul>

				{!formattedHistory.length && (
					<span className="text-xs text-light/50 uppercase">No moves</span>
				)}
			</div>

			<GameOverviewButton onClick={() => setShowSummary(true)}>
				<Icon.Popup />
			</GameOverviewButton>
		</div>
	);
};
