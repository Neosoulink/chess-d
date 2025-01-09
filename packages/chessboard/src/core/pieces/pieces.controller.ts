import { inject, singleton } from "tsyringe";
import {
	filter,
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
import { AppModule } from "@quick-threejs/reactive";
import { copyProperties } from "@quick-threejs/utils";
import { BoardCoord, coordToSquare, ObservablePayload } from "@chess-d/shared";

import {
	InstancedCellModel,
	MatrixPieceModel,
	InstancedPieceModel,
	PieceNotificationPayload
} from "../../shared";
import { CoreComponent } from "../core.component";
import { ResourceComponent } from "../resource/resource.component";

@singleton()
export class PiecesController {
	public readonly pieceDeselected$$ = new Subject<PieceNotificationPayload>();

	public readonly pieceSelected$?: Observable<PieceNotificationPayload>;
	public readonly pieceMoving$?: Observable<PieceNotificationPayload>;
	public readonly pieceDeselected$?: Observable<PieceNotificationPayload>;

	constructor(
		@inject(CoreComponent) private readonly _coreComponent: CoreComponent,
		@inject(ResourceComponent)
		private readonly _resourceComponent: ResourceComponent,
		@inject(AppModule) private readonly _appModule: AppModule
	) {
		this.pieceSelected$ = this._appModule.mousedown$?.().pipe(
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
				const pieceGeometry = this._resourceComponent.getGeometryByType(
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
				this._appModule.timer.step$().pipe(
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
					takeUntil(this._appModule.mouseup$?.() as Observable<Event>)
				)
			),
			share()
		);

		this.pieceDeselected$ = merge(
			this.pieceMoving$!.pipe(
				switchMap((payload) =>
					(this._appModule.mouseup$?.() as Observable<Event>).pipe(
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
						take(1)
					)
				)
			),
			this.pieceDeselected$$.pipe()
		).pipe(share());
	}
}
