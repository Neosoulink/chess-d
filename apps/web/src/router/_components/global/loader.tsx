import { FC, useEffect, useRef, useState } from "react";

import { Icon } from "../core/icon";
import { cn } from "@/shared/utils";

import { useAudioStore, useGameStore, useLoaderStore } from "../../_stores";

/** @internal */
const CHESS_LOADER_ICONS = [
	Icon.ChessKing,
	Icon.ChessQueen,
	Icon.ChessRook,
	Icon.ChessBishop,
	Icon.ChessKnight,
	Icon.ChessPawn
] as const;

/** @internal */
const ChessPiecesLoaderAnimation: FC<{ isActive: boolean }> = ({
	isActive
}) => {
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		if (!isActive) return;

		const id = window.setInterval(() => {
			setActiveIndex((i) => (i + 1) % CHESS_LOADER_ICONS.length);
		}, 2500);

		return () => clearInterval(id);
	}, [isActive]);

	return (
		<div className="relative flex size-18 shrink-0" aria-hidden>
			{CHESS_LOADER_ICONS.map((IconComponent, i) => (
				<IconComponent
					key={i}
					className={cn(
						"absolute transition-all duration-1500 ease-in-out size-full -ml-3",
						i === activeIndex
							? "z-1 opacity-100 scale-100"
							: "z-0 opacity-0 scale-[0.88]"
					)}
				/>
			))}
		</div>
	);
};

export const GlobalLoader: FC = () => {
	const { app, isResourcesLoaded } = useGameStore();
	const { isLoading, showResourcesProgress, setShowResourcesProgress } =
		useLoaderStore();

	const [resourcesLoadStatus, setResourcesLoadStatus] = useState({
		loadedCount: 0,
		toLoadCount: 0,
		progress: 0,
		currentLoad: ""
	});

	useEffect(() => {
		const sub = app?.module.loader.getLoad$().subscribe((load) => {
			setResourcesLoadStatus({
				loadedCount: load.loadedCount,
				toLoadCount: load.toLoadCount,
				progress: (load.loadedCount * 100) / load.toLoadCount,
				currentLoad: load.source.name
			});
		});

		return () => {
			sub?.unsubscribe();
		};
	}, [app]);

	useEffect(() => {
		if (!isResourcesLoaded) return;

		const id = window.setTimeout(() => {
			setShowResourcesProgress(false);
		}, 1000);

		return () => clearTimeout(id);
	}, [isResourcesLoaded, setShowResourcesProgress]);

	return (
		<div
			className={cn(
				"fixed inset-0 z-20 size-full bg-dark pointer-events-none opacity-0 transition-opacity duration-300",
				isLoading &&
					"pointer-events-auto opacity-100 transition-none duration-0"
			)}
		>
			{showResourcesProgress ? (
				<div className="absolute bottom-12 left-0 px-12 flex items-end justify-between w-full">
					<div className="flex flex-col gap-2 max-w-96 flex-1">
						<ChessPiecesLoaderAnimation isActive={true} />

						<span className="text-sm">Loading progress</span>

						<div className="bg-light/10">
							<div
								className="h-1 bg-light transition-[width] ease-in-out"
								style={{ width: `${resourcesLoadStatus.progress}%` }}
							/>
						</div>

						<span className="text-xs">
							{isResourcesLoaded
								? `Resources loaded (${resourcesLoadStatus.loadedCount}/${resourcesLoadStatus.toLoadCount})`
								: `Loading ${resourcesLoadStatus.currentLoad} (${resourcesLoadStatus.loadedCount}/${resourcesLoadStatus.toLoadCount})`}
						</span>
					</div>

					{isResourcesLoaded && (
						<span className="animate-pulse text-sm">
							Press anywhere to start
						</span>
					)}
				</div>
			) : (
				<div className="absolute bottom-12 left-0 px-12 flex items-end justify-between w-full">
					<div className="flex flex-col gap-2 max-w-96 flex-1">
						<ChessPiecesLoaderAnimation isActive={true} />
						<span className="text-sm">Loading Game</span>
					</div>
				</div>
			)}
		</div>
	);
};
