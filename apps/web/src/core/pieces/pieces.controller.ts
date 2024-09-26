import { inject, singleton } from "tsyringe";
import {
	filter,
	map,
	Observable,
	Subject,
	switchMap,
	take,
	takeUntil
} from "rxjs";
import { InstancedMesh, Intersection, Vector3 } from "three";
import { AppModule } from "@quick-threejs/reactive";
import { Physics } from "@chess-d/rapier-physics";

import {
	BoardCoord,
	CellModel,
	ColorVariant,
	InstancedCell,
	PieceId,
	PieceModel,
	PiecesGroupModel,
	PieceType,
	PieceUpdatePayload
} from "../../shared";
import { BoardComponent } from "../board/board.component";
import { PiecesComponent } from "./pieces.component";
import { CoreComponent } from "../core.component";

@singleton()
export class PiecesController {
	public readonly pieceSelected$?: Observable<
		PieceUpdatePayload<PiecesGroupModel<PieceType, ColorVariant>>
	>;
	public readonly pieceMoved$?: Observable<PieceUpdatePayload<InstancedMesh>>;
	public readonly pieceDeselected$?: Observable<
		PieceUpdatePayload<
			InstancedMesh,
			{ cell: CellModel; instancedCell: InstancedCell }
		>
	>;
	public readonly pieceDropped$$ = new Subject<PieceModel>();

	constructor(
		@inject(PiecesComponent) private readonly component: PiecesComponent,
		@inject(BoardComponent) private readonly boardComponent: BoardComponent,
		@inject(CoreComponent) private readonly coreComponent: CoreComponent,
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(Physics) private readonly physics: Physics
	) {
		this.pieceSelected$ = this.appModule.mousedown$?.().pipe(
			map(() => {
				const intersections = this.coreComponent.getIntersections();
				const intersection = intersections.find(
					(inter) => inter.object instanceof PiecesGroupModel
				) as Intersection<PiecesGroupModel> | undefined;
				const piecesGroup = intersection?.object;

				let piece: PieceModel | undefined;

				if (
					typeof intersection?.instanceId !== "number" ||
					!(piecesGroup instanceof PiecesGroupModel) ||
					!(piece = piecesGroup.getPieceByIndex(intersection.instanceId))
				)
					return void undefined as any;

				piece.userData.initialPosition = piece.position.clone();
				piece.userData.lastPosition = piece.userData.initialPosition;

				return { piecesGroup, piece, intersection };
			}),
			filter((payload) => !!payload?.piece)
		);

		this.pieceMoved$ = this.pieceSelected$?.pipe(
			switchMap((payload) =>
				this.appModule.timer.step$().pipe(
					map(() => {
						const { piece, pieceGroup } = payload as NonNullable<
							typeof payload
						>;
						const intersections =
							this.coreComponent.getIntersections<
								PiecesGroupModel<PieceType, ColorVariant>
							>();

						const intersection = intersections.find(
							(inter) =>
								inter.object.name === this.boardComponent.instancedCell.name
						);

						if (typeof intersection?.instanceId === "number")
							piece.userData.lastPosition = intersection.point;

						return {
							pieceGroup,
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
						const instancedCell = intersection?.object as InstancedCell;
						const cell = (
							typeof intersection?.instanceId === "number"
								? instancedCell.getCellByIndex(intersection.instanceId)
								: undefined
						) as CellModel;

						return { ...payload, instancedCell, cell };
					}),
					take(1)
				)
			)
		);
	}

	public setPiecePosition<Type extends PieceType, Color extends ColorVariant>(
		type: Type,
		color: Color,
		id: PieceId,
		position: Vector3
	) {
		this.component.groups?.[color]?.[type]?.setPiecePosition(id, position);
	}

	public setPieceCoord<Type extends PieceType, Color extends ColorVariant>(
		type: Type,
		color: Color,
		id: PieceId,
		coord: BoardCoord
	) {
		this.component.groups?.[color]?.[type]?.setPieceCoord(
			id,
			this.boardComponent.instancedCell,
			coord
		);
	}

	public dropPiece<Type extends PieceType, Color extends ColorVariant>(
		type: Type,
		color: Color,
		id: PieceId
	): PieceModel<Type, Color> | undefined {
		const groups = this.component.groups;
		const piecesGroup = groups?.[color][type] as unknown as
			| PiecesGroupModel<Type, Color>
			| undefined;
		const pieces = piecesGroup?.pieces;

		if (!pieces || !pieces[id]) return;

		const newGroup = piecesGroup.dropPiece(id, this.physics);
		if (!newGroup) return;

		this.component.setGroupType(type, color, newGroup);
		this.pieceDropped$$.next(
			pieces[id] as unknown as PieceModel<PieceType, ColorVariant>
		);

		return pieces[id];
	}
}
