import { useEffect } from "react";
import { MainMenuSection } from "../shared/enum";
import { useMainMenuStore } from "./_stores";

export const HomeRoute = () => {
	const { open: openMenu } = useMainMenuStore();

	useEffect(() => {
		openMenu();
	}, [openMenu]);

	return null;
};
