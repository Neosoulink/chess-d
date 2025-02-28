import { FC } from "react";
import { Routes, Route, Outlet } from "react-router";

import { HomeRoute } from "./home.route";
import { PlayRoute } from "./play";
import { GameProvider } from "./_providers";
import {
	ActionsSection,
	HistoryModal,
	Loader,
	MainMenu
} from "./_components/custom";

export const Router: FC = () => (
	<Routes>
		<Route
			element={
				<GameProvider>
					<Outlet />
					<ActionsSection />
					<Loader />
					<HistoryModal />
					<MainMenu />
				</GameProvider>
			}
		>
			<Route index element={<HomeRoute />} />
			<Route path="/play" element={<PlayRoute />} />
		</Route>
	</Routes>
);
