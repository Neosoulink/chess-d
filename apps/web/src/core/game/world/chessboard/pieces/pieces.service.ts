import {
	ChessboardModule,
	COLOR_BLACK,
	COLOR_WHITE,
	InstancedPieceModel,
	MatrixPieceModel
} from "@chess-d/chessboard";
import {
	ColorSide,
	DEFAULT_FEN,
	ObservablePayload,
	PieceType,
	squareToCoord
} from "@chess-d/shared";
import { Move } from "chess.js";
import { AppModule } from "@quick-threejs/reactive/worker";
import {
	Color,
	DoubleSide,
	Material,
	MeshPhysicalMaterial,
	SRGBColorSpace,
	Texture
} from "three";
import { inject, singleton } from "tsyringe";

import { SETTINGS_SUPPORTED_MATERIAL_THEMES } from "@/shared/constants";
import { SettingsService } from "@/core/game/settings/settings.service";
import { PiecesController } from "./pieces.controller";
import { WorldController } from "../../world.controller";

@singleton()
export class PiecesService {
	public material = new MeshPhysicalMaterial();

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(SettingsService) private readonly _settings: SettingsService
	) {}

	public resetPositions() {
		for (const color of [ColorSide.white, ColorSide.black]) {
			for (const pieceType of Object.values(PieceType).filter(
				(type) => type.length === 1
			)) {
				const group = this._chessboard.pieces.getGroups()[color][
					pieceType
				] as InstancedPieceModel;
				for (const piece of group.pieces || []) {
					piece.physics?.rigidBody.setBodyType(1, false);
					group.setPieceCoord(
						piece.instanceId,
						this._chessboard.board.getInstancedCell(),
						piece.coord
					);
				}
			}
		}
	}

	public resetFen(fen = DEFAULT_FEN) {
		this._chessboard.pieces.reset(fen);
	}

	public resetMaterials(): void {
		const resources = this._app.loader.getLoadedResources();
		const settingsThemeId =
			this._settings.state.pieces?.params?.theme?.value?.toString();
		const settingsTheme =
			SETTINGS_SUPPORTED_MATERIAL_THEMES[settingsThemeId || "default"];

		let texture: Texture | null = null;
		let roughness = 0.8;
		let metalness = 0.1;
		let sheen = 2;
		let ior = 1.5;
		let reflectivity = 0;
		let transmission = 0;
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

		this.material.side = DoubleSide;
		this.material.color.set(0xffffff);
		this.material.transparent = true;
		this.material.map = texture;
		this.material.roughness = roughness;
		this.material.metalness = metalness;
		this.material.sheen = sheen;
		this.material.ior = ior;
		this.material.reflectivity = reflectivity;
		this.material.transmission = transmission;

		this._chessboard.world.getScene().traverseVisible((child) => {
			if (!(child instanceof InstancedPieceModel)) return;

			if (
				child.material instanceof Material &&
				child.material.uuid !== this.material.uuid
			)
				child.material.dispose();
			this.material.color.set(
				child.piecesSide === ColorSide.white ? COLOR_WHITE : COLOR_BLACK
			);

			child.material = this.material;
			child.setPiecesColor(
				child.piecesSide === ColorSide.white ? whiteSideColor : blackSideColor
			);
		});
	}

	public reset() {
		this.resetMaterials();
		this.resetPositions();
	}

	public handleAnimatedPlayerMovedPiece(
		payload: ObservablePayload<PiecesController["animatedPlayerMovedPiece$"]>
	) {
		const { start, piece, position, move, end } = payload;

		if (start) this.resetPositions();

		this._chessboard.pieces.setPiecePosition(piece, position);

		if (end) this.handlePlayerMovedPiece(move);
	}

	public handlePlayerMovedPiece(move: Move) {
		const piece = this._chessboard.pieces.getPieceByCoord(
			move.piece as PieceType,
			move.color as ColorSide,
			squareToCoord(move.from)
		);
		if (!(piece instanceof MatrixPieceModel)) return;

		const instancedPiece = this._chessboard.pieces.getGroups()[piece.color][
			piece.type
		] as InstancedPieceModel;
		const pieceGeometry = this._chessboard.resources.getPieceGeometry(
			piece.type
		);

		const cell = this._chessboard.board
			.getInstancedCell()
			.getCellByCoord(squareToCoord(move.to))!;
		const startCoord = squareToCoord(move.from);
		const endCoord = squareToCoord(move.to);

		piece.physics?.rigidBody.setBodyType(0, true);
		piece.physics?.collider.setMass(1);

		this._chessboard.pieces.getPieceDeselected$$().next({
			piece,
			cell,
			startPosition: piece.position,
			startCoord,
			startSquare: move.from,
			endCoord,
			endSquare: move.to,
			colorSide: piece.color as ColorSide,
			instancedPiece,
			pieceGeometry
		});
	}

	public handlePiecePromoted(
		data: ObservablePayload<PiecesController["promoted$"]>
	) {
		const { piece, toPiece } = data;
		const promotedPiece = this._chessboard.pieces.getPieceByCoord(
			toPiece,
			piece.color,
			piece.coord
		);

		promotedPiece?.physics?.rigidBody.setBodyType(0, true);
		promotedPiece?.physics?.collider.setMass(1);
	}

	public handleIntroAnimation(
		progress: ObservablePayload<WorldController["introAnimation$"]>
	) {
		const piecesGroups = this._chessboard.pieces.getGroups();

		Object.values(piecesGroups).forEach((group) => {
			Object.values(group).forEach((instancedPiece) => {
				if (instancedPiece instanceof InstancedPieceModel)
					for (
						let pieceInstanceId = 0;
						pieceInstanceId < instancedPiece.count || 0;
						pieceInstanceId++
					) {
						const geometry = instancedPiece.geometry;
						const geometryHight = geometry.boundingBox?.max.y || 0;
						const piece = instancedPiece?.getPieceByInstanceId(pieceInstanceId);

						if (piece) {
							this._chessboard.pieces.setPiecePosition(piece, {
								...piece.position,
								y:
									PieceType.pawn === piece.type
										? geometryHight + 1.05 - progress
										: progress > 0.3
											? geometryHight + 1.05 - (progress - 0.3) * 1.43
											: geometryHight + 1.05
							});
						}
					}
			});
		});
	}
}
