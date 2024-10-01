import { inject, singleton } from "tsyringe";
import { filter, map, Observable, switchMap, take, takeUntil } from "rxjs";
import { InstancedMesh, Intersection } from "three";
import { AppModule } from "@quick-threejs/reactive";

import {
	MatrixCellModel,
	ColorVariant,
	InstancedCellModel,
	MatrixPieceModel,
	InstancedPieceModel,
	PieceType,
	PieceNotificationPayload
} from "../../shared";
import { BoardComponent } from "../board/board.component";
import { PiecesComponent } from "./pieces.component";
import { CoreComponent } from "../core.component";

@singleton()
export class PiecesController {
	public readonly pieceSelected$?: Observable<
		PieceNotificationPayload<InstancedPieceModel<PieceType, ColorVariant>>
	>;
	public readonly pieceMoved$?: Observable<
		PieceNotificationPayload<InstancedMesh>
	>;
	public readonly pieceDeselected$?: Observable<
		PieceNotificationPayload<
			InstancedMesh,
			{ cell: MatrixCellModel; instancedCell: InstancedCellModel }
		>
	>;

	constructor(
		@inject(PiecesComponent) private readonly component: PiecesComponent,
		@inject(CoreComponent) private readonly coreComponent: CoreComponent,
		@inject(BoardComponent) private readonly boardComponent: BoardComponent,
		@inject(AppModule) private readonly appModule: AppModule
	) {
		this.pieceSelected$ = this.appModule.mousedown$?.().pipe(
			map(() => {
				const intersections = this.coreComponent.getIntersections();
				const intersection = intersections.find(
					(inter) => inter.object instanceof InstancedPieceModel
				) as Intersection<InstancedPieceModel> | undefined;
				const instancedPiece = intersection?.object;

				let piece: MatrixPieceModel | undefined;

				if (
					typeof intersection?.instanceId !== "number" ||
					!(instancedPiece instanceof InstancedPieceModel) ||
					!(piece = instancedPiece.getPieceByIndex(intersection.instanceId))
				)
					return undefined as any;

				piece.userData.initialPosition = piece.position.clone();
				piece.userData.lastPosition = piece.userData.initialPosition;

				return { instancedPiece, piece, intersection };
			}),
			filter((payload) => !!payload?.piece && !!payload?.instancedPiece)
		);

		this.pieceMoved$ = this.pieceSelected$?.pipe(
			switchMap((pieceSelectedPayload) =>
				this.appModule.timer.step$().pipe(
					map(() => {
						const { piece, instancedPiece } =
							pieceSelectedPayload as NonNullable<typeof pieceSelectedPayload>;
						const intersections =
							this.coreComponent.getIntersections<
								InstancedPieceModel<PieceType, ColorVariant>
							>();

						const intersection = intersections.find(
							(inter) =>
								inter.object.name === this.boardComponent.instancedCell.name
						);

						if (typeof intersection?.instanceId === "number")
							piece.userData.lastPosition = intersection.point;

						return {
							instancedPiece,
							piece,
							intersection
						};
					}),
					takeUntil(this.appModule.mouseup$?.() as Observable<Event>)
				)
			)
		);

		this.pieceDeselected$ = this.pieceMoved$?.pipe(
			switchMap((payload) =>
				(this.appModule.mouseup$?.() as Observable<Event>).pipe(
					map(() => {
						const { intersection } = payload;
						const instancedCell = intersection?.object as InstancedCellModel;
						const cell = (
							typeof intersection?.instanceId === "number"
								? instancedCell.getCellByIndex(intersection.instanceId)
								: undefined
						) as MatrixCellModel;

						return { ...payload, instancedCell, cell };
					}),
					take(1)
				)
			)
		);
	}
}
