import { useEffect } from "react";

import { register, RegisterModule } from "@quick-threejs/reactive";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

const location = new URL(
	"./core/main.worker.ts",
	import.meta.url
) as unknown as string;
const enableDebug = !!import.meta.env?.DEV;

const onReady = (app: RegisterModule) => {
	const gui = app.gui() as GUI | undefined;
	gui?.close();

	app.workerPool().run({
		payload: {
			path: new URL(
				"./core/ai.worker.ts",
				import.meta.url
			) as unknown as string,
			subject: {}
		}
	});
};

export const App = () => {
	useEffect(() => {
		register({
			location,
			enableDebug,
			axesSizes: 5,
			gridSizes: 10,
			withMiniCamera: true,
			onReady
		});
	}, []);

	return <div />;
};
