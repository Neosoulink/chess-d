import { FC, useCallback, useEffect, useState } from "react";

import {
	ENGINE_WILL_REDO_TOKEN,
	ENGINE_WILL_UNDO_TOKEN,
	GAME_UPDATED_TOKEN
} from "../../../../shared/tokens";
import {
	EngineUpdatedMessageData,
	MessageData
} from "../../../../shared/types";
import { useGameStore } from "../../../_stores";
import { Button } from "../../core";
import { Icon } from "../../core/icon";
import { ColorSide } from "@chess-d/shared";

export const ActionsSectionGameControls: FC = () => {
	const { app } = useGameStore();

	const [status, setStatus] = useState<EngineUpdatedMessageData["value"]>();

	const undoMove = useCallback(() => {
		const worker: Worker | undefined = app?.module.getWorker();
		const message: MessageData = {
			token: ENGINE_WILL_UNDO_TOKEN
		};

		worker?.postMessage(message);
	}, [app?.module]);

	const redoMove = useCallback(() => {
		const worker: Worker | undefined = app?.module.getWorker();
		const message: MessageData = {
			token: ENGINE_WILL_REDO_TOKEN
		};

		worker?.postMessage(message);
	}, [app?.module]);

	useEffect(() => {
		const appModule = app?.module;
		const appWorker = appModule?.getWorker() as Worker | undefined;

		const handleMessages = (e: MessageEvent<EngineUpdatedMessageData>) => {
			const token = e.data?.token;

			if (token !== GAME_UPDATED_TOKEN || !e.data?.value) return;

			setStatus(e.data.value);
		};

		appWorker?.addEventListener("message", handleMessages);

		return () => {
			appWorker?.removeEventListener("message", handleMessages);
			setStatus(undefined);
		};
	}, [app]);

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="flex items-center gap-4 bg-black/30 p-2 rounded backdrop-blur-md">
				<Button
					type="button"
					className="pointer-events-auto"
					onClick={undoMove}
				>
					<Icon.ArrowBackward size={32} />
				</Button>

				<Button
					type="button"
					className="pointer-events-auto"
					onClick={redoMove}
				>
					<Icon.ArrowForward size={32} />
				</Button>

				<Button>
					<Icon.Hint size={32} />
				</Button>

				{status?.turn && (
					<Button
						className={`h-7 w-7 !p-0  rounded-full opacity-100 font-black text-gray-400 uppercase ${status.turn === ColorSide.white ? "text-sm bg-white" : "text-lg bg-black"}`}
					>
						{status.turn}
					</Button>
				)}

				<hr className="h-5 border-l" />

				<Button>
					<Icon.Save size={24} />
				</Button>

				<Button>
					<Icon.Export size={24} />
				</Button>

				<Button>
					<Icon.Share size={24} />
				</Button>
			</div>
		</div>
	);
};
