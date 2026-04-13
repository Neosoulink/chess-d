import { Chessboard2 } from "@chrisoakman/chessboard2/dist/chessboard2.min.js";
import { validateFen } from "chess.js";
import { FC, useEffect, useRef, useState } from "react";

import { GAME_UPDATED_TOKEN } from "@/shared/tokens";
import { EngineUpdatedMessageData } from "@/shared/types";
import { useAudioStore, useGameStore } from "@/router/_stores";
import { Button, Icon } from "@/router/_components/core";
import { cn } from "@/shared/utils";

export const GameOverviewMap: FC = () => {
	const { app } = useGameStore();
	const { refreshInteractiveListeners } = useAudioStore();

	const [showMap, setShowMap] = useState(false);
	const [currentFen, setCurrentFen] = useState<string>("");

	const mapWrapperRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<Chessboard2>(null);

	useEffect(() => {
		const appModule = app?.module;
		const appWorker = appModule?.getWorkerThread()?.worker as
			| Worker
			| undefined;

		const handleMessages = (e: MessageEvent<EngineUpdatedMessageData>) => {
			const fen = e.data?.value?.fen || "";

			if (e.data?.token === GAME_UPDATED_TOKEN && validateFen(fen).ok)
				setCurrentFen(fen);
		};

		appWorker?.addEventListener("message", handleMessages);

		return () => {
			appWorker?.removeEventListener("message", handleMessages);
		};
	}, [app]);

	useEffect(() => {
		if (!showMap) return;

		const mapParentElement = mapWrapperRef.current;
		const mapElement = document.createElement("div");

		let mapBoard: Chessboard2 | undefined;

		mapParentElement?.appendChild(mapElement);

		if (mapParentElement) {
			mapBoard = Chessboard2(mapElement, {
				draggable: false
			});
			mapRef.current = mapBoard;
			mapBoard.position(currentFen, true);
		}

		return () => {
			mapBoard?.destroy();
			mapElement.remove();
		};
	}, [app, showMap]);

	useEffect(() => {
		if (!showMap) return;

		mapRef.current?.position(currentFen, true);
	}, [currentFen, showMap]);

	useEffect(() => {
		refreshInteractiveListeners();
	}, [showMap]);

	return (
		<div className="relative group flex flex-col items-end gap-1">
			<Button
				className={cn(
					"size-8 p-0 bg-dark/80 opacity-0 group-hover:opacity-30 hover:bg-dark hover:opacity-100",
					!showMap && "opacity-100"
				)}
				onClick={() => setShowMap(!showMap)}
			>
				{showMap ? <Icon.Cross size={14} /> : <Icon.Chessboard size={16} />}
			</Button>

			{showMap && (
				<div ref={mapWrapperRef} className="size-30 pointer-events-auto" />
			)}
		</div>
	);
};
