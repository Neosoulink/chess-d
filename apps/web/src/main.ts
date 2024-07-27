import "reflect-metadata";

import { register } from "@quick-threejs/reactive";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import "./assets/styles/main.css";

register({
	location: new URL("./main.worker.ts", import.meta.url) as unknown as string,
	enableDebug: true,
	axesSizes: 5,
	gridSizes: 10,
	withMiniCamera: true,
	onReady: (app) => {
		const gui = app.gui() as GUI | undefined;

		gui
			?.add({ pawnPositionCol: 0 }, "pawnPositionCol")
			.step(1)
			.min(0)
			.max(7)
			.onChange((value: number) => {
				app.worker()?.postMessage({ type: "pawnPositionCol", value });
			});

		gui
			?.add({ pawnPositionRow: 0 }, "pawnPositionRow")
			.step(1)
			.min(0)
			.max(7)
			.onChange((value: number) => {
				app.worker()?.postMessage({ type: "pawnPositionRow", value });
			});
	}
});
