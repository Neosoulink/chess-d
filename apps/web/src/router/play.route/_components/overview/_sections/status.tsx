import { FC, ReactNode, useMemo } from "react";

import { useGameStore } from "@/router/_stores";
import { getGameStateLabel } from "@/shared/utils/game.util";
import { useSearchParams } from "react-router";
import { getGameModeFromUrl } from "@/shared/utils";
import { GameMode } from "@/shared/enum";
import { Icon } from "@/router/_components/core";

/** @internal */
const MspItem: FC<{
	content: ReactNode;
}> = ({ content }) => {
	return (
		<p className="h-8 px-2 items-center justify-center bg-dark/50 flex gap-1">
			{content}
		</p>
	);
};

export const GameOverviewStatus: FC = () => {
	const { gameState } = useGameStore();
	const [searchParams] = useSearchParams();

	const gameMode = useMemo(
		() => getGameModeFromUrl(searchParams),
		[searchParams]
	);

	const stateLabel = useMemo(() => {
		return getGameStateLabel(gameState);
	}, [gameState]);

	const currentTurn = useMemo(() => {
		return gameState?.turn ?? "";
	}, [gameState?.turn]);

	const isPlayerTurn = useMemo(() => {
		return currentTurn === gameState?.playerSide;
	}, [currentTurn, gameState?.playerSide]);

	return (
		<div className="flex gap-1 items-center justify-end text-sm">
			{!!currentTurn && (
				<MspItem
					content={
						<>
							{gameMode === GameMode.simulation ? (
								<>
									<Icon.Hourglass className="animate-pulse" />{" "}
									{`AI-${isPlayerTurn ? "1" : "2"} thinking`}
								</>
							) : gameMode === GameMode.free ? (
								"Turn:"
							) : (
								<>
									{isPlayerTurn ? (
										"Your Turn"
									) : (
										<>
											<Icon.Hourglass className="animate-pulse" />
											Opponent thinking
										</>
									)}
								</>
							)}

							<span className="uppercase">({currentTurn})</span>
						</>
					}
				/>
			)}

			<MspItem content={`State: ${stateLabel}`} />
		</div>
	);
};
