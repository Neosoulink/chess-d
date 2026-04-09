import { AppModule } from "@quick-threejs/reactive/worker";
import { ChessboardModule } from "@chess-d/chessboard";
import { Scene, WebGLRenderer } from "three";

import { OrbitControls } from "three/examples/jsm/Addons.js";
import { inject, singleton } from "tsyringe";

import { DEBUG_OPTIONS } from "../../../shared/constants";
import { WorldService } from "../world/world.service";
import { RendererService } from "../renderer/renderer.service";
import { HandsService } from "../world/hands/hands.service";
import { PiecesService } from "../world/chessboard/pieces/pieces.service";
import { CameraService } from "../camera/camera.service";
import { HandsController } from "../world/hands/hands.controller";
import { MapService } from "../world/map/map.service";
import { ChessboardService } from "../world/chessboard/chessboard.service";

@singleton()
export class DebugService {
	public readonly scene: Scene;
	public readonly rendererInstance: WebGLRenderer;

	public enabled: boolean;

	constructor(
		@inject(AppModule) public readonly app: AppModule,
		@inject(ChessboardModule) public readonly chessboard: ChessboardModule,
		@inject(RendererService) public readonly rendererService: RendererService,
		@inject(CameraService) public readonly cameraService: CameraService,
		@inject(WorldService) public readonly worldService: WorldService,
		@inject(MapService) public readonly woldMapService: MapService,
		@inject(HandsController) public readonly handsController: HandsController,
		@inject(ChessboardService)
		public readonly chessboardService: ChessboardService,
		@inject(PiecesService) public readonly piecesService: PiecesService,
		@inject(HandsService) public readonly handsService: HandsService
	) {
		this.enabled = this.app.debug.enabled();
		this.rendererInstance = this.app.renderer.instance()!;
		this.scene = this.app.world.scene();
	}

	public enableControls(enabled: boolean = this.enabled): void {
		const appDebug = this.app.debug;
		const orbitControls = appDebug.getCameraControls() as
			| OrbitControls
			| undefined;
		const miniOrbitControls = appDebug.getMiniCameraControls() as
			| OrbitControls
			| undefined;

		if (orbitControls) orbitControls.enabled = !!enabled;
		if (miniOrbitControls) miniOrbitControls.enabled = !!enabled;
	}

	public enableAxesHelper(enabled: boolean = this.enabled): void {
		const appDebug = this.app.debug;
		const axesHelper = appDebug.getAxesHelper();
		if (axesHelper) axesHelper.visible = !!enabled;
	}

	public enablePhysicsLines(enabled: boolean = this.enabled): void {
		const chessboardDebug = this.chessboard.debug;

		if (enabled) chessboardDebug.init();
		else chessboardDebug.dispose();
	}

	public handleDebugEnabledChange(enabled?: boolean): void {
		this.enabled = !!enabled;

		this.app.debug.enabled(this.enabled);
		this.enableControls();
		this.enableAxesHelper();
		this.enablePhysicsLines();
	}

	public handlePaneChange(props: { type: string; value: unknown }): void {
		const [folderTitle, bladeTitle] = props.type.split("~");
		const firstFolderTitle = Object.keys(DEBUG_OPTIONS)[0];
		const firstFolderParams = firstFolderTitle
			? DEBUG_OPTIONS[firstFolderTitle]
			: undefined;
		const firstBladeTitle = firstFolderParams
			? Object.keys(firstFolderParams)[0]
			: undefined;

		if (
			folderTitle &&
			bladeTitle &&
			(this.enabled ||
				(folderTitle === firstFolderTitle && bladeTitle === firstBladeTitle))
		)
			DEBUG_OPTIONS[folderTitle]?.[bladeTitle]?.func({
				...props,
				self: this
			});
	}
}
