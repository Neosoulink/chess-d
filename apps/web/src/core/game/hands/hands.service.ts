import { CoreModule as Chessboard } from "@chess-d/chessboard";
import { ColorSide, type ObservablePayload } from "@chess-d/shared";
import { AppModule } from "@quick-threejs/reactive";
import { deserializeObject3D, serializeObject3D } from "@quick-threejs/utils";
import {
	AnimationAction,
	AnimationClip,
	AnimationMixer,
	Group,
	SkinnedMesh,
	Vector3,
	Vector3Like
} from "three";
import type { GLTF } from "three/examples/jsm/Addons.js";
import { inject, singleton } from "tsyringe";
import { PiecesController } from "../pieces/pieces.controller";

@singleton()
export class HandService {
	static readonly INITIAL_HAND_POSITION: Vector3Like = { x: 0, y: 3, z: 6 };

	public readonly gltf?: GLTF;
	public readonly hands = {} as Record<
		ColorSide,
		{
			scene: Group;
			animation: {
				mixer?: AnimationMixer;
				clip?: AnimationClip;
				action?: AnimationAction;
			};
		}
	>;

	constructor(@inject(AppModule) private readonly app: AppModule) {
		this.gltf = this.app.loader.getLoadedResources()["masterHand"] as GLTF;
	}

	public init() {
		const modelGroup = this.gltf?.scene;
		const animationClips = this.gltf?.animations;

		if (!(modelGroup instanceof Group)) throw new Error("Invalid hand model");
		if (!animationClips?.length) throw new Error("No animations found");

		const idleClip = AnimationClip.findByName(animationClips, "idle");
		const groupPosition = new Vector3(0, 3, 6);
		const groupScalar = 0.05;

		(() => {
			const scene = modelGroup;
			const mixer = new AnimationMixer(scene);
			const action = mixer.clipAction(idleClip).play();

			this.hands[ColorSide.black] = {
				scene,
				animation: {
					action,
					clip: idleClip,
					mixer
				}
			};

			this.hands[ColorSide.black].scene.name = "master-hand-black";
			this.hands[ColorSide.black].scene.rotation.x = Math.PI / 2;
			this.hands[ColorSide.black].scene.rotation.y = Math.PI;
			this.hands[ColorSide.black].scene.scale.setScalar(groupScalar);
			this.hands[ColorSide.black].scene.position.copy(
				HandService.INITIAL_HAND_POSITION
			);

			this.app.world.scene().add(this.hands[ColorSide.black].scene);
		})();

		(() => {
			const scene = deserializeObject3D(serializeObject3D(modelGroup)) as Group;
			const mixer = new AnimationMixer(scene);
			const action = mixer.clipAction(idleClip).play();

			this.hands[ColorSide.white] = {
				scene,
				animation: {
					action,
					clip: idleClip,
					mixer
				}
			};

			this.hands[ColorSide.white].scene.name = "master-hand-white";
			this.hands[ColorSide.white].scene.rotation.x = Math.PI / 2;
			this.hands[ColorSide.white].scene.rotation.y = Math.PI;
			this.hands[ColorSide.white].scene.rotation.z = Math.PI;
			this.hands[ColorSide.white].scene.scale.setScalar(groupScalar);
			this.hands[ColorSide.white].scene.position.copy(
				HandService.INITIAL_HAND_POSITION
			);
			this.hands[ColorSide.white].scene.position.z *= -1;

			this.app.world.scene().add(this.hands[ColorSide.white].scene);
		})();
	}

	public handlePieceSelected(
		payload: ObservablePayload<
			Chessboard["pieces"]["controller"]["pieceMoving$"]
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

		if (!(mesh instanceof SkinnedMesh)) return;

		this.hands[payload.colorSide].animation.action?.stop();

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
			Chessboard["pieces"]["controller"]["pieceMoving$"]
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
			Chessboard["pieces"]["controller"]["pieceDeselected$"]
		>
	) {
		const hand = this.hands[payload.colorSide];
		if (!hand) return;

		hand.animation.action?.play();
		hand.scene.position.copy(HandService.INITIAL_HAND_POSITION);
		if (payload.colorSide === ColorSide.white) hand.scene.position.z *= -1;
	}

	update(delta: number) {
		if (this.hands[ColorSide.black]?.animation?.mixer)
			this.hands[ColorSide.black].animation.mixer.update(delta * 0.001);

		if (this.hands[ColorSide.white]?.animation?.mixer)
			this.hands[ColorSide.white].animation.mixer.update(delta * 0.001);
	}
}
