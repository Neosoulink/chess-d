import { FC } from "react";
import { Routes as NativeRoutes, Route } from "react-router";

import { MainMenuComponent } from "./shared/components";
import { HomeRoute } from "./routes/home.route";

export const App: FC = () => (
	<>
		<NativeRoutes>
			<Route index element={<HomeRoute />} />
		</NativeRoutes>

		<MainMenuComponent />
	</>
);
