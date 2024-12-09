import { FC, Fragment } from "react";
import { Routes, Route, Outlet } from "react-router";

import { HomeRoute } from "./home.route";
import { PlayRoute } from "./play";
import { MainMenuComponent } from "./_components/main-menu";

export const Router: FC = () => (
	<Fragment>
		<Routes>
			<Route
				path="/"
				element={
					<Fragment>
						<Outlet />

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
