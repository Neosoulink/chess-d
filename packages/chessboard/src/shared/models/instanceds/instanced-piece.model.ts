import {
	BufferGeometry,
	DynamicDrawUsage,
	InstancedMesh,
	Vector3Like
} from "three";
import { Subject, Subscription } from "rxjs";
import { Physics } from "@chess-d/rapier-physics";
import { PhysicsProperties } from "@chess-d/rapier-physics/dist/types";
import { BoardCoord, ColorSide, PieceType } from "@chess-d/shared";

import { COLOR_BLACK, COLOR_WHITE } from "../../constants";
import { MatrixPieceModel } from "../matrixes/matrix-piece.model";

export class InstancedPieceModel<
	Type extends PieceType = PieceType,
	Color extends ColorSide = ColorSide
> extends InstancedMesh {
	public readonly pieces: MatrixPieceModel<Type, Color>[] = [];
	public readonly pieceUpdateSubscriptions: Subscription[] = [];
	public readonly pieceMoved$$ = new Subject<MatrixPieceModel<Type, Color>>();
	public readonly updated$$ = new Subject<InstancedPieceModel<Type, Color>>();

	constructor(
		public readonly piecesType: Type,
		public readonly piecesColor: Color,
		count: number,
		geometry: BufferGeometry,
		pieces?: InstancedPieceModel<Type, Color>["pieces"]
	) {
		const piecesMatrix = pieces ?? Array.from(Array(count));
		const color = piecesColor === ColorSide.black ? COLOR_BLACK : COLOR_WHITE;

		super(geometry, undefined, piecesMatrix.length);
		this.instanceMatrix.setUsage(DynamicDrawUsage);

		piecesMatrix.forEach((_, instanceId) => {
			const oldPiece = pieces?.[+instanceId];
			const piece = new MatrixPieceModel(
				this.piecesType,
				this.piecesColor,
				instanceId
			);

			if (oldPiece instanceof MatrixPieceModel) {
				piece.coord.col = oldPiece.coord.col;
				piece.coord.row = oldPiece.coord.row;
				piece.promotedFromType = oldPiece.promotedFromType;
				piece.setPosition(oldPiece.position);
			}

			this.pieces.push(piece);
			this._subscribePiece(piece);
			this.setMatrixAt(piece.instanceId, piece);
			this.setColorAt(piece.instanceId, color);
			this.update();
		});

		this.addEventListener("dispose", this._unsubscribePieces.bind(this));
		this.pieceMoved$$.subscribe(this.update.bind(this));
	}

	private _subscribePiece(piece: MatrixPieceModel<Type, Color>): void {
		this.pieceUpdateSubscriptions.push(
			piece.updated$$.subscribe(this._onPieceMoved.bind(this))
		);
	}

	private _unsubscribePieces(): void {
		Object.keys(this.pieceUpdateSubscriptions).forEach((id) => {
			this.pieceUpdateSubscriptions[id].unsubscribe();
			delete this.pieceUpdateSubscriptions[id];
		});
	}

	private _reConstruct(
		physics: Physics,
		pieces: InstancedPieceModel<Type, Color>["pieces"]
	): InstancedPieceModel<Type, Color> {
		const parent = this.parent;
		const instance = new InstancedPieceModel(
			this.piecesType,
			this.piecesColor,
			0,
			this.geometry,
			pieces
		);
		instance.userData = this.userData;

		physics.removeFromWorld(this);
		this.dispose();
		instance.initPhysics(physics);
		parent?.add(instance);

		this.update();

		return instance;
	}

	private _deletePiece(instanceId: number): void {
		this.pieceUpdateSubscriptions[instanceId]?.unsubscribe();
		this.pieceUpdateSubscriptions.splice(instanceId, 1);
		this.pieces.splice(instanceId, 1);

		this.update();
	}

	private _onPieceMoved(piece: MatrixPieceModel<Type, Color>) {
		if (this.pieces[piece.instanceId] !== piece) return;

		this.setMatrixAt(piece.instanceId, piece);
		this.pieceMoved$$.next(piece);
	}

	public getPieceByInstanceId(
		instanceId: number
	): MatrixPieceModel<Type, Color> | undefined {
		return this.pieces[instanceId];
	}

	public initPhysics(physics: Physics): void {
		const physicsProperties = physics.addToWorld(
			this,
			1
		) as PhysicsProperties[];

		physicsProperties.forEach((physicsProps, instanceId) => {
			const piece = this.getPieceByInstanceId(instanceId);

			if (piece instanceof MatrixPieceModel && typeof physicsProps === "object")
				piece.physics = physicsProps;
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
		instanceId: number,
		position: Vector3Like
	): MatrixPieceModel<Type, Color> | undefined {
		const piece = this.getPieceByInstanceId(instanceId);
		return piece?.setPosition(position);
	}

	public setPieceCoord(
		instanceId: number,
		boardMesh: InstancedMesh,
		coord: BoardCoord
	): this["pieces"][number] | undefined {
		if (this?.geometry.attributes.position) {
			this.geometry.computeBoundingBox();
			const boundingBox = this.geometry.boundingBox;
			const piece = this.getPieceByInstanceId(instanceId);

			if (!boundingBox || !piece) return undefined;

			// const width = boundingBox.max.x - boundingBox.min.x;
			const height = boundingBox.max.y - boundingBox.min.y;

			piece.setCoord(boardMesh, coord, {
				x: boardMesh.position.x,
				y: boardMesh.position.y + (height / 2 + 0.5),
				z: boardMesh.position.z
			});
		}

		return this.pieces[instanceId];
	}

	public addPiece(
		piece: MatrixPieceModel<Type, Color>,
		physics: Physics
	): InstancedPieceModel<Type, Color> | undefined {
		if (!(piece instanceof MatrixPieceModel)) return undefined;

		this.pieces.push(piece);

		return this._reConstruct(physics, this.pieces);
	}

	public dropPiece(
		instanceId: number,
		physics?: Physics
	): InstancedPieceModel<Type, Color> | undefined {
		if (!this.pieces[instanceId] || !physics) return undefined;

		this._deletePiece(instanceId);

		return this._reConstruct(physics, this.pieces);
	}

	public update(): void {
		this.matrixWorldNeedsUpdate = true;
		this.instanceMatrix.needsUpdate = true;

		this.computeBoundingBox();

		Object.keys(this.pieces).forEach((id) => {
			this.getMatrixAt(parseInt(id), this.pieces[id]);
		});

		this.updated$$.next(this);
	}

	public dispose(): this {
		super.dispose();
		this._unsubscribePieces();
		this.updated$$.complete();
		this.removeFromParent();
		this.removeEventListener("dispose", this.dispose.bind(this));

		return this;
	}
}
