import {
	BufferGeometry,
	DynamicDrawUsage,
	InstancedMesh,
	Vector3
} from "three";
import { Subject, Subscription } from "rxjs";
import { Physics } from "@chess-d/rapier-physics";
import { PhysicsProperties } from "@chess-d/rapier-physics/dist/types";

import { BoardCoord, PieceId } from "../../interfaces";
import { ColorVariant, PieceType } from "../../enums";
import { COLOR_BLACK, COLOR_WHITE } from "../../constants";
import { MatrixPieceModel } from "../matrixes/matrix-piece.model";

export class InstancedPieceModel<
	Type extends PieceType = PieceType,
	Color extends ColorVariant = ColorVariant
> extends InstancedMesh {
	public readonly pieces: Record<PieceId, MatrixPieceModel<Type, Color>> = {};
	public readonly pieceUpdateSubscriptions: Record<PieceId, Subscription> = {};
	public readonly update$$ = new Subject<InstancedPieceModel<Type, Color>>();
	public readonly pieceMoved$$ = new Subject<MatrixPieceModel<Type, Color>>();

	constructor(
		public readonly piecesType: Type,
		public readonly piecesColor: Color,
		count: PieceId,
		geometry: BufferGeometry,
		pieces?: Record<PieceId, MatrixPieceModel<Type, Color>>
	) {
		const piecesMatrix = pieces
			? Object.keys(pieces)
			: Array.from(Array(count));

		super(geometry, undefined, piecesMatrix.length);
		this.instanceMatrix.setUsage(DynamicDrawUsage);

		piecesMatrix.forEach((pieceKey: number, i) => {
			const oldPiece = pieces?.[pieceKey];
			const piece =
				oldPiece ?? new MatrixPieceModel(i, this.piecesType, this.piecesColor);
			piece.index = i;

			this.setMatrixAt(i, piece);
			this.setColorAt(
				i,
				piece.color === ColorVariant.black ? COLOR_BLACK : COLOR_WHITE
			);

			this.pieces[piece.id] = piece;
			this._subscribePiece(piece);
		});

		this.addEventListener("dispose", this._unsubscribePieces.bind(this));
		this.pieceMoved$$.subscribe(this.update.bind(this));
	}

	private _subscribePiece(piece: MatrixPieceModel<Type, Color>): void {
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
		this.pieceUpdateSubscriptions[id]?.unsubscribe();

		delete this.pieceUpdateSubscriptions[id];
		delete this.pieces[id];

		this.update();
	}

	private _onPieceMoved(piece: MatrixPieceModel<Type, Color>) {
		if (this.pieces[piece.id] !== piece) return;

		const _safePice = this.pieces[piece.id];

		if (!_safePice) return;

		this.setMatrixAt(_safePice.index, piece);
		this.pieceMoved$$.next(piece);
	}

	public getPieceById(id: PieceId): MatrixPieceModel<Type, Color> | undefined {
		return this.pieces[id];
	}

	public getPieceByIndex(
		index: number
	): MatrixPieceModel<Type, Color> | undefined {
		const id = Object.keys(this.pieces)[index];

		if (!id) return undefined;

		return this.getPieceById(parseInt(id));
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
		pieceGroup: InstancedPieceModel<Type, Color>,
		recursive?: boolean
	): this {
		Object.keys(this.pieces).forEach((id) => {
			pieceGroup.pieces[id] = this.pieces[id];
		});

		return super.copy(pieceGroup, recursive);
	}

	public setPiecePosition(
		id: PieceId,
		position: Vector3
	): MatrixPieceModel<Type, Color> | undefined {
		return this.pieces[id]?.setPosition(position);
	}

	public setPieceCoord(
		id: PieceId,
		boardMesh: InstancedMesh,
		coord: BoardCoord
	): this["pieces"][PieceId] | undefined {
		if (this?.geometry.attributes.position) {
			this.geometry.computeBoundingBox();
			const boundingBox = this.geometry.boundingBox;

			if (!boundingBox) return;

			// const width = boundingBox.max.x - boundingBox.min.x;
			const height = boundingBox.max.y - boundingBox.min.y;

			this.pieces[id]?.setCoord(boardMesh, coord, {
				x: boardMesh.position.x,
				y: boardMesh.position.y + (height / 2 + 0.5),
				z: boardMesh.position.z
			});
		}

		return this.pieces[id];
	}

	public dropPiece(
		id: PieceId,
		physics?: Physics
	): InstancedPieceModel<Type, Color> | undefined {
		if (!this.pieces[id]) return undefined;
		this._deletePiece(id);

		const parent = this.parent;
		const newGroup = new InstancedPieceModel(
			this.piecesType,
			this.piecesColor,
			0,
			this.geometry,
			this.pieces
		);
		const physicsProps = this.userData
			?.physicsProperties as PhysicsProperties[];
		const physicsPropsToDrop = physicsProps[id];

		newGroup.userData = this.userData;

		if (
			typeof this.userData?.dynamicObjectIndex === "number" &&
			physics &&
			physicsProps
		) {
			physicsProps.splice(id, 1);
			physics.removePropsFromWorld(physicsPropsToDrop);
			physics.dynamicObjects[this.userData.dynamicObjectIndex] = newGroup;
			physics.dynamicObjectsMap.delete(this);
			physics.dynamicObjectsMap.set(newGroup, physicsProps);

			newGroup.userData = {
				...newGroup.userData,
				dynamicObjectIndex: this.userData.dynamicObjectIndex
			};
		}

		this.removeFromParent();
		this.dispose();

		parent?.add(newGroup);

		return newGroup;
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

	public dispose(): this {
		this.removeEventListener("dispose", this.dispose.bind(this));
		return super.dispose();
	}
}
