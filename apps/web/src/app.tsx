import { FC, Fragment } from "react";
import { Routes, Route, Outlet } from "react-router";

import { HomeRoute } from "./routes/home.route";
import { PlayRoute } from "./routes/play.route";
import { MainMenuComponent } from "./shared/components";

export const App: FC = () => (
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
