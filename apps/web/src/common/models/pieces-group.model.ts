import { BufferGeometry, DynamicDrawUsage, InstancedMesh } from "three";
import { Subject, Subscription } from "rxjs";
import { Physics } from "@chess-d/rapier-physics";

import { ColorVariant, PieceType } from "../enums";
import { PieceModel } from "./piece.model";
import { COLOR_BLACK, COLOR_WHITE } from "../constants";
import { BoardCoords, PieceId } from "../interfaces";
import { PhysicsProperties } from "@chess-d/rapier-physics/dist/types";

export class PiecesGroupModel<
	type extends PieceType,
	color extends ColorVariant
> extends InstancedMesh {
	public readonly pieces: Record<PieceId, PieceModel<type, color>> = {};
	public readonly pieceUpdateSubscriptions: Record<PieceId, Subscription> = {};
	public readonly update$$ = new Subject<PiecesGroupModel<type, color>>();
	public readonly pieceMoved$$ = new Subject<PieceModel<type, color>>();

	constructor(
		public readonly piecesType: type,
		public readonly piecesColor: color,
		count: PieceId,
		geometry: BufferGeometry,
		pieces?: Record<PieceId, PieceModel<type, color>>
	) {
		super(geometry, undefined, count);

		this.instanceMatrix.setUsage(DynamicDrawUsage);

		(pieces ? Object.keys(pieces) : Array.from(Array(this.count))).forEach(
			(pieceKey: number, i) => {
				const oldPiece = pieces?.[pieceKey];

				const piece =
					oldPiece ?? new PieceModel(i, this.piecesType, this.piecesColor);
				piece.index = i;

				this.setMatrixAt(i, piece);
				this.setColorAt(
					i,
					piece.color === ColorVariant.black ? COLOR_BLACK : COLOR_WHITE
				);

				this.pieceUpdateSubscriptions[i] = piece.update$$.subscribe(
					this._onPieceMoved.bind(this)
				);

				this.pieces[piece.id] = piece;
			}
		);

		this.update();
	}

	private _onPieceMoved(piece: PieceModel<type, color>) {
		const _safePice = this.pieces[piece.id];

		if (!_safePice) return;

		this.setMatrixAt(_safePice.index, piece);
		this.pieceMoved$$.next(piece);
		this.update();
	}

	public initPhysics(physics: Physics) {
		const physicsProperties = physics.addToWorld(
			this,
			1
		) as PhysicsProperties[];

		physicsProperties.forEach((_, i) => {
			const piecePhysicsProperties = physicsProperties[i] as PhysicsProperties;
			if (this.pieces[i]) this.pieces[i].physics = piecePhysicsProperties;
		});
	}

	public setPieceCoords(
		id: PieceId,
		board: InstancedMesh,
		coords: BoardCoords
	) {
		if (this?.geometry.attributes.position) {
			this.geometry.computeBoundingBox();
			const boundingBox = this.geometry.boundingBox;

			if (boundingBox) {
				// const width = boundingBox.max.x - boundingBox.min.x;
				const height = boundingBox.max.y - boundingBox.min.y;

				this.pieces[id]?.setCoords(board, coords, {
					x: 0,
					y: height / 2 + 2,
					z: 0
				});
			}
		}

		return this.pieces[id];
	}

	public update() {
		this.matrixWorldNeedsUpdate = true;
		this.instanceMatrix.needsUpdate = true;
		this.computeBoundingBox();
		this.update$$.next(this);
	}
}
