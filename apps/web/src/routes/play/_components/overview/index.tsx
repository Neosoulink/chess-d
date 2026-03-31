import { FC } from "react";
import { useLocation } from "react-router";

import { GameOverviewHistory } from "./_components/history";
import { GameOverviewStatus } from "./_components/status";
import { GameOverviewControls } from "./_components/controls";
import { GameOverviewMap } from "./_components/mini-map";

import "@chrisoakman/chessboard2/dist/chessboard2.min.css";

export const PlayOverview: FC = () => {
	const { pathname } = useLocation();

	if (!pathname.startsWith("/play")) return null;

	return (
		<section className="flex flex-col items-end gap-2 h-fit z-10 absolute bottom-6 right-6 pointer-events-none select-none">
			<GameOverviewMap />

			<GameOverviewControls />

			<GameOverviewHistory />

			<GameOverviewStatus />
		</section>
	);
};
