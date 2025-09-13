import "reflect-metadata";

import {
	ChessboardModule,
	setup as setupChessboard
} from "@chess-d/chessboard";
import { PieceType } from "@chess-d/shared";
import { AppModule } from "@quick-threejs/reactive/worker";
import { launchApp } from "@quick-threejs/reactive/worker";
import { isObject } from "@quick-threejs/utils";
import { Chess } from "chess.js";
import { BufferGeometry, Camera, Mesh } from "three";
import { GLTF } from "three/examples/jsm/Addons.js";
import { container } from "tsyringe";

import { GameModule } from "./game.module";

launchApp({
	onReady: async (app) => {
		const { module: appModule } = app;

		if (!isObject(app))
			throw new Error("Unable to retrieve the application context.");

		const { module: chessboardModule } = await setupChessboard({
			camera: appModule.camera.instance() as Camera,
			observables: {
				mousedown$: appModule.mousedown$?.(),
				mouseup$: appModule.mouseup$?.()
			},
			enableDebug: appModule.debug.enabled()
		});

		container.register(Chess, { useValue: new Chess() });
		container.register(AppModule, { useValue: appModule });
		container.register(ChessboardModule, { useValue: chessboardModule });

		const game = container.resolve<GameModule>(GameModule);

		appModule.loader.getLoadCompleted$().subscribe(async (payload) => {
			const loadedResources = payload.loadedResources;

			const pawnGeometry = (
				(loadedResources["pawnPiece"] as GLTF)?.scene?.children?.[0] as Mesh
			).geometry;
			if (pawnGeometry instanceof BufferGeometry)
				chessboardModule.resources.setPieceGeometry(
					PieceType.pawn,
					pawnGeometry
				);

			const rookGeometry = (
				(loadedResources["rookPiece"] as GLTF)?.scene?.children?.[0] as Mesh
			)?.geometry;
			if (rookGeometry instanceof BufferGeometry)
				chessboardModule.resources.setPieceGeometry(
					PieceType.rook,
					rookGeometry
				);

			const knightGeometry = (
				(loadedResources["knightPiece"] as GLTF)?.scene?.children?.[0] as Mesh
			)?.geometry;
			if (knightGeometry instanceof BufferGeometry)
				chessboardModule.resources.setPieceGeometry(
					PieceType.knight,
					knightGeometry
				);

			const bishopGeometry = (
				(loadedResources["bishopPiece"] as GLTF)?.scene?.children?.[0] as Mesh
			)?.geometry;
			if (bishopGeometry instanceof BufferGeometry)
				chessboardModule.resources.setPieceGeometry(
					PieceType.bishop,
					bishopGeometry
				);

			const queenGeometry = (
				(loadedResources["queenPiece"] as GLTF)?.scene?.children?.[0] as Mesh
			)?.geometry;
			if (queenGeometry instanceof BufferGeometry)
				chessboardModule.resources.setPieceGeometry(
					PieceType.queen,
					queenGeometry
				);

			const kingGeometry = (
				(loadedResources["kingPiece"] as GLTF)?.scene?.children?.[0] as Mesh
			)?.geometry;
			if (kingGeometry instanceof BufferGeometry)
				chessboardModule.resources.setPieceGeometry(
					PieceType.king,
					kingGeometry
				);

			chessboardModule.pieces.reset();
			game.init();
		});
	}
});
