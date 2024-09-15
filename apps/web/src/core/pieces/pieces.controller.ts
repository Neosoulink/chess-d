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
import { AppModule } from "@quick-threejs/reactive";
import { Physics } from "@chess-d/rapier-physics";

import {
	BoardCoords,
	ColorVariant,
	PieceId,
	PieceModel,
	PiecesGroupModel,
	PieceType,
	PieceUpdatePayload
} from "../../shared";
import { BoardComponent } from "../board/board.component";
import { PiecesComponent } from "./pieces.component";
import { CoreComponent } from "../core.component";
import { Intersection, Vector3 } from "three";

@singleton()
export class PiecesController {
	public readonly pieceSelected$?: Observable<PieceUpdatePayload>;
	public readonly pieceMoved$?: PiecesController["pieceSelected$"];
	public readonly pieceDeselected$?: PiecesController["pieceMoved$"];
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

				return { piece, intersection };
			}),
			filter((payload) => !!payload?.piece)
		);

		this.pieceMoved$ = this.pieceSelected$?.pipe(
			switchMap((payload) =>
				this.appModule.timer.step$().pipe(
					map(() => {
						const { piece } = payload as NonNullable<typeof payload>;
						const intersections =
							this.coreComponent.getIntersections<
								PiecesGroupModel<PieceType, ColorVariant>
							>();

						const intersection = intersections.find(
							(inter) => inter.object.name === this.boardComponent.mesh.name
						);

						if (typeof intersection?.instanceId === "number") {
							piece.userData.lastPosition = intersection.point;
						}

						return {
							piece,
							intersection
						};
					}),
					takeUntil(this.appModule.mouseup$?.() as Observable<Event>)
				)
			)
		);

		this.pieceDeselected$ = this.pieceMoved$?.pipe(
			switchMap((latestPayload) =>
				(this.appModule.mouseup$?.() as Observable<Event>).pipe(
					map(() => latestPayload),
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

	public setPieceCoords<Type extends PieceType, Color extends ColorVariant>(
		type: Type,
		color: Color,
		id: PieceId,
		coords: BoardCoords
	) {
		this.component.groups?.[color]?.[type]?.setPieceCoords(
			id,
			this.boardComponent.mesh,
			coords
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
