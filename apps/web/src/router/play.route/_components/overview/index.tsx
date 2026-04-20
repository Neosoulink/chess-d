import { FC } from "react";
import { useLocation } from "react-router";

import { GameOverviewHistory } from "./_sections/history";
import { GameOverviewStatus } from "./_sections/status";
import { GameOverviewControls } from "./_sections/controls";
import { GameOverviewMap } from "./_sections/mini-map";

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
