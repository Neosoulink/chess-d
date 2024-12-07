import { container } from "tsyringe";
import { validateFen } from "chess.js";
import { isObject } from "@quick-threejs/utils";
import { AppModule } from "@quick-threejs/reactive";
import { Physics, RapierPhysics } from "@chess-d/rapier-physics";
import { DEFAULT_FEN } from "@chess-d/shared";

import { INITIAL_FEN_TOKEN } from "../shared";
import { CoreModule } from "./core.module";

/**
 * @description Setup the chessboard module.
 *
 * @param app - The `@quick-three/reactive` application context.
 * @param fen - The initial position of the pieces in [FEN](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation) format.
 */
export const setup = async (app: AppModule, fen = DEFAULT_FEN) => {
	if (!isObject(app) || !(app instanceof AppModule))
		throw new Error("Unable to retrieve the application context.");

	const fenValidation = validateFen(fen);
	if (!fenValidation.ok)
		throw new Error("Invalid pieces positions FEN notation.", {
			cause: fenValidation.error
		});

	container.register(AppModule, { useValue: app });
	container.register(Physics, { useValue: await RapierPhysics() });
	container.register(INITIAL_FEN_TOKEN, { useValue: fen });

	return container.resolve(CoreModule);
};
