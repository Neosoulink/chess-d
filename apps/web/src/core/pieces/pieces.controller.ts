import { inject, singleton } from "tsyringe";
import { Subject } from "rxjs";

import {
	BoardCoords,
	ColorVariant,
	PieceId,
	PieceModel,
	PieceType
} from "../../common";
import { ChessBoardComponent } from "../chess-board/chess-board.component";
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
		@inject(ChessBoardComponent)
		private readonly chessBoardComponent: ChessBoardComponent,
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
			this.chessBoardComponent.board,
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
	) {
		const groups = this.component.groups;
		const piecesGroup = groups?.[color][type];
		const pieces = piecesGroup?.pieces as unknown as
			| undefined
			| Record<number, PieceModel<Type, Color>>;

		if (!pieces || !piecesGroup || !pieces?.[id]) return;

		const pieceToDrop = piecesGroup.dropPiece(id, this.physics);

		this.pieceDropped$$.next(
			pieceToDrop as unknown as PieceModel<PieceType, ColorVariant>
		);

		return pieceToDrop;
	}
}
