import "reflect-metadata";

import { container } from "tsyringe";
import { AppModule } from "@quick-threejs/reactive";
import { launchApp } from "@quick-threejs/reactive/worker";
import { isObject } from "@quick-threejs/utils";
import { setup as setupChessboard } from "@chess-d/chessboard";
import { CoreModule as ChessCoreModule } from "@chess-d/chessboard/dist/core/core.module";

import { CoreModule } from "./core.module";

const setupClient = async (app: AppModule, chessboard: ChessCoreModule) => {
	if (!isObject(app) || !app.camera)
		throw new Error("Unable to retrieve the application context.");

	container.register(AppModule, { useValue: app });
	container.register(ChessCoreModule, { useValue: chessboard });

	return container.resolve<CoreModule>(CoreModule);
};

const onReady = async (app: AppModule) => {
	const chessboard = await setupChessboard(app);
	setupClient(app, chessboard);
};

launchApp({
	onReady
});
