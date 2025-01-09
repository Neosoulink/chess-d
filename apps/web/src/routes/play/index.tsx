import {
	ContainerizedApp,
	register,
	RegisterModule
} from "@quick-threejs/reactive";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { useGameStore } from "../_stores";
import {
	FreeModeComponent,
	WithAIComponent,
	WithHumanComponent
} from "./_components";
import { GameMode } from "../../shared/enum";
import { getGameModeFromUrl } from "../../shared/utils";

import pawnPiece from "../../assets/3D/pieces/pawn.glb?url";
import rockPiece from "../../assets/3D/pieces/rock.glb?url";
import knightPiece from "../../assets/3D/pieces/knight.glb?url";
import bishopPiece from "../../assets/3D/pieces/bishop.glb?url";
import queenPiece from "../../assets/3D/pieces/queen.glb?url";
import kingPiece from "../../assets/3D/pieces/king.glb?url";
import chessboardWrapper from "../../assets/3D/chessboard.glb?url";
import masterHand from "../../assets/3D/master-hand.glb?url";

/** @internal */
const workerLocation = new URL(
	"../../core/game/game.worker.ts",
	import.meta.url
) as unknown as string;

export const PlayRoute: FC = () => {
	const { app, setApp } = useGameStore();
	const [localApp, setLocalApp] = useState<ContainerizedApp<RegisterModule>>();
	const [searchParams] = useSearchParams();
	const gameMode = useMemo(
		() => getGameModeFromUrl(searchParams),
		[searchParams]
	);

	const state = useRef<{
		isPending: boolean;
		isReady: boolean;
	}>({ isPending: false, isReady: false });

	const init = useCallback(async () => {
		if (state.current.isPending || state.current.isReady) return;
		state.current.isPending = true;

		console.log("Initializing game...");

		register({
			location: workerLocation,
			enableDebug: !!import.meta.env?.DEV,
			axesSizes: 5,
			gridSizes: 10,
			withMiniCamera: true,
			loaderDataSources: [
				{
					name: "pawnPiece",
					path: pawnPiece,
					type: "gltfModel"
				},
				{
					name: "rockPiece",
					path: rockPiece,
					type: "gltfModel"
				},
				{
					name: "knightPiece",
					path: knightPiece,
					type: "gltfModel"
				},
				{
					name: "bishopPiece",
					path: bishopPiece,
					type: "gltfModel"
				},
				{
					name: "queenPiece",
					path: queenPiece,
					type: "gltfModel"
				},
				{
					name: "kingPiece",
					path: kingPiece,
					type: "gltfModel"
				},
				{
					name: "chessboardWrapper",
					path: chessboardWrapper,
					type: "gltfModel"
				},
				{
					name: "masterHand",
					path: masterHand,
					type: "gltfModel"
				}
			],
			onReady: (_app) => {
				state.current.isPending = false;
				state.current.isReady = true;

				setApp(_app);
				setLocalApp(_app);
			}
		});
	}, [setApp]);

	const dispose = useCallback(async () => {
		if (state.current.isPending || !state.current.isReady) return;

		await localApp?.container?.dispose();

		state.current.isPending = false;
		state.current.isReady = false;

		setLocalApp(undefined);

		console.log("Game disposed...");
	}, [localApp]);

	const renderGameMode = useCallback(() => {
		if (gameMode === GameMode.ai || gameMode === GameMode.simulation)
			return <WithAIComponent />;

		if (gameMode === GameMode.human) return <WithHumanComponent />;

		return <FreeModeComponent />;
	}, [gameMode]);

	useEffect(() => {
		if (!localApp) init();

		return () => {
			if (app && localApp) dispose();
		};
	}, [app, init, dispose, localApp]);

	if (!app) return null;

	return renderGameMode();
};
