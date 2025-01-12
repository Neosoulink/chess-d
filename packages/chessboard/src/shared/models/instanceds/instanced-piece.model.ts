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
	public readonly pieceUpdated$$ = new Subject<MatrixPieceModel<Type, Color>>();
	public readonly pieces: MatrixPieceModel<Type, Color>[] = [];
	public readonly pieceUpdateSubscriptions: Subscription[] = [];

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

			this.getMatrixAt(piece.instanceId, piece);

			if (oldPiece instanceof MatrixPieceModel) {
				piece.coord.col = oldPiece.coord.col;
				piece.coord.row = oldPiece.coord.row;
				piece.promotedFromType = oldPiece.promotedFromType;
				piece.setPosition(oldPiece.position);
			}

			this.pieces.push(piece);
			this._handlePiecesSubscription(piece);

			this.setMatrixAt(piece.instanceId, piece);
			this.setColorAt(piece.instanceId, color);

			this.update();
		});

		this.pieceUpdated$$.subscribe(this.update.bind(this));
	}

	private _handlePiecesSubscription(
		piece: MatrixPieceModel<Type, Color>
	): void {
		this.pieceUpdateSubscriptions.push(
			piece.updated$$.subscribe(this._handlePieceUpdate.bind(this))
		);
	}

	private _handlePiecesDispose() {
		this.pieceUpdateSubscriptions.forEach((sub) => {
			sub.unsubscribe();
			this.pieceUpdateSubscriptions.shift();
		});

		this.pieces.forEach((piece, i) => {
			piece.dispose();

			delete this.pieces[i];
		});
	}

	private _handleConstruct(
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

		this.dispose(physics);
		instance.initPhysics(physics);
		parent?.add(instance);

		this.update();

		return instance;
	}

	private _handlePieceDelete(instanceId: number): void {
		this.pieceUpdateSubscriptions[instanceId]?.unsubscribe();
		this.pieceUpdateSubscriptions.splice(instanceId, 1);
		this.pieces[instanceId]?.dispose();
		this.pieces.splice(instanceId, 1);

		this.update();
	}

	private _handlePieceUpdate(piece: MatrixPieceModel<Type, Color>) {
		if (this.pieces[piece.instanceId] !== piece) return;

		this.setMatrixAt(piece.instanceId, piece);
		this.pieceUpdated$$.next(piece);
	}

	public getPieceByInstanceId(
		instanceId: number
	): MatrixPieceModel<Type, Color> | undefined {
		return this.pieces[instanceId];
	}

	public initPhysics(physics: Physics): void {
		const physicsProperties = physics.addToWorld(
			this,
			0
		) as PhysicsProperties[];

		physicsProperties.forEach((props, instanceId) => {
			const piece = this.getPieceByInstanceId(instanceId);

			if (piece instanceof MatrixPieceModel && props?.collider)
				piece.physics = props;
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
		coord: BoardCoord,
		offset?: Vector3Like
	): this["pieces"][number] | undefined {
		if (this?.geometry.attributes.position) {
			this.geometry.computeBoundingBox();
			const boundingBox = this.geometry.boundingBox;
			const piece = this.getPieceByInstanceId(instanceId);

			if (!boundingBox || !piece) return undefined;

			const height = boundingBox.max.y;

			piece.setCoord(boardMesh, coord, {
				x: boardMesh.position.x + (offset?.x || 0),
				y: boardMesh.position.y + height + (offset?.y || 0),
				z: boardMesh.position.z + (offset?.z || 0)
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

		return this._handleConstruct(physics, this.pieces);
	}

	public dropPiece(
		instanceId: number,
		physics?: Physics
	): InstancedPieceModel<Type, Color> | undefined {
		if (!this.pieces[instanceId] || !physics) return undefined;

		this._handlePieceDelete(instanceId);

		return this._handleConstruct(physics, this.pieces);
	}

	public update(): void {
		this.matrixWorldNeedsUpdate = true;
		this.instanceMatrix.needsUpdate = true;

		this.geometry.computeBoundingBox();
		this.geometry.computeBoundingSphere();
		this.computeBoundingBox();
		this.computeBoundingSphere();

		Object.values(this.pieces).forEach((piece) => {
			this.setMatrixAt(piece.instanceId, piece);
		});
	}

	public dispose(physics?: Physics): this {
		physics?.removeFromWorld(this);
		this._handlePiecesDispose();
		this.removeFromParent();
		this.pieceUpdated$$.complete();
		super.dispose();

		return this;
	}
}
