import { ColorSide } from "@chess-d/shared";
import {
	ComponentPropsWithRef,
	FC,
	useCallback,
	useEffect,
	useMemo,
	useState
} from "react";

import {
	ENGINE_WILL_REDO_TOKEN,
	ENGINE_WILL_UNDO_TOKEN,
	GAME_UPDATED_TOKEN
} from "@/shared/tokens";
import { cn } from "@/shared/utils";
import { EngineUpdatedMessageData, MessageData } from "@/shared/types";
import { useGameStore, useMainMenuStore } from "@/router/_stores";
import { Button, Icon } from "@/router/_components/core";
import { MAIN_MENU_SECTIONS } from "@/shared/constants";

/** @internal */
const ControlButton: FC<ComponentPropsWithRef<typeof Button>> = ({
	children,
	className,
	type = "button",
	...props
}) => {
	return (
		<Button
			{...{
				...props,
				type,
				className: cn("size-8 bg-dark/80 hover:bg-dark", className)
			}}
		>
			{children}
		</Button>
	);
};

export const GameOverviewControls: FC = () => {
	const { app } = useGameStore();
	const { setOpen, setSections } = useMainMenuStore();

	const undoMove = useCallback(() => {
		const worker: Worker | undefined = app?.module.getWorkerThread()?.worker as
			| Worker
			| undefined;
		const message: MessageData = {
			token: ENGINE_WILL_UNDO_TOKEN
		};

		worker?.postMessage(message);
	}, [app?.module]);

	const redoMove = useCallback(() => {
		const worker: Worker | undefined = app?.module.getWorkerThread()?.worker as
			| Worker
			| undefined;
		const message: MessageData = {
			token: ENGINE_WILL_REDO_TOKEN
		};

		worker?.postMessage(message);
	}, [app?.module]);

	const openSaveMenu = useCallback(() => {
		setOpen(true);
		setSections(MAIN_MENU_SECTIONS.saveGame);
	}, [setOpen, setSections]);

	useEffect(() => {
		const appModule = app?.module;
		const appWorker = appModule?.getWorkerThread()?.worker as
			| Worker
			| undefined;

		const handleMessages = (e: MessageEvent<EngineUpdatedMessageData>) => {
			const token = e.data?.token;

			if (token !== GAME_UPDATED_TOKEN || !e.data?.value) return;
		};

		appWorker?.addEventListener("message", handleMessages);

		return () => {
			appWorker?.removeEventListener("message", handleMessages);
		};
	}, [app]);

	return (
		<div className="flex gap-1 items-center justify-center">
			<ControlButton onClick={undoMove}>
				<Icon.ActionUndo />
			</ControlButton>

			<ControlButton onClick={redoMove}>
				<Icon.ActionRedo />
			</ControlButton>

			<ControlButton>
				<Icon.Hint />
			</ControlButton>

			<ControlButton onClick={openSaveMenu}>
				<Icon.Save />
			</ControlButton>
		</div>
	);
};
