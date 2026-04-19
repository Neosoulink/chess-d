import { FC, useEffect } from "react";
import { useLocation } from "react-router";

import { EngineUpdatedMessageData, MessageData } from "@/shared/types";
import {
	ENGINE_PIECE_SELECTED_TOKEN,
	GAME_UPDATED_TOKEN,
	PIECE_BOARD_COLLISION_TOKEN
} from "@/shared/tokens";
import {
	useGameStore,
	useMainMenuStore,
	useAudioStore,
	useSettingsStore,
	useChatStore
} from "@/router/_stores";
import { ChessboardController } from "@chess-d/chessboard/dist/core/chessboard.controller";
import { MoveFlags, ObservablePayload } from "@chess-d/shared";

export const GlobalAudios: FC = () => {
	const {
		app: gameApp,
		gameState,
		playerSide,
		isResourcesLoaded
	} = useGameStore();
	const { state: settingsState } = useSettingsStore();
	const { isOpen, currentSections } = useMainMenuStore();
	const { init, tracks, refreshInteractiveListeners, setVolumes } =
		useAudioStore();
	const { chat$ } = useChatStore();
	const { key } = useLocation();

	useEffect(() => {
		if (!gameApp || !isResourcesLoaded) return;

		init(gameApp.module.loader.getLoadedResources());
	}, [gameApp, isResourcesLoaded]);

	useEffect(() => {
		if (!gameApp || !isResourcesLoaded) return;

		const worker: Worker | undefined =
			gameApp?.module.getWorkerThread()?.worker || undefined;

		const handleMessages = (e: MessageEvent<MessageData<any>>) => {
			const { token, value } = e.data || {};
			if (token === ENGINE_PIECE_SELECTED_TOKEN) {
				const grabTrack = tracks["sfx-piece-grab"];

				grabTrack?.audio?.stop();
				grabTrack?.audio?.play();
				return;
			}

			if (token === PIECE_BOARD_COLLISION_TOKEN && value?.started) {
				const safeValue: ObservablePayload<
					ChessboardController["pieceCollidedBoard$$"]
				> = value;
				const pieceDropTrack = tracks["sfx-piece-collision"];
				const pieceDropLowTrack = tracks["sfx-piece-collision-low"];

				if (safeValue.pieceImpactSpeed > 1) {
					pieceDropTrack?.audio?.stop();
					pieceDropTrack?.audio?.play();
					return;
				}

				pieceDropLowTrack?.audio?.stop();
				pieceDropLowTrack?.audio?.play();
				return;
			}

			if (token !== GAME_UPDATED_TOKEN || !value) return;

			const safeValue: Exclude<EngineUpdatedMessageData["value"], undefined> =
				value;
			const isPlayerMove = safeValue.playerSide === safeValue.turn;
			const captureTrack = tracks["sfx-piece-capture"];
			const capturedTrack = tracks["sfx-piece-captured"];
			const castleTrack = tracks["sfx-piece-castle"];
			const enPassantTrack = tracks["sfx-piece-en-passant"];
			const gameWinTrack = tracks["sfx-game-win"];
			const gameDrawTrack = tracks["sfx-game-draw"];
			const gameFailTrack = tracks["sfx-game-fail"];

			if (safeValue.isGameOver) {
				if (safeValue.isCheckmate && !isPlayerMove) {
					gameWinTrack?.audio?.stop();
					gameWinTrack?.audio?.play();
				} else if (
					safeValue.isDraw ||
					safeValue.isDrawByFiftyMoves ||
					safeValue.isInsufficientMaterial ||
					safeValue.isStalemate ||
					safeValue.isThreefoldRepetition
				) {
					gameDrawTrack?.audio?.stop();
					gameDrawTrack?.audio?.play();
				} else {
					gameFailTrack?.audio?.stop();
					gameFailTrack?.audio?.play();
				}

				return;
			}

			if (safeValue.move?.captured) {
				if (!isPlayerMove) {
					captureTrack?.audio?.stop();
					captureTrack?.audio?.play();
				} else {
					capturedTrack?.audio?.stop();
					capturedTrack?.audio?.play();
				}
			}

			if (safeValue.inCheck || safeValue.isCheck) {
				const inCheckTrack = tracks["sfx-in-check"];
				const isCheckTrack = tracks["sfx-is-check"];

				if (isPlayerMove) {
					inCheckTrack?.audio?.stop();
					inCheckTrack?.audio?.play();
				} else {
					isCheckTrack?.audio?.stop();
					isCheckTrack?.audio?.play();
				}
			}

			if (
				safeValue.move?.promotion &&
				safeValue.turn === safeValue.playerSide
			) {
				const promotedTrack = tracks["sfx-piece-promoted"];
				promotedTrack?.audio?.stop();
				promotedTrack?.audio?.play();
			}

			if (
				safeValue.move?.flags === MoveFlags.kingside_castle ||
				safeValue.move?.flags === MoveFlags.queenside_castle
			) {
				castleTrack?.audio?.stop();
				castleTrack?.audio?.play();
			}

			if (safeValue.move?.flags === MoveFlags.en_passant) {
				enPassantTrack?.audio?.stop();
				enPassantTrack?.audio?.play();
			}
		};

		worker?.addEventListener("message", handleMessages);

		return () => worker?.removeEventListener("message", handleMessages);
	}, [gameApp, isResourcesLoaded, tracks]);

	useEffect(() => {
		const subscription = chat$.subscribe((chat) => {
			const messageTrack = tracks["sfx-chat-message"];
			messageTrack?.audio?.stop();
			messageTrack?.audio?.play();
		});

		return () => subscription.unsubscribe();
	}, [chat$, tracks]);

	useEffect(() => {
		setTimeout(() => {
			const settingsVolume = Number(
				settingsState?.audio?.params.volume?.inputProps.value ?? 100
			);
			const settingsMute =
				!settingsState?.audio?.params.mute?.inputProps.checked;

			refreshInteractiveListeners();
			setVolumes(
				isNaN(settingsVolume) ? undefined : Math.round(settingsVolume) / 100,
				settingsMute
			);
		}, 0);
	}, [
		gameApp,
		gameState,
		isResourcesLoaded,
		tracks,
		key,
		isOpen,
		currentSections,
		settingsState
	]);

	return null;
};
