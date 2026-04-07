import { ChessboardModule } from "@chess-d/chessboard";
import { ColorSide, type ObservablePayload } from "@chess-d/shared";
import { deserializeObject3D, serializeObject3D } from "@quick-threejs/utils";
import { AppModule } from "@quick-threejs/reactive/worker";
import {
	AnimationAction,
	AnimationClip,
	AnimationMixer,
	DoubleSide,
	Group,
	Material,
	MeshPhysicalMaterial,
	SkinnedMesh,
	Vector3Like
} from "three";
import type { GLTF } from "three/examples/jsm/Addons.js";
import { inject, Lifecycle, scoped } from "tsyringe";

import { PiecesController } from "../chessboard/pieces/pieces.controller";
import { WorldService } from "../world.service";
import { HandsController } from "./hands.controller";

@scoped(Lifecycle.ContainerScoped)
export class HandsService {
	static readonly INITIAL_HAND_POSITION: Vector3Like = { x: 0, y: 2.5, z: 6 };

	private _gltf?: GLTF;

	public readonly hands = {} as Record<
		ColorSide,
		{
			scene: Group;
			animation: {
				mixer?: AnimationMixer;
				idleAction?: AnimationAction;
				idleClip?: AnimationClip;
			};
		}
	>;

	public animationClips?: AnimationClip[];
	public material = new MeshPhysicalMaterial();

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(WorldService) private readonly _world: WorldService
	) {}

	private _setupHands() {
		this.animationClips = this._gltf?.animations || [];

		const modelGroup = this._gltf?.scene;
		const idleClip = AnimationClip.findByName(this.animationClips, "idle");

		if (!(modelGroup instanceof Group)) throw new Error("Invalid hand model");
		if (!idleClip) throw new Error("Invalid or missing idle clip");

		[
			{ scene: modelGroup, colorSide: ColorSide.white },
			{
				scene: deserializeObject3D(serializeObject3D(modelGroup)) as Group,
				colorSide: ColorSide.black
			}
		].forEach(({ scene, colorSide }) => {
			const mixer = new AnimationMixer(scene);
			const idleAction = mixer.clipAction(idleClip).play();

			scene.name = `master-hand-${colorSide}`;
			scene.rotation.x = Math.PI / 2;
			scene.rotation.y = Math.PI;
			scene.scale.setScalar(0.05);
			scene.position.copy(HandsService.INITIAL_HAND_POSITION);

			if (colorSide === ColorSide.white) {
				scene.position.z *= -1;
				scene.rotation.z = Math.PI;
			}

			this.hands[colorSide] = {
				scene,
				animation: {
					idleAction,
					idleClip,
					mixer
				}
			};
		});
	}

	public resetMaterials(): void {
		this.material.side = DoubleSide;
		this.material.color.set("#ffffff");
		this.material.transparent = true;
		this.material.opacity = 1;
		this.material.sheen = 2;
		this.material.roughness = 0.45;
		this.material.metalness = 0.02;

		Object.values(this.hands).forEach((side) => {
			const mesh = side.scene.children[0]?.children[0] as
				| SkinnedMesh
				| undefined;

			if (
				mesh?.material instanceof Material &&
				(mesh.material as Material).uuid !== this.material.uuid
			) {
				mesh.material.dispose();
				mesh.material = this.material;
			}
		});
	}

	public resetScenes(): void {
		const scene = this._world.scene;
		scene.add(...Object.values(this.hands).map((side) => side.scene));
	}

	public reset() {
		this.resetMaterials();
		this.resetScenes();
	}

	public init() {
		this._gltf = this._app.loader.getLoadedResources()[
			"model-master-hand"
		] as GLTF;

		this._setupHands();
	}

	public handlePieceSelected(
		payload: ObservablePayload<
			ReturnType<ChessboardModule["pieces"]["getPieceMoving$"]>
		>
	) {
		const mesh = this.hands[payload.colorSide].scene.children[0]?.children[0];
		const params = {
			wrist: 0.1,
			thumb: 0.5,
			index: 0.25,
			middle: 0.4,
			ring: 1.25,
			pinky: 1.25,
			thumbz: -0.15,
			indexz: -0.3,
			middlez: -0.08,
			ringz: -0.22,
			pinkyz: -0.52
		};
		const hand = this.hands[payload.colorSide];

		if (!(mesh instanceof SkinnedMesh)) return;

		hand.animation.mixer?.stopAllAction();

		const wrist = mesh.skeleton.bones[0]!;
		const wrist1 = mesh.skeleton.bones[1]!;
		const wrist2 = mesh.skeleton.bones[2]!;
		const wrist3 = mesh.skeleton.bones[6]!;
		const wrist4 = mesh.skeleton.bones[10]!;
		const wrist5 = mesh.skeleton.bones[14]!;
		const wrist6 = mesh.skeleton.bones[18]!;
		wrist1.rotation.x = params.wrist;
		wrist2.rotation.x = params.wrist;
		wrist3.rotation.x = params.wrist;
		wrist4.rotation.x = params.wrist;
		wrist5.rotation.x = params.wrist;
		wrist6.rotation.x = params.wrist;

		const thumb1 = mesh.skeleton.bones[3]!;
		const thumb2 = mesh.skeleton.bones[4]!;
		const thumb3 = mesh.skeleton.bones[5]!;
		thumb1.rotation.x = params.thumb;
		thumb2.rotation.x = params.thumb;
		thumb3.rotation.x = params.thumb;
		thumb1.rotation.z = params.thumbz;
		thumb2.rotation.z = params.thumbz;
		thumb3.rotation.z = params.thumbz;

		const index1 = mesh.skeleton.bones[7]!;
		const index2 = mesh.skeleton.bones[8]!;
		const index3 = mesh.skeleton.bones[9]!;
		index1.rotation.x = params.index;
		index2.rotation.x = params.index;
		index3.rotation.x = params.index;

		const middle1 = mesh.skeleton.bones[11]!;
		const middle2 = mesh.skeleton.bones[12]!;
		const middle3 = mesh.skeleton.bones[13]!;
		middle1.rotation.x = params.middle;
		middle2.rotation.x = params.middle;
		middle3.rotation.x = params.middle;

		const ring1 = mesh.skeleton.bones[15]!;
		const ring2 = mesh.skeleton.bones[16]!;
		const ring3 = mesh.skeleton.bones[17]!;
		ring1.rotation.x = params.ring;
		ring2.rotation.x = params.ring;
		ring3.rotation.x = params.ring;

		const pinky1 = mesh.skeleton.bones[19]!;
		const pinky2 = mesh.skeleton.bones[20]!;
		const pinky3 = mesh.skeleton.bones[21]!;
		pinky1.rotation.x = params.pinky;
		pinky2.rotation.x = params.pinky;
		pinky3.rotation.x = params.pinky;
	}

	public setHandPosition(colorSide: ColorSide, position: Vector3Like) {
		this.hands[colorSide]?.scene.position.copy(position);
	}

	public handlePieceMoving(
		payload: ObservablePayload<
			ReturnType<ChessboardModule["pieces"]["getPieceMoving$"]>
		>
	) {
		const position = payload.cellsIntersection?.point || payload.lastPosition;
		const pieceHeight = payload.pieceGeometry.boundingBox
			? payload.pieceGeometry.boundingBox.max.y -
				payload.pieceGeometry.boundingBox.min.y
			: 2;

		this.setHandPosition(payload.colorSide, {
			x: position?.x || 0,
			y: pieceHeight + 0.8,
			z:
				(position?.z || 0) +
				(payload.colorSide === ColorSide.white ? -1.7 : 1.7)
		});
	}

	public handleAnimatedPlayerMovedPiece(
		payload: ObservablePayload<PiecesController["animatedPlayerMovedPiece$"]>
	) {
		const { piece, position, pieceHeight } = payload;

		const zOffset = 1.7;
		this.setHandPosition(piece.color, {
			...position,
			y: pieceHeight + 0.8,
			z: position.z + (piece.color === ColorSide.white ? -zOffset : zOffset)
		});
	}

	public handlePieceDeselected(
		payload: ObservablePayload<
			ReturnType<ChessboardModule["pieces"]["getPieceDeselected$"]>
		>
	) {
		const hand = this.hands[payload.colorSide];
		if (!hand) return;

		hand.animation.idleAction?.play();

		hand.scene.position.copy(HandsService.INITIAL_HAND_POSITION);
		if (payload.colorSide === ColorSide.white) hand.scene.position.z *= -1;
	}

	public handleEmoteStarted(
		payload: ObservablePayload<HandsController["emoteStarted$"]>
	) {
		const { idleAction, emoteAction, side } = payload;
		const hand = this.hands[side];
		const existingActions = (
			hand.animation.mixer as AnimationMixer & { _actions: AnimationAction[] }
		)?._actions;

		existingActions?.forEach(
			(action) => !["idle"].includes(action.getClip().name) && action.stop()
		);

		emoteAction.reset();
		emoteAction.paused = true;
		emoteAction.setEffectiveWeight(1);
		emoteAction.play();

		idleAction.crossFadeTo(emoteAction, 0.4, true);
	}

	public handleEmoteProgress(
		payload: ObservablePayload<HandsController["emoteProgress$"]>
	) {
		const { progress, emoteAction } = payload;

		if (emoteAction)
			emoteAction.time = progress * emoteAction.getClip().duration;
	}

	public handleEmoteEnded(
		payload: ObservablePayload<HandsController["emoteEnded$"]>
	) {
		const { idleAction, emoteAction, mixer } = payload;

		if (!emoteAction.isScheduled()) return;

		idleAction.reset();
		idleAction.setEffectiveWeight(1);
		idleAction.play();
		emoteAction.crossFadeTo(idleAction, 0.4, true);

		setTimeout(() => {
			emoteAction.stop();
			mixer.uncacheAction(emoteAction.getClip());
		}, 400);
	}

	update(delta: number) {
		const sides = Object.values(this.hands);
		sides.forEach((side) => side.animation.mixer?.update(delta));
	}
}
