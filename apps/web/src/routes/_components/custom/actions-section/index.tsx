import { FC } from "react";

import { ActionsSectionGameHistory } from "./game-history";
import { ActionsSectionGameStatus } from "./game-status";
import { ActionsSectionGameControls } from "./game-controls";
import { ActionsSectionGameMap } from "./game-map";

import "@chrisoakman/chessboard2/dist/chessboard2.min.css";

export const ActionsSection: FC = () => {
	return (
		<section className="h-fit z-10 absolute bottom-0 left-0 pointer-events-none select-none">
			<div className="relative w-dvw flex items-end justify-between p-10">
				<div className="flex flex-col items-start gap-2 text-base text-gray-400 flex-1">
					<h2 className="uppercase mb-1">Game Status</h2>

					<ActionsSectionGameHistory />

					<ActionsSectionGameStatus />
				</div>

				<ActionsSectionGameControls />

				<ActionsSectionGameMap />
			</div>
		</section>
	);
};
