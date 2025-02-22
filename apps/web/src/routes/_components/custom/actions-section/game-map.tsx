import { Chessboard2 } from "@chrisoakman/chessboard2/dist/chessboard2.min.js";
import { validateFen } from "chess.js";
import { FC, useEffect, useRef } from "react";

import { useGameStore } from "../../../_stores";
import { GAME_UPDATED_TOKEN } from "../../../../shared/tokens";
import { EngineUpdatedMessageData } from "../../../../shared/types";

export const ActionsSectionGameMap: FC = () => {
	const { app } = useGameStore();

	const mapWrapperRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<Chessboard2>(null);

	useEffect(() => {
		const appModule = app?.module;
		const appWorker = appModule?.getWorker() as Worker | undefined;

		const handleMessages = (e: MessageEvent<EngineUpdatedMessageData>) => {
			if (
				e.data?.token === GAME_UPDATED_TOKEN &&
				validateFen(e.data?.value?.fen || "").ok
			)
				mapRef.current?.position(e.data!.value!.fen, true);
		};

		appWorker?.addEventListener("message", handleMessages);

		return () => {
			appWorker?.removeEventListener("message", handleMessages);
		};
	}, [app]);

	useEffect(() => {
		const mapParentElement = mapWrapperRef.current;
		const mapElement = document.createElement("div");

		let mapBoard: Chessboard2 | undefined;

		mapParentElement?.appendChild(mapElement);

		if (mapParentElement) {
			mapBoard = Chessboard2(mapElement, {
				draggable: false
			});
			mapRef.current = mapBoard;
		}

		return () => {
			mapBoard?.destroy();
			mapElement.remove();
		};
	}, [app]);

	return (
		<div className="flex-1 flex justify-end">
			<div
				ref={mapWrapperRef}
				className="h-56 w-56 pointer-events-auto transition-opacity opacity-30 hover:opacity-100"
			/>
		</div>
	);
};
