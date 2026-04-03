import { ObservablePayload } from "@chess-d/shared";
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

import { configureTweakpane } from "@/shared/utils";
import { useGameStore, useLoaderStore } from "../_stores";
import { useChatStore } from "../_stores/chat.store";
import { HAND_STARTED_EMOTE_TOKEN } from "@/shared/tokens";
import { MessageData } from "@/shared/types";
import { HandsController } from "@/core/game/world/hands/hands.controller";
import { LOADER_REGISTER_DATA_SOURCES } from "@/shared/constants";

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
		setInitialGameState,
		setIsResourcesLoaded,
		resetGame,
		reset: resetStore
	} = useGameStore();
	const { notify: chatNotify } = useChatStore();
	const { setIsLoading } = useLoaderStore();
	const { key: routeKey, pathname } = useLocation();

	const rootDom = useMemo(() => document.getElementById("root"), []);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const paneRef = useRef<Pane>(null);
	const statsRef = useRef<Stats>(null);
	const stateRef = useRef<{
		isPending: boolean;
		isReady: boolean;
	}>({ isPending: false, isReady: false });

	const init = useCallback(async () => {
		if (
			stateRef.current.isPending ||
			stateRef.current.isReady ||
			!canvasRef.current
		)
			return;

		stateRef.current.isPending = true;

		setIsLoading(true);
		setIsResourcesLoaded(false);
		register({
			location: workerLocation,
			canvas: canvasRef.current,
			canvasWrapper: "parent",
			fullScreen: false,
			debug: {
				enabled: devMode,
				axesSizes: 5,
				withMiniCamera: false,
				enableControls: true
			},
			loaderDataSources: LOADER_REGISTER_DATA_SOURCES,
			onReady: (_app) => {
				stateRef.current.isPending = false;
				stateRef.current.isReady = true;

				const { worker: appWorker, thread: appThread } =
					_app.module.getWorkerThread() || {};
				const appLoader = _app.module.loader;

				const loadSub = appLoader.getLoadCompleted$().subscribe(() => {
					setIsResourcesLoaded(true);
					loadSub.unsubscribe();
				});

				if (devMode && rootDom) {
					paneRef.current = new Pane();
					statsRef.current = new Stats();

					configureTweakpane(paneRef.current, (type, value) =>
						appWorker?.postMessage({ type: `$tweakpane-${type}`, value })
					);
					rootDom.appendChild(statsRef.current.dom);

					appThread?.getBeforeStep$().subscribe(() => {
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
		setInitialGameState(undefined);
		resetGame();

		setTimeout(() => setIsLoading(false), 100);
	}, [
		isResourcesLoaded,
		pathname,
		resetGame,
		routeKey,
		setInitialGameState,
		setIsLoading
	]);

	useEffect(() => {
		const worker = app?.module.getWorkerThread()?.worker;
		if (!worker) return;

		const handleEmoteStarted = (
			event: MessageEvent<
				MessageData<ObservablePayload<HandsController["emote$$"]>>
			>
		) => {
			const { value, token } = event.data;
			if (!value || !token || token !== HAND_STARTED_EMOTE_TOKEN) return;

			chatNotify({
				content: value.emote.description,
				side: value.side,
				type: "emote"
			});
		};

		worker.addEventListener("message", handleEmoteStarted);
		return () => worker.removeEventListener("message", handleEmoteStarted);
	}, [app, chatNotify]);

	return (
		<section className="relative flex size-full">
			<canvas ref={canvasRef} className="absolute inset-0" />
			{children}
		</section>
	);
};
