import {
	BoxGeometry,
	DynamicDrawUsage,
	InstancedMesh,
	MeshToonMaterial
} from "three";
import { inject, singleton } from "tsyringe";

import { ChessBoardComponent } from "../chess-board/chess-board.component";
import { PieceModel } from "../../common";

@singleton()
export class PiecesComponent {
	private _pawns!: InstancedMesh & { userData: PieceModel[] };
	private _defaultMaterial = new MeshToonMaterial({ color: 0xff0000 });

	constructor(
		@inject(ChessBoardComponent)
		private readonly chessBoardComponent: ChessBoardComponent
	) {}

	public setPawns(count: number) {
		this._pawns?.removeFromParent();
		this._pawns?.dispose();

		// @ts-ignore
		this._pawns = new InstancedMesh(
			new BoxGeometry(0.5, 0.5, 0.5),
			this._defaultMaterial,
			count
		);
		this._pawns.position.copy(this.chessBoardComponent.board.position);
		this._pawns.userData = Array.from(Array(count)).map((_, index) => {
			const piece = new PieceModel(
				this.chessBoardComponent.board,
				this._pawns,
				index,
				{
					col: 0,
					row: 0
				}
			);

			piece.setPositionOnBoard({ col: 0, row: 0 });

			return piece;
		});

		this._pawns.instanceMatrix.setUsage(DynamicDrawUsage);
	}

	public get pawns() {
		return this._pawns;
	}
}
