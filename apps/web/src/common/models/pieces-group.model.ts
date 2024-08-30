import { BufferGeometry, DynamicDrawUsage, InstancedMesh } from "three";
import { Subject, Subscription } from "rxjs";
import { Physics } from "@chess-d/rapier-physics";
import { PhysicsProperties } from "@chess-d/rapier-physics/dist/types";

import { ColorVariant, PieceType } from "../enums";
import { PieceModel } from "./piece.model";
import { COLOR_BLACK, COLOR_WHITE } from "../constants";
import { BoardCoords, PieceId } from "../interfaces";

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
		const piecesMatrix = pieces
			? Object.keys(pieces)
			: Array.from(Array(count));

		super(geometry, undefined, piecesMatrix.length);
		this.instanceMatrix.setUsage(DynamicDrawUsage);

		piecesMatrix.forEach((pieceKey: number, i) => {
			const oldPiece = pieces?.[pieceKey];
			const piece =
				oldPiece ?? new PieceModel(i, this.piecesType, this.piecesColor);
			piece.index = i;

			this.setMatrixAt(i, piece);
			this.setColorAt(
				i,
				piece.color === ColorVariant.black ? COLOR_BLACK : COLOR_WHITE
			);

			this.pieces[piece.id] = piece;
			this._subscribePiece(piece);
		});

		this.pieceMoved$$.subscribe(this.update.bind(this));
	}

	private _subscribePiece(piece: PieceModel<type, color>): void {
		this.pieceUpdateSubscriptions[piece.id] = piece.update$$.subscribe(
			this._onPieceMoved.bind(this)
		);
	}

	private _unsubscribePieces(): void {
		Object.keys(this.pieceUpdateSubscriptions).forEach((id) => {
			this.pieceUpdateSubscriptions[id].unsubscribe();
			delete this.pieceUpdateSubscriptions[id];
		});
	}

	private _deletePiece(id: PieceId): void {
		delete this.pieces[id];

		this.update();
	}

	private _onPieceMoved(piece: PieceModel<type, color>) {
		if (this.pieces[piece.id] !== piece) return;

		const _safePice = this.pieces[piece.id];

		if (!_safePice) return;

		this.setMatrixAt(_safePice.index, piece);
		this.pieceMoved$$.next(piece);
	}

	public initPhysics(physics: Physics): void {
		const physicsProperties = physics.addToWorld(
			this,
			1
		) as PhysicsProperties[];

		physicsProperties.forEach((_, i) => {
			if (this.pieces[i] && physicsProperties[i])
				this.pieces[i].physics = physicsProperties[i];
		});
	}

	public copy(
		pieceGroup: PiecesGroupModel<type, color>,
		recursive?: boolean
	): this {
		Object.keys(this.pieces).forEach((id) => {
			pieceGroup.pieces[id] = this.pieces[id];
		});

		return super.copy(pieceGroup, recursive);
	}

	public setPieceCoords(
		id: PieceId,
		board: InstancedMesh,
		coords: BoardCoords
	): this["pieces"][PieceId] | undefined {
		if (this?.geometry.attributes.position) {
			this.geometry.computeBoundingBox();
			const boundingBox = this.geometry.boundingBox;

			if (boundingBox) {
				// const width = boundingBox.max.x - boundingBox.min.x;
				const height = boundingBox.max.y - boundingBox.min.y;

				this.pieces[id]?.setCoords(board, coords, {
					x: 0,
					y: height / 2 + 0.5,
					z: 0
				});
			}
		}

		return this.pieces[id];
	}

	public dropPiece(
		id: PieceId,
		physics?: Physics
	): this["pieces"][PieceId] | undefined {
		const pieceToDrop = this.pieces[id];

		if (!this.pieces[id]) return undefined;
		this._unsubscribePieces();
		this._deletePiece(id);

		const newGroup = new PiecesGroupModel(
			this.piecesType,
			this.piecesColor,
			0,
			this.geometry,
			this.pieces
		);
		const physicsProps = physics?.dynamicObjectsMap.get(
			this
		) as PhysicsProperties[];
		const physicsPropsToDrop = physics?.getPhysicsPropertiesFromObject(
			this,
			id
		);

		physicsProps?.splice(id, 1);
		physics?.removePropsFromWorld(physicsPropsToDrop);

		this.dispose();
		this.copy(newGroup);

		return pieceToDrop;
	}

	public update(): void {
		this.matrixWorldNeedsUpdate = true;
		this.instanceMatrix.needsUpdate = true;

		this.computeBoundingBox();

		Object.keys(this.pieces).forEach((id) => {
			this.getMatrixAt(parseInt(id), this.pieces[id]);
		});

		this.update$$.next(this);
	}
}
