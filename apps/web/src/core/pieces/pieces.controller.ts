import { inject, singleton } from "tsyringe";
import { Subject } from "rxjs";

import {
	BoardCoords,
	ColorVariant,
	PieceId,
	PieceModel,
	PiecesGroupModel,
	PieceType
} from "../../common";
import { ChessBoardComponent } from "../chess-board/chess-board.component";
import { PiecesComponent } from "./pieces.component";

@singleton()
export class PiecesController {
	public readonly pieceMoved$$ = new Subject<PieceModel>();
	public readonly pieceDropped$$ = new Subject<PieceModel>();

	constructor(
		@inject(PiecesComponent) private readonly component: PiecesComponent,
		@inject(ChessBoardComponent)
		private readonly chessBoardComponent: ChessBoardComponent
	) {}

	public movePiece(
		color: ColorVariant,
		type: `${keyof typeof PieceType}s`,
		id: PieceId,
		coords: BoardCoords
	) {
		const piece = this.component.groups?.[color]?.[type]?.setPieceCoords(
			id,
			this.chessBoardComponent.board,
			coords
		);

		// @ts-ignore
		this.pieceMoved$$.next(piece);
	}

	public dropPiece(
		color: ColorVariant,
		type: `${keyof typeof PieceType}s`,
		id: PieceId
	) {
		const groups = this.component.groups;
		const piecesGroup = groups?.[color]?.[type];
		const pieces = piecesGroup?.pieces;
		const pieceToDrop = pieces?.[id];

		if (!pieces || !piecesGroup || !pieceToDrop) return;

		delete pieces[id];

		const piecesGroupParent = piecesGroup.parent;
		const newPiecesGroup = new PiecesGroupModel(
			piecesGroup.piecesType,
			piecesGroup.piecesColor,
			Object.keys(pieces).length,
			piecesGroup.geometry,
			// @ts-ignore - ...
			pieces
		);

		// @ts-ignore - Not assignable to type `never`
		groups[color][type] = newPiecesGroup;

		newPiecesGroup.position.copy(piecesGroup.position);
		newPiecesGroup.rotation.copy(piecesGroup.rotation);
		newPiecesGroup.scale.copy(piecesGroup.scale);

		piecesGroupParent?.add(newPiecesGroup);

		piecesGroup.removeFromParent();
		piecesGroup.dispose();

		// @ts-ignore
		this.pieceDropped$$.next(pieceToDrop);

		return pieceToDrop;
	}
}
