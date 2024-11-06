import { useEffect } from "react";

import { register, RegisterModule } from "@quick-threejs/reactive";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Move } from "chess.js";
import { useSocket } from "./hooks/use-socket.hook";

const location = new URL(
	"./core/main.worker.ts",
	import.meta.url
) as unknown as string;
const enableDebug = !!import.meta.env?.DEV;

const onReady = async (app: RegisterModule) => {
	const gui = app.gui() as GUI | undefined;
	gui?.close();

	const aiWorker = await app.workerPool().run({
		payload: {
			path: new URL(
				"./core/ai.worker.ts",
				import.meta.url
			) as unknown as string,
			subject: {}
		}
	});

	aiWorker.thread?.movePerformed$()?.subscribe((payload: Move) => {
		console.log("AI move performed...", payload);
		app.worker()?.postMessage?.({
			type: "piece_moved",
			payload
		});
	});
};

export const App = () => {
	const { socket, currentPlayer, playersList } = useSocket();

	useEffect(() => {
		register({
			location,
			enableDebug,
			axesSizes: 5,
			gridSizes: 10,
			withMiniCamera: true,
			onReady: async (app) => {
				await onReady(app);
				socket.connect();
			}
		});
	}, []);

	useEffect(() => {
		console.log(currentPlayer, playersList);
	}, [currentPlayer, playersList]);

	return <div />;
};
