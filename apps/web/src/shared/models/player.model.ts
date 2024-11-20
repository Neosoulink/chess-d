import { PieceSymbol, type Color, type Square } from "chess.js";
import type { PlayerEntity } from "@chess-d/api";
import { filter, Subject } from "rxjs";
import { MoveLike } from "../types";

export class PlayerModel implements PlayerEntity {
	public readonly notify$$ = new Subject<
		| {
				entity?: PlayerEntity;
				turn?: Color;
				fen?: string;
		  }
		| undefined
	>();
	public readonly piecePicked$$ = new Subject<
		Exclude<PlayerModel["pickedPiece"], undefined>
	>();
	public readonly pieceMoved$$ = new Subject<MoveLike>();
	public readonly notifyForPlayer$ = this.notify$$.pipe(
		filter(
			(payload) =>
				payload?.entity?.id === this.id || payload?.turn === this.color
		)
	);

	public id: string;
	public isOpponent: boolean;
	public connectedAt: Date;
	public color: Color;

	public pickedPiece?: { type: PieceSymbol; square: Square };

	constructor(entityProps: Partial<PlayerEntity> = {}) {
		this.id = entityProps.id ?? "";
		this.color = entityProps.color ?? "b";
		this.isOpponent = entityProps.isOpponent ?? false;
		this.connectedAt = entityProps.connectedAt ?? new Date();

		this.piecePicked$$.subscribe((payload) => (this.pickedPiece = payload));
		this.pieceMoved$$.subscribe(() => (this.pickedPiece = undefined));
	}

	public pickPiece(type: PieceSymbol, square: Square) {
		this.piecePicked$$.next({ type, square });
	}

	public movePiece(move: MoveLike) {
		this.pieceMoved$$.next(move);
	}

	public dispose() {
		this.notify$$.complete();
		this.piecePicked$$.complete();
		this.pieceMoved$$.complete();
	}
}
