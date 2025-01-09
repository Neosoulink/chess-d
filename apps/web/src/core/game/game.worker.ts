import "reflect-metadata";

import { AppModule } from "@quick-threejs/reactive";
import { launchApp } from "@quick-threejs/reactive/worker";
import { isObject } from "@quick-threejs/utils";
import {
	CoreModule as ChessboardModule,
	setup as setupChessboard
} from "@chess-d/chessboard";
import { PieceType } from "@chess-d/shared";
import { Chess } from "chess.js";
import { BufferGeometry, Mesh, Object3D } from "three";
import { GLTF } from "three/examples/jsm/Addons.js";
import { container } from "tsyringe";

import { GameModule } from "./game.module";

launchApp({
	onReady: async (app) => {
		const { module: appModule } = app;
		appModule.loader.getLoadCompleted$().subscribe(async () => {
			const loadedResources = appModule.loader.getLoadedResources();
			const chessboardPieces: Partial<Record<PieceType, BufferGeometry>> = {};

			const pawnGeometry = (
				(loadedResources["pawnPiece"] as GLTF)?.scene?.children?.[0] as Mesh
			).geometry;
			if (pawnGeometry instanceof BufferGeometry)
				chessboardPieces.p = pawnGeometry;

			const rockGeometry = (
				(loadedResources["rockPiece"] as GLTF)?.scene?.children?.[0] as Mesh
			)?.geometry;
			if (rockGeometry instanceof BufferGeometry)
				chessboardPieces.r = rockGeometry;

			const knightGeometry = (
				(loadedResources["knightPiece"] as GLTF)?.scene?.children?.[0] as Mesh
			)?.geometry;
			if (knightGeometry instanceof BufferGeometry)
				chessboardPieces.n = knightGeometry;

			const bishopGeometry = (
				(loadedResources["bishopPiece"] as GLTF)?.scene?.children?.[0] as Mesh
			)?.geometry;
			if (bishopGeometry instanceof BufferGeometry)
				chessboardPieces.b = bishopGeometry;

			const queenGeometry = (
				(loadedResources["queenPiece"] as GLTF)?.scene?.children?.[0] as Mesh
			)?.geometry;
			if (queenGeometry instanceof BufferGeometry)
				chessboardPieces.q = queenGeometry;

			const kingGeometry = (
				(loadedResources["kingPiece"] as GLTF)?.scene?.children?.[0] as Mesh
			)?.geometry;
			if (kingGeometry instanceof BufferGeometry)
				chessboardPieces.k = kingGeometry;

			const { module: chessboardModule } = await setupChessboard(
				appModule,
				undefined,
				chessboardPieces
			);

			const chessboardWrapper = loadedResources["chessboardWrapper"] as GLTF;
			if (chessboardWrapper?.scene instanceof Object3D) {
				chessboardWrapper.scene.scale.set(10, 10, 10);
				appModule.world.scene().add(chessboardWrapper.scene);
			}

			if (!isObject(app))
				throw new Error("Unable to retrieve the application context.");

			container.register(Chess, { useValue: new Chess() });
			container.register(AppModule, { useValue: appModule });
			container.register(ChessboardModule, { useValue: chessboardModule });

			const game = container.resolve<GameModule>(GameModule);
			game.init();
		});
	}
});
