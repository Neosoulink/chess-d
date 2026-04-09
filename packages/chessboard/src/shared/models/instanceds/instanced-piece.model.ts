import {
	BufferGeometry,
	DynamicDrawUsage,
	InstancedMesh,
	Material,
	Vector3Like,
	Color,
	ColorRepresentation
} from "three";
import { Subject, Subscription } from "rxjs";
import { Physics, PhysicsProperties } from "@chess-d/rapier";
import { BoardCoord, ColorSide, PieceType } from "@chess-d/shared";

import { COLOR_BLACK, COLOR_WHITE } from "../../constants";
import { MatrixPieceModel } from "../matrixes/matrix-piece.model";

export class InstancedPieceModel<
	Type extends PieceType = PieceType,
	Side extends ColorSide = ColorSide
> extends InstancedMesh {
	public readonly pieceUpdated$$ = new Subject<MatrixPieceModel<Type, Side>>();
	public readonly pieces: MatrixPieceModel<Type, Side>[] = [];
	public readonly pieceUpdateSubscriptions: Subscription[] = [];

	public readonly color = new Color();

	constructor(
		public readonly piecesType: Type,
		public readonly piecesSide: Side,
		count: number,
		geometry: BufferGeometry,
		material?: Material | Material[],
		pieces?: InstancedPieceModel<Type, Side>["pieces"]
	) {
		const piecesMatrix = pieces ?? Array.from(Array(count));
		super(geometry, material, piecesMatrix.length);

		this.color.copy(piecesSide === ColorSide.black ? COLOR_BLACK : COLOR_WHITE);
		this.instanceMatrix.setUsage(DynamicDrawUsage);

		piecesMatrix.forEach((_, instanceId) => {
			const oldPiece = pieces?.[+instanceId];
			const piece = new MatrixPieceModel(
				this.piecesType,
				this.piecesSide,
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
			this.setColorAt(piece.instanceId, this.color);

			this.update();
		});

		this.pieceUpdated$$.subscribe(this.update.bind(this));
	}

	private _handlePiecesSubscription(piece: MatrixPieceModel<Type, Side>): void {
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
		pieces: InstancedPieceModel<Type, Side>["pieces"]
	): InstancedPieceModel<Type, Side> {
		const parent = this.parent;
		const instance = new InstancedPieceModel(
			this.piecesType,
			this.piecesSide,
			0,
			this.geometry,
			this.material,
			pieces
		);
		instance.userData = this.userData;

		this.dispose(physics);
		instance.resetPhysics(physics);
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

	private _handlePieceUpdate(piece: MatrixPieceModel<Type, Side>) {
		if (this.pieces[piece.instanceId] !== piece) return;

		this.setMatrixAt(piece.instanceId, piece);
		this.pieceUpdated$$.next(piece);
	}

	public getPieceByInstanceId(
		instanceId: number
	): MatrixPieceModel<Type, Side> | undefined {
		return this.pieces[instanceId];
	}

	public resetPhysics(physics: Physics): void {
		this._disposePhysics(physics);

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
		pieceGroup: InstancedPieceModel<Type, Side>,
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
	): MatrixPieceModel<Type, Side> | undefined {
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
			this.geometry.center();

			const boundingBox = this.geometry.boundingBox;
			const piece = this.getPieceByInstanceId(instanceId);

			if (!boundingBox || !piece) return undefined;

			const height = boundingBox.max.y + 0.05;

			piece.setCoord(boardMesh, coord, {
				x: boardMesh.position.x + (offset?.x || 0),
				y: boardMesh.position.y + height + (offset?.y || 0),
				z: boardMesh.position.z + (offset?.z || 0)
			});
		}

		return this.pieces[instanceId];
	}

	public addPiece(
		piece: MatrixPieceModel<Type, Side>,
		physics: Physics
	): InstancedPieceModel<Type, Side> | undefined {
		if (!(piece instanceof MatrixPieceModel)) return undefined;

		this.pieces.push(piece);

		return this._handleConstruct(physics, this.pieces);
	}

	public dropPiece(
		instanceId: number,
		physics?: Physics
	): InstancedPieceModel<Type, Side> | undefined {
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

	private _disposePhysics(physics?: Physics): void {
		if (!physics) return;

		physics.removePropsFromWorld(this.userData.grabProps);
		physics.removeFromWorld(this);
	}

	public dispose(physics?: Physics): this {
		this._disposePhysics(physics);
		this._handlePiecesDispose();
		this.removeFromParent();
		this.pieceUpdated$$.complete();
		super.dispose();

		return this;
	}

	public setPiecesColor(color: ColorRepresentation): void {
		this.color.set(color);

		this.pieces.forEach((piece) => {
			this.setColorAt(piece.instanceId, this.color);
		});

		if (this.instanceColor) this.instanceColor.needsUpdate = true;
	}
}
