import { FC } from "react";
import { Routes, Route, Outlet } from "react-router";

import { Loader } from "./_components/custom";
import {
	GlobalExperience,
	GlobalTheme,
	GlobalMainMenu,
	GlobalAudios
} from "./_components/global";
import { HomeRoute } from "./home.route";
import { PlayRoute } from "./play.route";

import "@chrisoakman/chessboard2/dist/chessboard2.min.css";

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
					<GlobalAudios />
				</>
			}
		>
			<Route index path="*" element={<HomeRoute />} />
			<Route path="/play" element={<PlayRoute />} />
		</Route>
	</Routes>
);
