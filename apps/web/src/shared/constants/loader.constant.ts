import { LoaderSource } from "@quick-threejs/reactive";

import bishopPiece from "@/assets/3D/pieces/bishop.glb?url";
import helvetikerFont from "@/assets/fonts/typefaces/helvetiker_regular.typeface.json?url";
import kingPiece from "@/assets/3D/pieces/king.glb?url";
import knightPiece from "@/assets/3D/pieces/knight.glb?url";
import masterHand from "@/assets/3D/master-hand.glb?url";
import pawnPiece from "@/assets/3D/pieces/pawn.glb?url";
import queenPiece from "@/assets/3D/pieces/queen.glb?url";
import rookPiece from "@/assets/3D/pieces/rook.glb?url";

import { WORLD_MAP_SUPPORTED_BACKGROUNDS } from "./world-map.constant";

export const LOADER_REGISTER_DATA_SOURCES: LoaderSource[] = [
	...WORLD_MAP_SUPPORTED_BACKGROUNDS.map(
		(background) =>
			({
				name: background.id,
				path: background.sourcePath,
				type: "image",
				options: {
					imageBitmap: {
						imageOrientation: "flipY"
					}
				}
			}) satisfies LoaderSource
	),
	{
		name: "pawnPiece",
		path: pawnPiece,
		type: "gltf"
	},
	{
		name: "rookPiece",
		path: rookPiece,
		type: "gltf"
	},
	{
		name: "knightPiece",
		path: knightPiece,
		type: "gltf"
	},
	{
		name: "bishopPiece",
		path: bishopPiece,
		type: "gltf"
	},
	{
		name: "queenPiece",
		path: queenPiece,
		type: "gltf"
	},
	{
		name: "kingPiece",
		path: kingPiece,
		type: "gltf"
	},
	{
		name: "masterHand",
		path: masterHand,
		type: "gltf"
	},
	{
		name: "helvetikerFont",
		path: helvetikerFont,
		type: "font"
	}
];
