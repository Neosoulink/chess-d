import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Move } from "chess.js";

import { GAME_UPDATED_TOKEN } from "../../../../shared/tokens";
import { EngineUpdatedMessageData, MoveLike } from "../../../../shared/types";
import { useGameStore } from "../../../_stores";
import { Button } from "../../core";
import { Icon } from "../../core/icon";

/** @internal */
const MoveItem: FC<{ content: string; active?: boolean }> = ({
	content,
	active
}) => (
	<li className="flex-none" id={active ? "active-move-item" : undefined}>
		<Button
			className={`text-base text-gray-50 font-bold italic shadow rounded  py-1 px-2 hover:bg-black/30 ${active ? "!opacity-100 bg-black/20" : ""}`}
		>
			{content}
		</Button>
	</li>
);

export const ActionsSectionGameHistory: FC = () => {
	const { app } = useGameStore();

	const [movesHistory, setMovesHistory] = useState<Move[]>([]);
	const [redoHistory, setRedoHistory] = useState<MoveLike[]>([]);

	const reversedRdoHistory = useMemo(
		() => redoHistory.slice().reverse(),
		[redoHistory]
	);

	const scrollableContainer = useRef<HTMLUListElement>(null);

	useEffect(() => {
		const appModule = app?.module;
		const appWorker = appModule?.getWorker() as Worker | undefined;

		const handleMessages = (e: MessageEvent<EngineUpdatedMessageData>) => {
			if (e.data?.token !== GAME_UPDATED_TOKEN || !e.data?.value) return;

			const history = e.data?.value?.history as Move[] | [];
			const redoHistory = e.data?.value?.redoHistory as Move[] | [];

			setMovesHistory(history);
			setRedoHistory(redoHistory);
		};

		appWorker?.addEventListener("message", handleMessages);

		return () => {
			appWorker?.removeEventListener("message", handleMessages);
			setMovesHistory([]);
		};
	}, [app]);

	useEffect(() => {
		const container = scrollableContainer.current;
		const item = container?.querySelector("#active-move-item") as
			| HTMLLIElement
			| undefined;

		if (!container || !item) return;

		const containerWidth = container.clientWidth;
		const itemLeft = item.offsetLeft;
		const itemWidth = item.offsetWidth;

		container.scrollTo({
			left: itemLeft - containerWidth / 2 + itemWidth / 2,
			behavior: "smooth"
		});
	}, [movesHistory, reversedRdoHistory]);

	return (
		<div className="max-w-72 flex gap-2">
			<ul
				ref={scrollableContainer}
				className="flex gap-2 w-full overflow-x-auto pointer-events-auto no-scrollbar"
			>
				{movesHistory.map((move, i) => (
					<MoveItem
						key={`${move.before}-${move.after}`}
						content={`${i + 1}. ${move.san}`}
						active={movesHistory.length - 1 === i}
					/>
				))}

				{reversedRdoHistory.map((move, i) => (
					<MoveItem
						key={`${i}-${move.san}`}
						content={`${movesHistory.length + i + 1}. ${move.san}`}
					/>
				))}

				{![...movesHistory, ...reversedRdoHistory].length && (
					<span className="text-sm text-gray-400 uppercase">
						No moves performed
					</span>
				)}
			</ul>

			<Button>
				<Icon.Popup size={20} />
			</Button>
		</div>
	);
};
