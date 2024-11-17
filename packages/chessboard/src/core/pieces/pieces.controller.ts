import { inject, singleton } from "tsyringe";
import {
	filter,
	map,
	merge,
	Observable,
	Subject,
	switchMap,
	take,
	takeUntil
} from "rxjs";
import { Intersection, Vector3, Vector3Like } from "three";
import { AppModule } from "@quick-threejs/reactive";
import { copyProperties } from "@quick-threejs/utils";

import {
	InstancedCellModel,
	MatrixPieceModel,
	InstancedPieceModel,
	PieceNotificationPayload,
	coordToSquare,
	ObservablePayload,
	BoardCoord
} from "../../shared";
import { PiecesComponent } from "./pieces.component";
import { CoreComponent } from "../core.component";

@singleton()
export class PiecesController {
	public readonly pieceDeselected$$ = new Subject<PieceNotificationPayload>();
	public readonly pieceMoved$$ = new Subject<
		ObservablePayload<PiecesController["pieceDeselected$$"]>
	>();

	public readonly pieceSelected$?: Observable<PieceNotificationPayload>;
	public readonly pieceMoving$?: Observable<PieceNotificationPayload>;
	public readonly pieceDeselected$?: Observable<
		ObservablePayload<PiecesController["pieceDeselected$$"]>
	>;

	constructor(
		@inject(PiecesComponent) private readonly component: PiecesComponent,
		@inject(CoreComponent) private readonly coreComponent: CoreComponent,
		@inject(AppModule) private readonly appModule: AppModule
	) {
		this.pieceSelected$ = this.appModule.mousedown$?.().pipe(
			map(() => {
				const intersections = this.coreComponent.getIntersections();
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

				return {
					piecesIntersection,
					piece,
					startPosition,
					startSquare,
					startCoord,
					lastPosition
				} satisfies PieceNotificationPayload;
			}),
			filter<PieceNotificationPayload>(
				(payload) =>
					payload?.piece instanceof MatrixPieceModel &&
					payload?.piecesIntersection?.object instanceof InstancedPieceModel
			)
		);

		this.pieceMoving$ = this.pieceSelected$?.pipe(
			switchMap((pieceSelectedPayload) =>
				this.appModule.timer.step$().pipe(
					map(() => {
						const payload = pieceSelectedPayload as NonNullable<
							typeof pieceSelectedPayload
						>;
						const intersections =
							this.coreComponent.getIntersections<InstancedCellModel>();
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
					takeUntil(this.appModule.mouseup$?.() as Observable<Event>)
				)
			)
		);

		this.pieceDeselected$ = merge(
			this.pieceMoving$!.pipe(
				switchMap((payload) =>
					(this.appModule.mouseup$?.() as Observable<Event>).pipe(
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
		);
	}
}
