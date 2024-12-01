import { FC, Fragment } from "react";
import { Routes, Route } from "react-router";

import { MainLayout } from "./shared/layouts";
import { HomeRoute } from "./routes/home.route";
import { PlayRoute } from "./routes/play.route";

export const App: FC = () => (
	<Fragment>
		<Routes>
			<Route path="/" element={<MainLayout />}>
				<Route index element={<HomeRoute />} />
				<Route path="/play" element={<PlayRoute />} />
			</Route>
		</Routes>
	</Fragment>
);
