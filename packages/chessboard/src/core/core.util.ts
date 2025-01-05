import { Physics, RapierPhysics } from "@chess-d/rapier-physics";
import { DEFAULT_FEN, PieceType } from "@chess-d/shared";
import { isObject } from "@quick-threejs/utils";
import { AppModule, ContainerizedApp } from "@quick-threejs/reactive";
import { validateFen } from "chess.js";
import { BufferGeometry } from "three";
import { container } from "tsyringe";

import { INITIAL_FEN_TOKEN, PIECE_GEOMETRIES_TOKEN } from "../shared";
import { CoreModule } from "./core.module";

/**
 * @description Setup the chessboard module.
 *
 * @param app - The `@quick-three/reactive` application context.
 * @param fen - The initial position of the pieces in [FEN](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation) format.
 * @param piecesGeometry - The pieces geometries.
 */
export const setup = async (
	app: AppModule,
	fen = DEFAULT_FEN,
	piecesGeometry: Partial<Record<PieceType, BufferGeometry>> = {}
): Promise<ContainerizedApp<CoreModule>> => {
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
	container.register(PIECE_GEOMETRIES_TOKEN, { useValue: piecesGeometry });

	const module = container.resolve(CoreModule);

	return { container, module };
};
