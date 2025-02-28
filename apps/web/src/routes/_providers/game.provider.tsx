import { register } from "@quick-threejs/reactive";
import {
	FC,
	PropsWithChildren,
	useCallback,
	useEffect,
	useMemo,
	useRef
} from "react";
import { useLocation } from "react-router";
import Stats from "stats-gl";
import { Pane } from "tweakpane";

import { configureTweakpane } from "../../shared/utils";
import { useGameStore, useLoaderStore } from "../_stores";

import pawnPiece from "../../assets/3D/pieces/pawn.glb?url";
import rookPiece from "../../assets/3D/pieces/rook.glb?url";
import knightPiece from "../../assets/3D/pieces/knight.glb?url";
import bishopPiece from "../../assets/3D/pieces/bishop.glb?url";
import queenPiece from "../../assets/3D/pieces/queen.glb?url";
import kingPiece from "../../assets/3D/pieces/king.glb?url";
import masterHand from "../../assets/3D/master-hand.glb?url";
import helvetikerFont from "../../assets/fonts/typefaces/helvetiker_regular.typeface.json?url";

/** @internal */
const devMode = import.meta.env?.DEV;

/** @internal */
const workerLocation = new URL(
	devMode ? "../../core/game/game.worker.ts" : "./game-worker.js",
	import.meta.url
) as unknown as string;

export const GameProvider: FC<PropsWithChildren> = ({ children }) => {
	const {
		app,
		isResourcesLoaded,
		setApp,
		setFen,
		setIsResourcesLoaded,
		resetGame,
		reset: resetStore
	} = useGameStore();
	const { setIsLoading } = useLoaderStore();
	const { key: routeKey, pathname } = useLocation();

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

		setIsLoading(true);
		setIsResourcesLoaded(false);
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
				},
				{
					name: "helvetikerFont",
					path: helvetikerFont,
					type: "font"
				}
			],
			onReady: (_app) => {
				stateRef.current.isPending = false;
				stateRef.current.isReady = true;

				const appWorker = _app.module.getWorker() as Worker;
				const appThread = _app.module.getThread();

				const loadSub = _app.module.loader.getLoadCompleted$().subscribe(() => {
					setIsResourcesLoaded(true);
					loadSub.unsubscribe();
				});

				if (devMode && rootDom) {
					paneRef.current = new Pane();
					statsRef.current = new Stats();

					configureTweakpane(paneRef.current, (type, value) =>
						appWorker.postMessage({ type: `$tweakpane-${type}`, value })
					);
					rootDom.appendChild(statsRef.current.dom);

					appThread.getBeforeStep$().subscribe(() => {
						statsRef.current?.begin();
					});

					appThread?.getStep$()?.subscribe(() => {
						statsRef.current?.end();
						statsRef.current?.update();
					});
				}

				setApp(_app);
			}
		});
	}, [setIsLoading, rootDom, setApp, setIsResourcesLoaded]);

	const dispose = useCallback(async () => {
		if (stateRef.current.isPending || !stateRef.current.isReady) return;

		stateRef.current.isPending = false;
		stateRef.current.isReady = false;
		setIsResourcesLoaded(false);

		if (statsRef.current) rootDom?.removeChild(statsRef.current.dom);
		paneRef.current?.dispose();

		app?.container.clearInstances();
		await app?.container.dispose();
		resetStore();
	}, [app?.container, resetStore, rootDom, setIsResourcesLoaded]);

	useEffect(() => {
		if (!app) init();

		return () => {
			if (app) dispose();
		};
	}, [app, init, dispose]);

	useEffect(() => {
		if (pathname.startsWith("/play") || !isResourcesLoaded) return;

		setIsLoading(true);
		setFen(undefined);
		resetGame();

		setTimeout(() => setIsLoading(false), 100);
	}, [isResourcesLoaded, pathname, resetGame, routeKey, setFen, setIsLoading]);

	return children;
};
