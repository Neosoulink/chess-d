import "reflect-metadata";

import { AppModule } from "@quick-threejs/reactive";
import { launchApp } from "@quick-threejs/reactive/worker";
import { isObject } from "@quick-threejs/utils";
import {
	ChessboardModule,
	setup as setupChessboard
} from "@chess-d/chessboard";
import { PieceType } from "@chess-d/shared";
import { Chess } from "chess.js";
import { BufferGeometry, Camera, Mesh } from "three";
import { GLTF } from "three/examples/jsm/Addons.js";
import { container } from "tsyringe";

import { GameModule } from "./game.module";

launchApp({
	onReady: async (app) => {
		const { module: appModule } = app;

		appModule.loader.getLoadCompleted$().subscribe(async (payload) => {
			const loadedResources = payload.loadedResources;
			const chessboardPieces: Partial<Record<PieceType, BufferGeometry>> = {};

			const pawnGeometry = (
				(loadedResources["pawnPiece"] as GLTF)?.scene?.children?.[0] as Mesh
			).geometry;
			if (pawnGeometry instanceof BufferGeometry)
				chessboardPieces.p = pawnGeometry;

			const rookGeometry = (
				(loadedResources["rookPiece"] as GLTF)?.scene?.children?.[0] as Mesh
			)?.geometry;
			if (rookGeometry instanceof BufferGeometry)
				chessboardPieces.r = rookGeometry;

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

			const { module: chessboardModule } = await setupChessboard({
				camera: appModule.camera.instance() as Camera,
				piecesGeometries: chessboardPieces,
				observables: {
					mousedown$: appModule.mousedown$?.(),
					mouseup$: appModule.mouseup$?.()
				},
				enableDebug: appModule.debug.enabled()
			});

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
