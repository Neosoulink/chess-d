import { register } from "@quick-threejs/reactive";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router";
import Stats from "stats-gl";
import { Pane } from "tweakpane";

import { useGameStore } from "../_stores";
import {
	FreeModeComponent,
	WithAIComponent,
	WithHumanComponent
} from "./_components";
import { GameMode } from "../../shared/enum";
import { configureTweakpane, getGameModeFromUrl } from "../../shared/utils";
import pawnPiece from "../../assets/3D/pieces/pawn.glb?url";
import rookPiece from "../../assets/3D/pieces/rook.glb?url";
import knightPiece from "../../assets/3D/pieces/knight.glb?url";
import bishopPiece from "../../assets/3D/pieces/bishop.glb?url";
import queenPiece from "../../assets/3D/pieces/queen.glb?url";
import kingPiece from "../../assets/3D/pieces/king.glb?url";
import masterHand from "../../assets/3D/master-hand.glb?url";

/** @internal */
const workerLocation = new URL(
	"../../core/game/game.worker.ts",
	import.meta.url
) as unknown as string;

export const PlayRoute: FC = () => {
	const [searchParams] = useSearchParams();
	const { app, setApp } = useGameStore();

	const devMode = useMemo(() => import.meta.env?.DEV, []);
	const gameMode = useMemo(
		() => getGameModeFromUrl(searchParams),
		[searchParams]
	);
	const rootDom = useMemo(() => document.getElementById("root"), []);

	const paneRef = useRef<Pane>(null);
	const statsRef = useRef<Stats>(null);
	const stateRef = useRef<{
		isPending: boolean;
		isReady: boolean;
	}>({ isPending: false, isReady: false });

	const init = useCallback(async () => {
		if (stateRef.current.isPending || stateRef.current.isReady) return;
		stateRef.current.isPending = true;

		register({
			location: workerLocation,
			enableDebug: devMode,
			enableControls: true,
			axesSizes: 5,
			withMiniCamera: false,
			loaderDataSources: [
				{
					name: "pawnPiece",
					path: pawnPiece,
					type: "gltf"
				},
				{
					name: "rookPiece",
					path: rookPiece,
					type: "gltf"
				},
				{
					name: "knightPiece",
					path: knightPiece,
					type: "gltf"
				},
				{
					name: "bishopPiece",
					path: bishopPiece,
					type: "gltf"
				},
				{
					name: "queenPiece",
					path: queenPiece,
					type: "gltf"
				},
				{
					name: "kingPiece",
					path: kingPiece,
					type: "gltf"
				},
				{
					name: "masterHand",
					path: masterHand,
					type: "gltf"
				}
			],
			onReady: (_app) => {
				stateRef.current.isPending = false;
				stateRef.current.isReady = true;

				setApp(_app);

				if (!devMode || !rootDom) return;

				const appWorker = _app.module.getWorker() as Worker;
				const appThread = _app.module.getThread();

				paneRef.current = new Pane();
				statsRef.current = new Stats();

				configureTweakpane(paneRef.current, (type, value) =>
					appWorker.postMessage({ type: `$tweakpane-${type}`, value })
				);
				rootDom.appendChild(statsRef.current.dom);

				appThread.getBeforeRender$().subscribe(() => {
					statsRef.current?.begin();
				});

				appThread?.getAfterRender$()?.subscribe(() => {
					statsRef.current?.end();
					statsRef.current?.update();
				});
			}
		});
	}, [devMode, rootDom, setApp]);

	const dispose = useCallback(async () => {
		if (stateRef.current.isPending || !stateRef.current.isReady) return;

		stateRef.current.isPending = false;
		stateRef.current.isReady = false;

		if (statsRef.current) rootDom?.removeChild(statsRef.current.dom);
		paneRef.current?.dispose();

		app?.container.clearInstances();
		await app?.container.dispose();
		setApp(undefined);

		console.log("Game disposed...");
	}, [app, rootDom, setApp]);

	const renderGameMode = useCallback(() => {
		if (gameMode === GameMode.ai || gameMode === GameMode.simulation)
			return <WithAIComponent />;

		if (gameMode === GameMode.human) return <WithHumanComponent />;

		return <FreeModeComponent />;
	}, [gameMode]);

	useEffect(() => {
		if (!app) init();

		return () => {
			if (app && app) dispose();
		};
	}, [app, init, dispose]);

	if (!app) return null;

	return renderGameMode();
};
