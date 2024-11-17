import { PieceSymbol, type Color, type Square } from "chess.js";
import type { PlayerEntity } from "@chess-d/api";
import { Subject } from "rxjs";
import { MoveLike } from "../types";

export class PlayerModel implements PlayerEntity {
	public readonly piecePicked$$ = new Subject<
		Exclude<PlayerModel["pickedPiece"], undefined>
	>();
	public readonly pieceMoved$$ = new Subject<MoveLike>();

	public id: string;
	public isOpponent: boolean;
	public connectedAt: Date;
	public color: Color;
	public pickedPiece: { type: PieceSymbol; square: Square } = {
		type: "p",
		square: "f7"
	};

	constructor(entityProps: Partial<PlayerEntity> = {}) {
		this.id = entityProps.id ?? "";
		this.color = entityProps.color ?? "b";
		this.isOpponent = entityProps.isOpponent ?? false;
		this.connectedAt = entityProps.connectedAt ?? new Date();
	}

	public pickPiece(type: PieceSymbol, square: Square) {
		this.pickedPiece = { type, square };
		this.piecePicked$$.next(this.pickedPiece);
	}

	public movePiece(move: MoveLike) {
		this.pieceMoved$$.next(move);
	}
}
