import { FC } from "react";
import { Routes, Route, Outlet } from "react-router";

import {
	GlobalExperience,
	GlobalTheme,
	GlobalMainMenu,
	GlobalAudios,
	GlobalTopRightSection,
	GlobalTopLeftSection,
	GlobalLoader,
	GlobalMobileWarning
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
					<GlobalLoader />
					<GlobalAudios />
					<GlobalTopLeftSection />
					<GlobalTopRightSection />
					<GlobalMobileWarning />
				</>
			}
		>
			<Route index path="*" element={<HomeRoute />} />
			<Route path="/play" element={<PlayRoute />} />
		</Route>
	</Routes>
);
