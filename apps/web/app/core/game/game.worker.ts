import "reflect-metadata";

import { AppModule } from "@quick-threejs/reactive";
import { launchApp } from "@quick-threejs/reactive/worker";
import { isObject } from "@quick-threejs/utils";
import {
	CoreModule as ChessboardModule,
	setup as setupChessboard
} from "@chess-d/chessboard";
import { Chess } from "chess.js";
import { container } from "tsyringe";

import { GameModule } from "./game.module";

launchApp({
	onReady: async (app: AppModule) => {
		const chessboard = await setupChessboard(app);

		if (!isObject(app) || !app.camera)
			throw new Error("Unable to retrieve the application context.");

		container.register(Chess, { useValue: new Chess() });
		container.register(AppModule, { useValue: app });
		container.register(ChessboardModule, { useValue: chessboard });

		const game = container.resolve<GameModule>(GameModule);

		game.init();
	}
});
