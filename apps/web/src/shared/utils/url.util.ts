import { GameMode } from "../enum/game.enum";

export const getGameModeFromUrl = (): GameMode | undefined => {
	if (window.location.pathname !== "/play") return undefined;

	const mode = new URL(window.location.href).searchParams?.get("mode") as
		| keyof typeof GameMode
		| undefined;

	if (!mode || typeof GameMode[mode] === "undefined") return GameMode.free;

	return GameMode[mode];
};
