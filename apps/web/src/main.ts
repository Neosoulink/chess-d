import "reflect-metadata";

import { register } from "@quick-threejs/reactive";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import "./assets/styles/main.css";

register({
	location: new URL("./main.worker.ts", import.meta.url) as unknown as string,
	enableDebug: !!import.meta.env?.DEV,
	axesSizes: 5,
	gridSizes: 10,
	withMiniCamera: true,
	onReady: (app) => {
		const gui = app.gui() as GUI | undefined;
		gui?.close();
	}
});
