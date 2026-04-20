import { ChessboardModule, COLOR_WHITE } from "@chess-d/chessboard";
import { ColorSide, type ObservablePayload } from "@chess-d/shared";
import { deserializeObject3D, serializeObject3D } from "@quick-threejs/utils";
import { AppModule } from "@quick-threejs/reactive/worker";
import {
	AnimationAction,
	AnimationClip,
	AnimationMixer,
	FrontSide,
	Group,
	Material,
	MeshLambertMaterial,
	SkinnedMesh,
	Vector3Like
} from "three";
import type { GLTF } from "three/examples/jsm/Addons.js";
import { inject, Lifecycle, scoped } from "tsyringe";

import { SETTINGS_SUPPORTED_HANDS_THEMES } from "@/shared/constants";
import { SettingsService } from "../../settings/settings.service";
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
	public material = new MeshLambertMaterial();

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(SettingsService) private readonly _settings: SettingsService,
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
		const settingsThemeId =
			this._settings.state.hands?.params?.style?.value?.toString();
		const settingsTheme =
			SETTINGS_SUPPORTED_HANDS_THEMES[settingsThemeId || "white"];
		const primaryThemeColor =
			this._settings.state["visual-theme"]?.params[
				"primary-theme"
			]?.value?.toString();
		const transparent =
			!!this._settings.state.hands?.params?.transparent?.value;

		this.material.visible =
			!!this._settings.state.hands?.params?.visible?.value;
		this.material.color.set(
			(settingsThemeId === "use-theme"
				? primaryThemeColor
				: settingsTheme?.value) ?? COLOR_WHITE
		);
		this.material.side = FrontSide;
		this.material.transparent = transparent;
		this.material.opacity = transparent ? 0.55 : 1;

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

	public handlePieceSelected(payload: { side: ColorSide }) {
		const { side } = payload;
		const mesh = this.hands[side].scene.children[0]?.children[0];
		const params = {
			indexX: 0.6,
			indexY: 0.1,
			indexZ: 0.07,

			middleX: 0.7,
			middleY: 0.1,
			middleZ: -0.08,

			pinkyX: 1.25,
			pinkyY: 0.1,
			pinkyZ: -0.52,

			ringY: 0.1,
			ringX: 1.25,
			ringZ: -0.22,

			thumbX: 0.2,
			thumbY: -0.2,
			thumbZ: -0.45,

			wristX: 0.1,
			wristY: 0.1,
			wristZ: 0.1
		};
		const hand = this.hands[side];

		if (!(mesh instanceof SkinnedMesh)) return;

		hand.animation.mixer?.stopAllAction();

		// const wrist = mesh.skeleton.bones[0]!;
		const wrist1 = mesh.skeleton.bones[1]!;
		const wrist2 = mesh.skeleton.bones[2]!;
		const wrist3 = mesh.skeleton.bones[6]!;
		const wrist4 = mesh.skeleton.bones[10]!;
		const wrist5 = mesh.skeleton.bones[14]!;
		const wrist6 = mesh.skeleton.bones[18]!;
		wrist1.rotation.x = params.wristX;
		wrist2.rotation.x = params.wristX;
		wrist3.rotation.x = params.wristX;
		wrist4.rotation.x = params.wristX;
		wrist5.rotation.x = params.wristX;
		wrist6.rotation.x = params.wristX;

		const thumb1 = mesh.skeleton.bones[3]!;
		const thumb2 = mesh.skeleton.bones[4]!;
		const thumb3 = mesh.skeleton.bones[5]!;
		thumb1.rotation.x = params.thumbX;
		thumb2.rotation.x = params.thumbX;
		thumb3.rotation.x = params.thumbX;
		thumb1.rotation.z = params.thumbZ;
		thumb1.rotation.y = params.thumbY;
		thumb2.rotation.z = params.thumbZ;
		thumb3.rotation.z = params.thumbZ;

		const index1 = mesh.skeleton.bones[7]!;
		const index2 = mesh.skeleton.bones[8]!;
		const index3 = mesh.skeleton.bones[9]!;
		index1.rotation.x = params.indexX;
		index2.rotation.x = params.indexX;
		index3.rotation.x = params.indexX;
		index2.rotation.z = params.indexZ;

		const middle1 = mesh.skeleton.bones[11]!;
		const middle2 = mesh.skeleton.bones[12]!;
		const middle3 = mesh.skeleton.bones[13]!;
		middle1.rotation.x = params.middleX;
		middle2.rotation.x = params.middleX;
		middle3.rotation.x = params.middleX;

		const ring1 = mesh.skeleton.bones[15]!;
		const ring2 = mesh.skeleton.bones[16]!;
		const ring3 = mesh.skeleton.bones[17]!;
		ring1.rotation.x = params.ringX;
		ring2.rotation.x = params.ringX;
		ring3.rotation.x = params.ringX;

		const pinky1 = mesh.skeleton.bones[19]!;
		const pinky2 = mesh.skeleton.bones[20]!;
		const pinky3 = mesh.skeleton.bones[21]!;
		pinky1.rotation.x = params.pinkyX;
		pinky2.rotation.x = params.pinkyX;
		pinky3.rotation.x = params.pinkyX;
	}

	public setHandPosition(colorSide: ColorSide, position: Vector3Like) {
		this.hands[colorSide]?.scene.position.copy(position);
	}

	public handlePieceMoving(
		payload: ObservablePayload<
			ReturnType<ChessboardModule["pieces"]["getPieceMoving$"]>
		>
	) {
		const { colorSide } = payload;
		const position = payload.cellsIntersection?.point || payload.lastPosition;
		const whiteSide = colorSide === ColorSide.white;
		const x = position?.x || 0;
		const y = payload.pieceGeometry.boundingBox
			? payload.pieceGeometry.boundingBox.max.y -
				payload.pieceGeometry.boundingBox.min.y
			: 2;
		const z = position?.z || 0;
		const xOffset = 0.2;
		const yOffset = 0.8;
		const zOffset = 1.7;

		this.setHandPosition(colorSide, {
			x: x + (whiteSide ? -xOffset : xOffset),
			y: y + yOffset,
			z: z + (whiteSide ? -zOffset : zOffset)
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
