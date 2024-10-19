import { container } from "tsyringe";
import { isObject } from "@quick-threejs/utils";
import { AppModule } from "@quick-threejs/reactive";
import { Physics, RapierPhysics } from "@chess-d/rapier-physics";

import { CoreModule } from "./core.module";
import { Chess } from "chess.js";

export const setup = async (app: AppModule) => {
	if (!isObject(app))
		throw new Error("Unable to retrieve the application context.");

	container.register(AppModule, { useValue: app });
	container.register(Chess, {
		useValue: new Chess(
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1"
		)
	});
	container.register(Physics, { useValue: await RapierPhysics() });

	return container.resolve<CoreModule>(CoreModule);
};
