import { LoaderResource, LoaderSource } from "@quick-threejs/reactive";

import envMapCyanPurpleNebulaPath from "@/assets/images/environments/cyan-purple-nebula-low.png?url";
import envMapDarkBlueNebulaPath from "@/assets/images/environments/dark-blue-nebula.jpg?url";
import envMapRoadPath from "@/assets/images/environments/road.jpg?url";
import envMapPureSkyPath from "@/assets/images/environments/pure-sky.jpg?url";
import fontHelvetikerRegularPath from "@/assets/fonts/typefaces/helvetiker_regular.typeface.json?url";
import modelMasterHandPath from "@/assets/3D/master-hand.glb?url";
import modelPieceBishopPath from "@/assets/3D/pieces/bishop.glb?url";
import modelPieceKingPath from "@/assets/3D/pieces/king.glb?url";
import modelPieceKnightPath from "@/assets/3D/pieces/knight.glb?url";
import modelPiecePawnPath from "@/assets/3D/pieces/pawn.glb?url";
import modelPieceQueenPath from "@/assets/3D/pieces/queen.glb?url";
import modelPieceRookPath from "@/assets/3D/pieces/rook.glb?url";
import textureAokWoodPath from "@/assets/images/textures/aok-wood.jpg?url";

export const LOADER_SUPPORTED_ENVIRONMENT_MAPS = [
	{
		id: "env-map-world-cyan-purple-nebula-low",
		label: "Cyan Purple Nebula Low",
		sourcePath: envMapCyanPurpleNebulaPath
	},
	{
		id: "env-map-world-dark-blue-nebula",
		label: "Space Nebula",
		sourcePath: envMapDarkBlueNebulaPath
	},
	{
		id: "env-map-world-pure-sky",
		label: "Pure Sky",
		sourcePath: envMapPureSkyPath
	},
	{
		id: "env-map-world-road",
		label: "Road Sunrise",
		sourcePath: envMapRoadPath
	}
] as const;

export const LOADER_SUPPORTED_PIECES_MODELS = [
	{
		id: "model-piece-pawn",
		label: "Pawn",
		sourcePath: modelPiecePawnPath
	},
	{
		id: "model-piece-rook",
		label: "Rook",
		sourcePath: modelPieceRookPath
	},
	{
		id: "model-piece-knight",
		label: "Knight",
		sourcePath: modelPieceKnightPath
	},
	{
		id: "model-piece-bishop",
		label: "Bishop",
		sourcePath: modelPieceBishopPath
	},
	{
		id: "model-piece-queen",
		label: "Queen",
		sourcePath: modelPieceQueenPath
	},
	{
		id: "model-piece-king",
		label: "King",
		sourcePath: modelPieceKingPath
	}
] as const;

export const LOADER_SUPPORTED_TEXTURES = [
	{
		id: "texture-aok-wood",
		label: "AOK Wood",
		sourcePath: textureAokWoodPath
	}
] as const;

export const LOADER_REGISTER_DATA_SOURCES: LoaderResource[] = [
	...LOADER_SUPPORTED_ENVIRONMENT_MAPS.map((background) => ({
		name: background.id,
		path: background.sourcePath,
		type: "image",
		options: {
			imageBitmap: {
				imageOrientation: "flipY"
			}
		}
	})),
	...LOADER_SUPPORTED_TEXTURES.map((texture) => ({
		name: texture.id,
		path: texture.sourcePath,
		type: "image"
	})),
	...LOADER_SUPPORTED_PIECES_MODELS.map((piece) => ({
		name: piece.id,
		path: piece.sourcePath,
		type: "gltf"
	})),
	{
		name: "model-master-hand",
		path: modelMasterHandPath,
		type: "gltf"
	},
	{
		name: "font-helvetiker-regular",
		path: fontHelvetikerRegularPath,
		type: "font"
	}
];
