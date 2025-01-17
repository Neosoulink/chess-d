import { copyProperties } from "@quick-threejs/utils";
import { BoardCoord, coordToSquare } from "@chess-d/shared";
import { inject, singleton } from "tsyringe";
import {
	filter,
	fromEvent,
	map,
	merge,
	Observable,
	share,
	Subject,
	switchMap,
	take,
	takeUntil
} from "rxjs";
import { Intersection, Vector3, Vector3Like } from "three";

import {
	InstancedCellModel,
	MatrixPieceModel,
	InstancedPieceModel,
	PieceNotificationPayload,
	MOUSE_DOWN_OBSERVABLE_TOKEN,
	MOUSE_UP_OBSERVABLE_TOKEN
} from "../../shared";
import { ChessboardService } from "../chessboard.service";
import { ResourceService } from "../resource/resource.service";
import { ChessboardController } from "../chessboard.controller";

@singleton()
export class PiecesController {
	public readonly pieceDeselected$$ = new Subject<PieceNotificationPayload>();
	public readonly pieceSelected$?: Observable<PieceNotificationPayload>;
	public readonly pieceMoving$?: Observable<PieceNotificationPayload>;
	public readonly pieceDeselected$?: Observable<PieceNotificationPayload>;

	constructor(
		@inject(MOUSE_DOWN_OBSERVABLE_TOKEN)
		private readonly _mousedown$: Observable<MouseEvent>,
		@inject(MOUSE_UP_OBSERVABLE_TOKEN)
		private readonly _mouseup$: Observable<MouseEvent>,
		@inject(ChessboardController)
		private readonly _chessboardController: ChessboardController,
		@inject(ChessboardService)
		private readonly _coreComponent: ChessboardService,
		@inject(ResourceService)
		private readonly _resourceService: ResourceService
	) {
		this.pieceSelected$ = this._mousedown$.pipe(
			map(() => {
				const intersections = this._coreComponent.getIntersections();
				const piecesIntersection = intersections.find(
					(inter) => inter.object instanceof InstancedPieceModel
				) as Intersection<InstancedPieceModel> | undefined;
				const instancedPiece = piecesIntersection?.object;

				let piece: MatrixPieceModel | undefined;

				if (
					typeof piecesIntersection?.instanceId !== "number" ||
					!(instancedPiece instanceof InstancedPieceModel) ||
					!(piece = instancedPiece.getPieceByInstanceId(
						piecesIntersection.instanceId
					))
				)
					return undefined as any;

				const startPosition = piece.position.clone();
				const startSquare = coordToSquare(piece.coord);
				const startCoord = copyProperties(piece.coord, [
					"col",
					"row"
				]) as BoardCoord;
				const lastPosition = startPosition;
				const pieceGeometry = this._resourceService.getGeometryByType(
					piece.type
				);
				const colorSide = piece.color;

				return {
					piecesIntersection,
					instancedPiece,
					piece,
					startPosition,
					startSquare,
					startCoord,
					lastPosition,
					pieceGeometry,
					colorSide
				} satisfies PieceNotificationPayload;
			}),
			filter<PieceNotificationPayload>(
				(payload) =>
					payload?.piece instanceof MatrixPieceModel &&
					payload?.piecesIntersection?.object instanceof InstancedPieceModel
			),
			share()
		);

		this.pieceMoving$ = this.pieceSelected$?.pipe(
			switchMap((pieceSelectedPayload) =>
				this._chessboardController.update$$.pipe(
					map(() => {
						const payload = pieceSelectedPayload as NonNullable<
							typeof pieceSelectedPayload
						>;
						const intersections =
							this._coreComponent.getIntersections<InstancedCellModel>();
						const cellsIntersection = intersections.find(
							(inter) => inter.object instanceof InstancedCellModel
						);

						let lastPosition: Vector3Like | undefined;

						if (cellsIntersection?.point instanceof Vector3)
							lastPosition = cellsIntersection.point;

						return {
							...payload,
							cellsIntersection,
							lastPosition: lastPosition ?? payload.lastPosition
						} satisfies PieceNotificationPayload;
					}),
					takeUntil(this._mouseup$)
				)
			),
			share()
		);

		this.pieceDeselected$ = merge(
			this.pieceMoving$!.pipe(
				switchMap((payload) =>
					this._mouseup$.pipe(
						map(() => {
							const { cellsIntersection } = payload;
							const instancedCell = cellsIntersection?.object;
							const cell =
								typeof cellsIntersection?.instanceId === "number"
									? instancedCell?.getCellByIndex(cellsIntersection.instanceId)
									: undefined;

							const endCoord = cell?.coord;
							const endSquare = endCoord && coordToSquare(endCoord);

							return {
								...payload,
								cell,
								endCoord,
								endSquare
							} satisfies PieceNotificationPayload;
						}),
						take(1),
						share()
					)
				)
			),
			this.pieceDeselected$$.pipe()
		).pipe(share());
	}
}
