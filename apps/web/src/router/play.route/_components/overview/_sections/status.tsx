import { FC, useMemo } from "react";

import { useGameStore } from "@/router/_stores";
import { getGameStateLabel } from "@/shared/utils/game.util";

/** @internal */
const MspItem: FC<{
	content: string;
}> = ({ content }) => {
	return (
		<p className="h-8 px-2 flex items-center justify-center bg-dark/50">
			{content}
		</p>
	);
};

export const GameOverviewStatus: FC = () => {
	const { gameState } = useGameStore();

	const stateLabel = useMemo(() => {
		return getGameStateLabel(gameState);
	}, [gameState]);

	const currentTurn = useMemo(() => {
		return gameState?.turn ?? "";
	}, [gameState?.turn]);

	return (
		<div className="flex gap-1 items-center justify-end text-sm">
			{!!currentTurn && (
				<MspItem
					content={`Turn: ${currentTurn === gameState?.playerSide ? "Your" : "Opponent's"} move`}
				/>
			)}

			<MspItem content={`State: ${stateLabel}`} />
		</div>
	);
};
