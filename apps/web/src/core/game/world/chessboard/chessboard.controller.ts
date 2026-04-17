import {
	BOARD_RANGE_CELLS_HALF_SIZE,
	BoardCoord,
	ObservablePayload,
	squareToCoord
} from "@chess-d/shared";
import { filter, fromEvent, map, merge, Observable, share } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { WorldController } from "../world.controller";
import { EngineController } from "../../engine/engine.controller";
import { AppModule } from "@quick-threejs/reactive/worker";
import {
	ChessboardModule,
	InstancedCellModel,
	MatrixCellModel
} from "@chess-d/chessboard";
import { Vector3Like } from "three";
import { SettingsController } from "../../settings/settings.controller";
import { MessageData } from "@/shared/types";
import { CHESSBOARD_WILL_HINT_MARKER_TOKEN } from "@/shared/tokens";
import { Move } from "chess.js";

@scoped(Lifecycle.ContainerScoped)
export class ChessboardController {
	public readonly reset$: Observable<
		ObservablePayload<WorldController["resetDone$$"]>
	>;
	public readonly settingsUpdate$: Observable<
		ObservablePayload<SettingsController["update$"]>
	>;
	public readonly pieceMoved$?: Observable<
		(BoardCoord & { captured?: boolean })[]
	>;
	public readonly cursorCoord$?: Observable<Vector3Like | undefined>;
	public readonly hintMarker$: Observable<BoardCoord[]>;
	public readonly resetMarkers$: Observable<void>;

	constructor(
		@inject(AppModule)
		private readonly _app: AppModule,
		@inject(ChessboardModule)
		private readonly _chessboard: ChessboardModule,
		@inject(SettingsController)
		private readonly _settingsController: SettingsController,
		@inject(WorldController)
		private readonly _worldController: WorldController,
		@inject(EngineController)
		private readonly _engineController: EngineController
	) {
		this.reset$ = this._worldController.resetDone$$.pipe(share());

		this.settingsUpdate$ = this._settingsController.update$.pipe(share());

		this.pieceMoved$ = this._engineController.pieceMoved$?.pipe(
			filter(
				({ startCoord, endCoord }) =>
					!!(
						startCoord &&
						endCoord &&
						(startCoord.col !== endCoord.col || startCoord.row !== endCoord.row)
					)
			),
			map(({ startCoord, endCoord, nextMove, ...others }) => {
				console.log(nextMove, others);

				return [
					{
						col: startCoord.col,
						row: startCoord.row
					},
					{
						col: endCoord!.col,
						row: endCoord!.row,
						captured: !!nextMove?.captured
					}
				];
			})
		);

		this.cursorCoord$ = this._app.mousemove$?.().pipe(
			map(() => {
				const intersections = this._chessboard.getIntersections();
				const cellsIntersection = intersections.find(
					(inter) => inter.object instanceof InstancedCellModel
				);

				let boardCell: MatrixCellModel | undefined;

				if (
					typeof cellsIntersection?.instanceId === "number" &&
					!(boardCell = this._chessboard.board
						.getInstancedCell()
						.getCellByIndex(cellsIntersection.instanceId))
				)
					return undefined;

				return boardCell
					? {
							x: boardCell.position.x + BOARD_RANGE_CELLS_HALF_SIZE,
							y: boardCell.position.y,
							z: boardCell.position.z - BOARD_RANGE_CELLS_HALF_SIZE
						}
					: undefined;
			})
		);

		this.hintMarker$ = fromEvent(self, "message").pipe(
			filter<any>(
				(payload: MessageEvent<MessageData<any>>) =>
					payload.data.token === CHESSBOARD_WILL_HINT_MARKER_TOKEN
			),
			map((payload: MessageEvent<MessageData<{ move: Move }>>) => {
				const { move } = payload.data.value || {};
				if (!move) return [];

				return [squareToCoord(move.from), squareToCoord(move.to)];
			})
		);

		this.resetMarkers$ = merge(
			this._engineController.undo$,
			this._engineController.redo$,
			this._engineController.goToMove$
		).pipe(map(() => undefined));
	}
}
