import type { Move, PieceSymbol, Color, Square } from "chess.js";
import type { GameUpdatedPayload, PlayerEntity } from "@chess-d/shared";
import { filter, Subject } from "rxjs";

export class PlayerModel implements PlayerEntity {
	public readonly piecePicked$$ = new Subject<
		Exclude<PlayerModel["pickedPiece"], undefined>
	>();
	public readonly pieceMoved$$ = new Subject<Move>();
	public readonly notify$$ = new Subject<GameUpdatedPayload | undefined>();
	public readonly notifyForPlayer$ = this.notify$$.pipe(
		filter((payload) => payload?.turn === this.color)
	);

	public id: string;
	public isHost: boolean;
	public connectedAt: Date;
	public color: Color;
	public pickedPiece?: { type: PieceSymbol; square: Square };

	constructor(entityProps: Partial<PlayerEntity> = {}) {
		this.id = entityProps.id ?? "";
		this.color = entityProps.color ?? "b";
		this.isHost = entityProps.isHost ?? false;
		this.connectedAt = entityProps.connectedAt ?? new Date();

		this.piecePicked$$.subscribe((payload) => (this.pickedPiece = payload));
		this.pieceMoved$$.subscribe(() => (this.pickedPiece = undefined));
	}

	public pickPiece(type: PieceSymbol, square: Square) {
		this.piecePicked$$.next({ type, square });
	}

	public movePiece(move: Move) {
		this.pieceMoved$$.next(move);
	}

	public dispose() {
		this.notify$$.complete();
		this.piecePicked$$.complete();
		this.pieceMoved$$.complete();
	}
}
