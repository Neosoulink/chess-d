import "reflect-metadata";

import { register, RegisterModule } from "@quick-threejs/reactive";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import "./assets/styles/main.css";

const location = new URL(
	"./main.worker.ts",
	import.meta.url
) as unknown as string;
const enableDebug = !!import.meta.env?.DEV;

const onReady = (app: RegisterModule) => {
	const gui = app.gui() as GUI | undefined;
	gui?.close();

	app.workerPool().run({
		payload: {
			path: new URL("./ai.worker.ts", import.meta.url) as unknown as string,
			subject: {}
		}
	});
};

register({
	location,
	enableDebug,
	axesSizes: 5,
	gridSizes: 10,
	withMiniCamera: true,
	onReady
});
