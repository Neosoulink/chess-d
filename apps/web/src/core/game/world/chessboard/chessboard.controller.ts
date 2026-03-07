import {
	BOARD_CELL_SIZE,
	BOARD_RANGE_CELLS_HALF_SIZE,
	BoardCoord,
	ObservablePayload
} from "@chess-d/shared";
import { filter, map, Observable, share } from "rxjs";
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

@scoped(Lifecycle.ContainerScoped)
export class ChessboardController {
	public readonly reset$: Observable<
		ObservablePayload<WorldController["resetDone$$"]>
	>;
	public readonly pieceMoved$?: Observable<
		(BoardCoord & { captured?: boolean })[]
	>;
	public readonly cursorCoord$?: Observable<Vector3Like | undefined>;

	constructor(
		@inject(AppModule)
		private readonly _app: AppModule,
		@inject(ChessboardModule)
		private readonly _chessboard: ChessboardModule,
		@inject(WorldController)
		private readonly _worldController: WorldController,
		@inject(EngineController)
		private readonly _engineController: EngineController
	) {
		this.reset$ = this._worldController.resetDone$$.pipe(share());

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
	}
}
