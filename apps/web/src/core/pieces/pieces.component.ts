import { inject, singleton } from "tsyringe";
import { BoxGeometry, Color, DynamicDrawUsage } from "three";

import { ChessBoardComponent } from "../chess-board/chess-board.component";
import { PiecesGroupModel, PieceModel } from "../../common";

@singleton()
export class PiecesComponent {
	private _pawns: { b?: PiecesGroupModel; w?: PiecesGroupModel } = {};
	private _rocks: { b?: PiecesGroupModel; w?: PiecesGroupModel } = {};
	private _bishops: { b?: PiecesGroupModel; w?: PiecesGroupModel } = {};
	private _knights: { b?: PiecesGroupModel; w?: PiecesGroupModel } = {};
	private _queens: { b?: PiecesGroupModel; w?: PiecesGroupModel } = {};
	private _kings: { b?: PiecesGroupModel; w?: PiecesGroupModel } = {};

	public readonly blackAccent = new Color(0x222222);
	public readonly whiteAccent = new Color(0xbbbbbb);

	constructor(
		@inject(ChessBoardComponent)
		private readonly chessBoardComponent: ChessBoardComponent
	) {}

	public initPawns(isBlack?: boolean) {
		const oldPiecesGroup = this._pawns?.[isBlack ? "b" : "w"];
		const newPiecesGroup = new PiecesGroupModel(
			new BoxGeometry(0.2, 0.2, 1),
			undefined,
			this.chessBoardComponent.size
		);

		oldPiecesGroup?.removeFromParent();
		oldPiecesGroup?.dispose();

		newPiecesGroup.instanceMatrix.setUsage(DynamicDrawUsage);
		newPiecesGroup.position.copy(this.chessBoardComponent.board.position);

		newPiecesGroup.pieces = Array.from(Array(newPiecesGroup.count)).map(
			(_, i) => {
				const piece = new PieceModel(
					this.chessBoardComponent.board,
					newPiecesGroup,
					i,
					"pawn",
					isBlack,
					{
						col: isBlack ? i : this.chessBoardComponent.size - 1 - i,
						row: isBlack ? 1 : this.chessBoardComponent.size - 2
					}
				);

				newPiecesGroup.setColorAt(
					i,
					isBlack ? this.blackAccent : this.whiteAccent
				);

				return piece;
			}
		);

		if (isBlack) this._pawns.b = newPiecesGroup;
		else this._pawns.w = newPiecesGroup;

		this._pawns[isBlack ? "b" : "w"] = newPiecesGroup;
	}

	public initRocks(isBlack?: boolean) {
		const oldPiecesGroup = this._rocks?.[isBlack ? "b" : "w"];
		const newPiecesGroup = new PiecesGroupModel(
			new BoxGeometry(0.5, 0.5, 1),
			undefined,
			2
		);

		oldPiecesGroup?.removeFromParent();
		oldPiecesGroup?.dispose();

		newPiecesGroup.instanceMatrix.setUsage(DynamicDrawUsage);
		newPiecesGroup.position.copy(this.chessBoardComponent.board.position);

		newPiecesGroup.pieces = Array.from(Array(newPiecesGroup.count)).map(
			(_, i) => {
				const piece = new PieceModel(
					this.chessBoardComponent.board,
					newPiecesGroup,
					i,
					"tower",
					isBlack,
					{
						col: isBlack
							? i === 0
								? 0
								: this.chessBoardComponent.size - 1
							: i === 0
								? this.chessBoardComponent.size - 1
								: 0,
						row: isBlack ? 0 : this.chessBoardComponent.size - 1
					}
				);

				newPiecesGroup.setColorAt(
					i,
					isBlack
						? this.blackAccent
								.clone()
								.setHex(this.blackAccent.getHex() * 0.0305)
						: this.whiteAccent.clone().setHex(this.whiteAccent.getHex() * 1.01)
				);

				return piece;
			}
		);

		if (isBlack) this._rocks.b = newPiecesGroup;
		else this._rocks.w = newPiecesGroup;

		this._rocks[isBlack ? "b" : "w"] = newPiecesGroup;
	}

	public initBishops(isBlack?: boolean) {
		const oldPiecesGroup = this._bishops?.[isBlack ? "b" : "w"];
		const newPiecesGroup = new PiecesGroupModel(
			new BoxGeometry(0.3, 0.3, 1),
			undefined,
			2
		);

		oldPiecesGroup?.removeFromParent();
		oldPiecesGroup?.dispose();

		newPiecesGroup.instanceMatrix.setUsage(DynamicDrawUsage);
		newPiecesGroup.position.copy(this.chessBoardComponent.board.position);

		newPiecesGroup.pieces = Array.from(Array(newPiecesGroup.count)).map(
			(_, i) => {
				const piece = new PieceModel(
					this.chessBoardComponent.board,
					newPiecesGroup,
					i,
					"bishop",
					isBlack,
					{
						col: isBlack
							? i === 0
								? 1
								: this.chessBoardComponent.size - 2
							: i === 0
								? this.chessBoardComponent.size - 2
								: 1,
						row: isBlack ? 0 : this.chessBoardComponent.size - 1
					}
				);

				newPiecesGroup.setColorAt(
					i,
					isBlack
						? this.blackAccent
								.clone()
								.setHex(this.blackAccent.getHex() * 0.0331)
						: this.whiteAccent
								.clone()
								.setHex(this.whiteAccent.getHex() * 1.01012)
				);

				return piece;
			}
		);

		if (isBlack) this._bishops.b = newPiecesGroup;
		else this._bishops.w = newPiecesGroup;

		this._bishops[isBlack ? "b" : "w"] = newPiecesGroup;
	}

	public initKnights(isBlack?: boolean) {
		const oldPiecesGroup = this._knights?.[isBlack ? "b" : "w"];
		const newPiecesGroup = new PiecesGroupModel(
			new BoxGeometry(0.35, 0.35, 1),
			undefined,
			2
		);

		oldPiecesGroup?.removeFromParent();
		oldPiecesGroup?.dispose();

		newPiecesGroup.instanceMatrix.setUsage(DynamicDrawUsage);
		newPiecesGroup.position.copy(this.chessBoardComponent.board.position);

		newPiecesGroup.pieces = Array.from(Array(newPiecesGroup.count)).map(
			(_, i) => {
				const piece = new PieceModel(
					this.chessBoardComponent.board,
					newPiecesGroup,
					i,
					"knight",
					isBlack,
					{
						col: isBlack
							? i === 0
								? 2
								: this.chessBoardComponent.size - 3
							: i === 0
								? this.chessBoardComponent.size - 3
								: 2,
						row: isBlack ? 0 : this.chessBoardComponent.size - 1
					}
				);

				newPiecesGroup.setColorAt(
					i,
					isBlack
						? this.blackAccent.clone().setHex(this.blackAccent.getHex() * 0.03)
						: this.whiteAccent
								.clone()
								.setHex(this.whiteAccent.getHex() * 1.01012)
				);

				return piece;
			}
		);

		if (isBlack) this._knights.b = newPiecesGroup;
		else this._knights.w = newPiecesGroup;

		this._knights[isBlack ? "b" : "w"] = newPiecesGroup;
	}

	public initQueens(isBlack?: boolean) {
		const oldPiecesGroup = this._queens?.[isBlack ? "b" : "w"];
		const newPiecesGroup = new PiecesGroupModel(
			new BoxGeometry(0.25, 0.25, 1.2),
			undefined,
			1
		);

		oldPiecesGroup?.removeFromParent();
		oldPiecesGroup?.dispose();

		newPiecesGroup.instanceMatrix.setUsage(DynamicDrawUsage);
		newPiecesGroup.position.copy(this.chessBoardComponent.board.position);

		newPiecesGroup.pieces = Array.from(Array(newPiecesGroup.count)).map(
			(_, i) => {
				const piece = new PieceModel(
					this.chessBoardComponent.board,
					newPiecesGroup,
					i,
					"queen",
					isBlack,
					{
						col: isBlack ? 3 : this.chessBoardComponent.size - 4,
						row: isBlack ? 0 : this.chessBoardComponent.size - 1
					}
				);

				newPiecesGroup.setColorAt(
					i,
					isBlack
						? this.blackAccent.clone().setHex(this.blackAccent.getHex() * 0.1)
						: this.whiteAccent.clone().setHex(this.whiteAccent.getHex() * 0.9)
				);

				return piece;
			}
		);

		if (isBlack) this._queens.b = newPiecesGroup;
		else this._queens.w = newPiecesGroup;

		this._queens[isBlack ? "b" : "w"] = newPiecesGroup;
	}

	public initKings(isBlack?: boolean) {
		const oldPiecesGroup = this._kings?.[isBlack ? "b" : "w"];
		const newPiecesGroup = new PiecesGroupModel(
			new BoxGeometry(0.2, 0.2, 1.5),
			undefined,
			1
		);

		oldPiecesGroup?.removeFromParent();
		oldPiecesGroup?.dispose();

		newPiecesGroup.instanceMatrix.setUsage(DynamicDrawUsage);
		newPiecesGroup.position.copy(this.chessBoardComponent.board.position);

		newPiecesGroup.pieces = Array.from(Array(newPiecesGroup.count)).map(
			(_, i) => {
				const piece = new PieceModel(
					this.chessBoardComponent.board,
					newPiecesGroup,
					i,
					"queen",
					isBlack,
					{
						col: isBlack ? 4 : this.chessBoardComponent.size - 5,
						row: isBlack ? 0 : this.chessBoardComponent.size - 1
					}
				);

				newPiecesGroup.setColorAt(
					i,
					isBlack
						? this.blackAccent.clone().setHex(this.blackAccent.getHex() * 0.11)
						: this.whiteAccent.clone().setHex(this.whiteAccent.getHex() * 0.99)
				);

				return piece;
			}
		);

		if (isBlack) this._kings.b = newPiecesGroup;
		else this._kings.w = newPiecesGroup;

		this._kings[isBlack ? "b" : "w"] = newPiecesGroup;
	}

	public get pawns() {
		return this._pawns;
	}

	public get rocks() {
		return this._rocks;
	}

	public get bishops() {
		return this._bishops;
	}

	public get knights() {
		return this._knights;
	}

	public get queens() {
		return this._queens;
	}

	public get kings() {
		return this._kings;
	}
}
