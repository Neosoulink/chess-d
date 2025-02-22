import { FC, Fragment } from "react";
import { Routes, Route, Outlet } from "react-router";

import { HomeRoute } from "./home.route";
import { PlayRoute } from "./play.route";
import { GameProvider } from "./providers";
import {
	ActionsSection,
	LoaderComponent,
	MainMenuComponent
} from "./_components/custom";

export const Router: FC = () => (
	<GameProvider>
		<Routes>
			<Route
				path="/"
				element={
					<Fragment>
						<Outlet />
						<ActionsSection />
						<LoaderComponent />
						<MainMenuComponent />
					</Fragment>
				}
			>
				<Route index element={<HomeRoute />} />
				<Route path="/play" element={<PlayRoute />} />
			</Route>
		</Routes>
	</GameProvider>
);
