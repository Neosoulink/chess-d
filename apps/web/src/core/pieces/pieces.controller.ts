import { inject, singleton } from "tsyringe";
import { Subject } from "rxjs";

import { BoardCoords, ColorVariant, PieceType } from "../../common";
import { ChessBoardComponent } from "../chess-board/chess-board.component";
import { PiecesComponent } from "./pieces.component";

@singleton()
export class PiecesController {
	private readonly pieceMoved$$ = new Subject<BoardCoords>();

	constructor(
		@inject(PiecesComponent) private readonly component: PiecesComponent,
		@inject(ChessBoardComponent)
		private readonly chessBoardComponent: ChessBoardComponent
	) {}

	movePiece(
		color: ColorVariant,
		type: `${keyof typeof PieceType}s`,
		index: number,
		coords: BoardCoords
	) {
		this.component.groups?.[color]?.[type]?.pieces[index]?.setCoords(
			this.chessBoardComponent.board,
			coords
		);
		this.pieceMoved$$.next(coords);
	}
}
