import { LoaderResource } from "@quick-threejs/reactive";

import audioSfxChatMessagePath from "@/assets/audios/sfx-chat-message.mp3?url";
import audioSfxGameDrawPath from "@/assets/audios/sfx-game-draw.mp3?url";
import audioSfxGameFailPath from "@/assets/audios/sfx-game-fail.mp3?url";
import audioSfxGameStartPath from "@/assets/audios/sfx-game-start.mp3?url";
import audioSfxGameWinPath from "@/assets/audios/sfx-game-win.mp3?url";
import audioSfxInCheckPath from "@/assets/audios/sfx-in-check.mp3?url";
import audioSfxIsCheckPath from "@/assets/audios/sfx-is-check.mp3?url";
import audioSfxPieceCapturedPath from "@/assets/audios/sfx-piece-captured.mp3?url";
import audioSfxPieceCapturePath from "@/assets/audios/sfx-piece-capture.mp3?url";
import audioSfxPieceCollisionPath from "@/assets/audios/sfx-piece-collision.mp3?url";
import audioSfxPieceGrabPath from "@/assets/audios/sfx-piece-grab.mp3?url";
import audioSfxUiClickPath from "@/assets/audios/sfx-ui-click.mp3?url";
import audioSfxUiSelectPath from "@/assets/audios/sfx-ui-select.mp3?url";
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

export const LOADER_SUPPORTED_AUDIOS: {
	id: string;
	label: string;
	sourcePath: string;
	options?: {
		volume?: number;
	};
}[] = [
	{
		id: "sfx-ui-select",
		label: "Select",
		sourcePath: audioSfxUiSelectPath,
		options: { volume: 0.2 }
	},
	{
		id: "sfx-ui-click",
		label: "UI Click",
		sourcePath: audioSfxUiClickPath,
		options: { volume: 0.8 }
	},
	{
		id: "sfx-game-fail",
		label: "Game Fail",
		sourcePath: audioSfxGameFailPath,
		options: { volume: 0.4 }
	},
	{
		id: "sfx-game-start",
		label: "Game Start",
		sourcePath: audioSfxGameStartPath
	},
	{
		id: "sfx-game-win",
		label: "Game Win",
		sourcePath: audioSfxGameWinPath,
		options: { volume: 0.7 }
	},
	{
		id: "sfx-game-draw",
		label: "Game Draw",
		sourcePath: audioSfxGameDrawPath
	},
	{
		id: "sfx-chat-message",
		label: "Chat Message",
		sourcePath: audioSfxChatMessagePath
	},
	{
		id: "sfx-in-check",
		label: "In Check",
		sourcePath: audioSfxInCheckPath,
		options: { volume: 0.7 }
	},
	{
		id: "sfx-is-check",
		label: "Is Check",
		sourcePath: audioSfxIsCheckPath
	},
	{
		id: "sfx-piece-grab",
		label: "PieceGrab",
		sourcePath: audioSfxPieceGrabPath,
		options: { volume: 0.3 }
	},
	{
		id: "sfx-piece-collision",
		label: "Piece Collision",
		sourcePath: audioSfxPieceCollisionPath,
		options: { volume: 0.5 }
	},
	{
		id: "sfx-piece-collision-low",
		label: "Piece Collision Low",
		sourcePath: audioSfxPieceCollisionPath,
		options: { volume: 0.3 }
	},
	{
		id: "sfx-piece-capture",
		label: "Piece Capture",
		sourcePath: audioSfxPieceCapturePath,
		options: { volume: 0.7 }
	},
	{
		id: "sfx-piece-captured",
		label: "Piece Captured",
		sourcePath: audioSfxPieceCapturedPath,
		options: { volume: 0.8 }
	}
];

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
	...LOADER_SUPPORTED_AUDIOS.map(({ id, sourcePath }) => ({
		name: id,
		path: sourcePath,
		type: "audio"
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
