import { FC, Fragment } from "react";

import { MainMenuComponent } from "../components";
import { Outlet } from "react-router";

export const MainLayout: FC = () => (
	<Fragment>
		<Outlet />

		<MainMenuComponent />
	</Fragment>
);
