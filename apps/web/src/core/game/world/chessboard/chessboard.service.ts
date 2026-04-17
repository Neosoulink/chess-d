import {
	ChessboardModule,
	InstancedCellModel,
	InstancedCellMakerModel,
	InstancedPieceModel,
	COLOR_BLACK,
	COLOR_WHITE
} from "@chess-d/chessboard";
import { BOARD_CELL_SIZE, BoardCoord, ColorSide } from "@chess-d/shared";
import { AppModule } from "@quick-threejs/reactive/worker";
import {
	CircleGeometry,
	Color,
	DoubleSide,
	Group,
	Material,
	Mesh,
	MeshBasicMaterial,
	MeshPhysicalMaterial,
	PlaneGeometry,
	SRGBColorSpace,
	Texture
} from "three";
import { inject, Lifecycle, scoped } from "tsyringe";

import { WorldService } from "../world.service";
import { SettingsService } from "../../settings/settings.service";
import { SETTINGS_SUPPORTED_MATERIAL_THEMES } from "@/shared/constants";

@scoped(Lifecycle.ContainerScoped)
export class ChessboardService {
	public scene = new Group();
	public material = new MeshPhysicalMaterial();
	public hintMarkerMaterial = new MeshBasicMaterial({
		transparent: true,
		opacity: 0.45
	});
	public hintMarkerGeometry = new CircleGeometry(BOARD_CELL_SIZE / 2, 20);
	public nextMovesMarker: InstancedCellMakerModel;
	public previousMovesMarker: InstancedCellMakerModel;
	public inDangerMarker: InstancedCellMakerModel;
	public hintMarker: InstancedCellMakerModel;
	public cursorCoordMarker: Mesh;

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(SettingsService) private readonly _settings: SettingsService,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(WorldService) private readonly _world: WorldService
	) {
		this.scene.name = "world-chessboard";
		this.nextMovesMarker = new InstancedCellMakerModel(
			this._chessboard.board.getInstancedCell(),
			undefined,
			this.hintMarkerGeometry,
			this.hintMarkerMaterial
		);
		this.previousMovesMarker = new InstancedCellMakerModel(
			this._chessboard.board.getInstancedCell(),
			undefined,
			this.hintMarkerGeometry,
			this.hintMarkerMaterial
		);
		this.inDangerMarker = new InstancedCellMakerModel(
			this._chessboard.board.getInstancedCell(),
			undefined,
			this.hintMarkerGeometry,
			this.hintMarkerMaterial
		);
		this.hintMarker = new InstancedCellMakerModel(
			this._chessboard.board.getInstancedCell(),
			undefined,
			this.hintMarkerGeometry,
			this.hintMarkerMaterial,
			new Color(0x79cdf8)
		);
		this.cursorCoordMarker = new Mesh(
			new PlaneGeometry(BOARD_CELL_SIZE, BOARD_CELL_SIZE),
			new MeshBasicMaterial({
				color: 0xffed68,
				transparent: true,
				opacity: 0.45,
				side: DoubleSide
			})
		);
		this.cursorCoordMarker.visible = false;
		this.cursorCoordMarker.renderOrder = 3;
		this.cursorCoordMarker.rotateX(Math.PI / 2);
		this.cursorCoordMarker.position.set(100, 100, 100);
	}

	public setInDangerMarker(coord: BoardCoord[]) {
		this.inDangerMarker = this.inDangerMarker.set(coord);
	}

	public setHintMarker(coord: BoardCoord[]) {
		this.hintMarker = this.hintMarker.set(coord);
	}

	public setNextMovesMarker(coord: BoardCoord[]) {
		this.nextMovesMarker = this.nextMovesMarker.set(coord);
	}

	public setPreviousMovesMarker(coord: BoardCoord[]) {
		this.previousMovesMarker = this.previousMovesMarker.set(coord);
	}

	public handlePieceMoved(coord: (BoardCoord & { captured?: boolean })[]) {
		this.setNextMovesMarker([]);
		this.setPreviousMovesMarker(coord);

		if (coord[coord.length - 1]?.captured)
			this.previousMovesMarker.setColorAt(
				coord.length - 1,
				new Color(0xed2e4f)
			);
	}

	public resetMaterials(): void {
		const resources = this._app.loader.getLoadedResources();
		const boardCells = this._chessboard.board.getInstancedCell();
		const settingsThemeId =
			this._settings.state.chessboard?.params?.theme?.value?.toString();
		const settingsTheme =
			SETTINGS_SUPPORTED_MATERIAL_THEMES[settingsThemeId || "default"];

		let texture: Texture | null = null;
		let roughness = 0.8;
		let metalness = 0.1;
		let sheen = 2;
		let ior = 1.5;
		let reflectivity = 0.5;
		let transmission = 0.01;
		let whiteSideColor: string = `#${COLOR_WHITE.getHexString()}`;
		let blackSideColor: string = `#${COLOR_BLACK.getHexString()}`;

		this.material.map?.dispose();

		if (settingsThemeId === "use-theme") {
			const primaryTheme =
				this._settings.state["visual-theme"]?.params[
					"primary-theme"
				]?.value?.toString();
			const secondaryTheme =
				this._settings.state["visual-theme"]?.params[
					"secondary-theme"
				]?.value?.toString();

			if (primaryTheme) whiteSideColor = primaryTheme;
			if (secondaryTheme)
				blackSideColor =
					primaryTheme === secondaryTheme
						? "#" +
							COLOR_BLACK.clone()
								.lerp(new Color(secondaryTheme), 0.25)
								.getHexString()
						: secondaryTheme;
		} else if (settingsTheme) {
			const textureImage =
				settingsTheme.values?.textureId &&
				resources[settingsTheme.values.textureId];

			if (textureImage) {
				texture = new Texture(textureImage);
				texture.colorSpace = SRGBColorSpace;
				texture.needsUpdate = true;
			}

			roughness = settingsTheme.values?.roughness ?? roughness;
			metalness = settingsTheme.values?.metalness ?? metalness;
			sheen = settingsTheme.values?.sheen ?? sheen;
			ior = settingsTheme.values?.ior ?? ior;
			reflectivity = settingsTheme.values?.reflectivity ?? reflectivity;
			transmission = settingsTheme.values?.transmission ?? transmission;
		}

		this.material.color.set(0xffffff);
		this.material.transparent = true;
		this.material.map = texture;
		this.material.roughness = roughness;
		this.material.metalness = metalness;
		this.material.sheen = sheen;
		this.material.ior = ior;
		this.material.reflectivity = reflectivity;
		this.material.transmission = transmission;

		if (
			boardCells.material instanceof Material &&
			boardCells.material.uuid !== this.material.uuid
		)
			boardCells.material.dispose();

		boardCells.material = this.material;

		if (whiteSideColor)
			boardCells.setCellSideColors(ColorSide.white, whiteSideColor);
		if (blackSideColor)
			boardCells.setCellSideColors(ColorSide.black, blackSideColor);
	}

	public resetShadows(): void {
		this._chessboard.world.getScene().traverseVisible((child) => {
			if (
				child instanceof InstancedCellModel ||
				child instanceof InstancedPieceModel
			) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
	}

	public resetScenes(): void {
		const scene = this.scene;
		const worldScene = this._world.scene;
		const chessboard = this._chessboard.world.getScene();

		scene.clear();
		scene.add(
			chessboard,
			this.nextMovesMarker,
			this.previousMovesMarker,
			this.inDangerMarker,
			this.hintMarker,
			this.cursorCoordMarker
		);
		worldScene.add(scene);
	}

	public resetMarkers(): void {
		this.setNextMovesMarker([]);
		this.setPreviousMovesMarker([]);
		this.setInDangerMarker([]);
		this.setHintMarker([]);
	}

	public resetVisual(): void {
		this.resetMaterials();
		this.resetShadows();
	}

	public reset(): void {
		this.resetVisual();
		this.resetMarkers();
		this.resetScenes();
	}
}
