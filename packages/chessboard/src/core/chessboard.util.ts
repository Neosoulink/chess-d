import { Physics, RapierPhysics } from "@chess-d/rapier";
import { DEFAULT_FEN, PieceType } from "@chess-d/shared";
import { isObject, ProxyReceiver } from "@quick-threejs/utils";
import { validateFen } from "chess.js";
import { BufferGeometry, Camera } from "three";
import { container } from "tsyringe";

import {
	CAMERA_TOKEN,
	DEBUG_MODE_TOKEN,
	INITIAL_FEN_TOKEN,
	MOUSE_DOWN_OBSERVABLE_TOKEN,
	MOUSE_UP_OBSERVABLE_TOKEN
} from "../shared";
import { ChessboardModule } from "./chessboard.module";
import { fromEvent, Observable } from "rxjs";
import {} from "../shared/tokens/observables.token";

export interface SetupProps {
	/**
	 * @description The scene camera.
	 *
	 * Will be used to calculate the pieces positions on the board.
	 */
	camera: Camera;

	/**@description The initial position of the pieces in [FEN](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation) format. */
	fen?: string;

	/** @description The pieces {@link BufferGeometry geometries}. */
	piecesGeometries?: Partial<Record<PieceType, BufferGeometry>>;

	/** @description The proxy target to use to listen to events.  */
	proxyTarget?: ProxyReceiver<Record<string, unknown>>;

	/**
	 * @description The observables to use to listen to events.
	 *
	 * @important If not provided, the `proxyTarget` must be provided.
	 */
	observables?:
		| Record<"mousedown$" | "mouseup$", Observable<Event> | undefined>
		| undefined;

	/** @description Enable debug mode. */
	enableDebug?: boolean;
}

/**
 * @description Setup the chessboard module.
 *
 * @param props - {@link SetupProps}
 */
export const setup = async (props: SetupProps) => {
	const {
		camera,
		fen = DEFAULT_FEN,
		piecesGeometries = {},
		proxyTarget,
		observables
	} = props;

	if (!isObject(camera)) throw new Error("Invalid camera.");

	const fenValidation = validateFen(fen);
	if (!fenValidation.ok)
		throw new Error("Invalid pieces positions FEN notation.", {
			cause: fenValidation.error
		});

	let mousedown$: Observable<Event> | undefined;
	let mouseup$: Observable<Event> | undefined;

	if (typeof observables?.mousedown$?.pipe === "function")
		mousedown$ = observables.mousedown$;

	if (typeof observables?.mouseup$?.pipe === "function")
		mouseup$ = observables.mouseup$;

	if (proxyTarget) {
		if (!(observables?.mousedown$ instanceof Observable))
			mousedown$ = fromEvent(proxyTarget as unknown as Window, "mousedown");

		if (!(observables?.mouseup$ instanceof Observable))
			mouseup$ = fromEvent(proxyTarget as unknown as Window, "mouseup");
	}

	if (!mousedown$ || !mouseup$)
		throw new Error(
			"Invalid observables. Please provide valid observables or a proxy target."
		);

	container.register(Physics, { useValue: await RapierPhysics() });
	container.register(CAMERA_TOKEN, { useValue: camera });
	container.register(INITIAL_FEN_TOKEN, { useValue: fen });
	container.register(MOUSE_DOWN_OBSERVABLE_TOKEN, { useValue: mousedown$ });
	container.register(MOUSE_UP_OBSERVABLE_TOKEN, { useValue: mouseup$ });
	container.register(DEBUG_MODE_TOKEN, { useValue: !!props.enableDebug });

	const module = container.resolve(ChessboardModule);

	Object.keys(piecesGeometries).forEach((key) => {
		const geometry = piecesGeometries[key as PieceType];
		if (geometry instanceof BufferGeometry)
			module.resources.setPieceGeometry(key as PieceType, geometry);
	});

	return { container, module };
};
