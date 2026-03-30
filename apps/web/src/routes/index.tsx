import { FC } from "react";
import { Routes, Route, Outlet } from "react-router";

import { HomeRoute } from "./home.route";
import { PlayRoute } from "./play";
import { GameProvider } from "./_providers";
import { Loader } from "./_components/custom";
import { MainMenuComponent } from "./_components/global";

export const Router: FC = () => (
	<Routes>
		<Route
			element={
				<GameProvider>
					<Outlet />
					<Loader />
					<MainMenuComponent />
				</GameProvider>
			}
		>
			<Route index element={<HomeRoute />} />
			<Route path="/play" element={<PlayRoute />} />
		</Route>
	</Routes>
);
