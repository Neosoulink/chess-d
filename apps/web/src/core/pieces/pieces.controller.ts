import { inject, singleton } from "tsyringe";
import { Subject } from "rxjs";

import {
	BoardCoords,
	ColorVariant,
	PieceId,
	PieceModel,
	PiecesGroupModel,
	PieceType
} from "../../shared";
import { BoardComponent } from "../board/board.component";
import { PiecesComponent } from "./pieces.component";
import { Physics } from "@chess-d/rapier-physics";

@singleton()
export class PiecesController {
	public readonly pieceMoved$$ = new Subject<
		PieceModel<PieceType, ColorVariant>
	>();
	public readonly pieceDropped$$ = new Subject<
		PieceModel<PieceType, ColorVariant>
	>();

	constructor(
		@inject(PiecesComponent) private readonly component: PiecesComponent,
		@inject(BoardComponent)
		private readonly BoardComponent: BoardComponent,
		@inject(Physics)
		private readonly physics: Physics
	) {}

	public movePiece<Type extends PieceType, Color extends ColorVariant>(
		type: Type,
		color: Color,
		id: PieceId,
		coords: BoardCoords
	) {
		const piece = this.component.groups?.[color]?.[type]?.setPieceCoords(
			id,
			this.BoardComponent.mesh,
			coords
		);

		this.pieceMoved$$.next(
			piece as unknown as PieceModel<PieceType, ColorVariant>
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
