import { FC, Fragment } from "react";
import { Routes, Route, Outlet } from "react-router";

import { HomeRoute } from "./home.route";
import { PlayRoute } from "./play.route";
import {
	ExperienceComponent,
	LoadingWallComponent,
	MainMenuComponent
} from "./_components";

export const Router: FC = () => (
	<Fragment>
		<Routes>
			<Route
				path="/"
				element={
					<Fragment>
						<Outlet />

						<ExperienceComponent />
						<LoadingWallComponent />
						<MainMenuComponent />
					</Fragment>
				}
			>
				<Route index element={<HomeRoute />} />
				<Route path="/play" element={<PlayRoute />} />
			</Route>
		</Routes>
	</Fragment>
);
