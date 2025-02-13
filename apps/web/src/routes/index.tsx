import { FC, Fragment } from "react";
import { Routes, Route, Outlet } from "react-router";

import { HomeRoute } from "./home.route";
import { PlayRoute } from "./play.route";
import { GameProvider } from "./providers";
import { LoaderComponent, MainMenuComponent } from "./_components";

export const Router: FC = () => (
	<GameProvider>
		<Routes>
			<Route
				path="/"
				element={
					<Fragment>
						<Outlet />
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
