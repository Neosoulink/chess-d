import { inject, singleton } from "tsyringe";
import { Subject } from "rxjs";

import {
	BoardCoords,
	ColorVariant,
	PieceId,
	PieceModel,
	PiecesGroups,
	PieceType
} from "../../common";
import { ChessBoardComponent } from "../chess-board/chess-board.component";
import { PiecesComponent } from "./pieces.component";

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
		private readonly chessBoardComponent: ChessBoardComponent
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
		const pieceToDrop = pieces?.[id];

		if (!pieces || !piecesGroup || !pieceToDrop) return;

		delete pieces[id];

		const piecesGroupParent = piecesGroup.parent;
		const newPiecesGroup = this.component.createGroup(
			type,
			color,
			Object.keys(pieces).length,
			piecesGroup.geometry,
			pieces
		);

		groups[color][type] =
			newPiecesGroup as unknown as PiecesGroups[Color][Type];

		newPiecesGroup.position.copy(piecesGroup.position);
		newPiecesGroup.rotation.copy(piecesGroup.rotation);
		newPiecesGroup.scale.copy(piecesGroup.scale);

		piecesGroupParent?.add(newPiecesGroup);

		piecesGroup.removeFromParent();
		piecesGroup.dispose();

		this.pieceDropped$$.next(
			pieceToDrop as unknown as PieceModel<PieceType, ColorVariant>
		);

		return pieceToDrop;
	}
}
