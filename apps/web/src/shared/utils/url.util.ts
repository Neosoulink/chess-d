import { GameMode } from "../enum/game.enum";

export const getGameModeFromUrl = (
	searchParams: URLSearchParams = new URL(window.location.href).searchParams
): GameMode | undefined => {
	if (window.location.pathname !== "/play") return undefined;

	const mode = searchParams?.get("mode") as keyof typeof GameMode | undefined;

	if (!mode || typeof GameMode[mode] === "undefined") return GameMode.free;

	return GameMode[mode];
};
