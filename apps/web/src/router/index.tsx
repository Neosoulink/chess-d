import { FC } from "react";
import { Routes, Route, Outlet } from "react-router";

import { Loader } from "./_components/custom";
import {
	GlobalExperience,
	GlobalTheme,
	GlobalMainMenu
} from "./_components/global";
import { HomeRoute } from "./home.route";
import { PlayRoute } from "./play.route";

export const Router: FC = () => (
	<Routes>
		<Route
			element={
				<>
					<GlobalExperience />
					<Outlet />
					<GlobalTheme />
					<GlobalMainMenu />
					<Loader />
				</>
			}
		>
			<Route index path="*" element={<HomeRoute />} />
			<Route path="/play" element={<PlayRoute />} />
		</Route>
	</Routes>
);
