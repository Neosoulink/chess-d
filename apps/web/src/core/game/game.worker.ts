import "reflect-metadata";

import { container } from "tsyringe";
import { AppModule } from "@quick-threejs/reactive";
import { launchApp } from "@quick-threejs/reactive/worker";
import { isObject } from "@quick-threejs/utils";
import { CoreModule as ChessboardModule } from "@chess-d/chessboard/dist/core/core.module";
import { setup as setupChessboard } from "@chess-d/chessboard";

import { GameModule } from "./game.module";

launchApp({
	onReady: async (app: AppModule) => {
		const chessboard = await setupChessboard(app);

		if (!isObject(app) || !app.camera)
			throw new Error("Unable to retrieve the application context.");

		container.register(AppModule, { useValue: app });
		container.register(ChessboardModule, { useValue: chessboard });

		const game = container.resolve<GameModule>(GameModule);

		game.init();
	}
});
