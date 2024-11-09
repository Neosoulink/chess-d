import {
	ColorVariant,
	InstancedPieceModel,
	PieceType,
	squareToCoord
} from "@chess-d/chessboard";
import { CoreModule as ChessCoreModule } from "@chess-d/chessboard/dist/core/core.module";
import { Move } from "chess.js";
import { inject, singleton } from "tsyringe";

@singleton()
export class PlayersService {
	constructor(
		@inject(ChessCoreModule) private readonly chessboard: ChessCoreModule
	) {
		console.log("Initialized?");
		self.addEventListener(
			"message",
			(e: MessageEvent<{ type: string; payload: Move }>) => {
				const move = e.data.payload as Move;
				if ((e.data?.type as string) !== "piece_moved" || !move.to) return;

				this.movePiece(move);
			}
		);
	}

	movePiece(move: Move) {
		const piece = this.chessboard.piecesModule.component.getPieceByCoord(
			move.piece as PieceType,
			move.color as ColorVariant,
			squareToCoord(move.from)
		)!;

		const cell =
			this.chessboard.boardModule.component.instancedCell.getCellByCoord(
				squareToCoord(move.to)
			)!;

		this.chessboard.piecesModule.controller.pieceDeselected$$.next({
			instancedPiece: this.chessboard.piecesModule.component.groups[
				piece?.color
			]?.[piece?.type] as InstancedPieceModel,
			piece,
			cell,
			instancedCell: this.chessboard.boardModule.component.instancedCell
		});
	}
}
