import { FC, PointerEvent, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router";

import { cn } from "@/shared/utils";
import { HAND_WILL_EMOTE_TOKEN } from "@/shared/tokens";
import { MessageData } from "@/shared/types";
import { ObservablePayload } from "@chess-d/shared";
import { HandsController } from "@/core/game/world/hands/hands.controller";
import { Button, Icon } from "@/routes/_components/core";
import { PopoverButton } from "@/routes/_components/custom";
import { ChatStoreChat, useChatStore } from "@/routes/_stores/chat.store";
import { useGameStore } from "@/routes/_stores";
import { HANDS_SUPPORT_EMOTES } from "@/shared/constants";

/** @internal */
const EmotesOptions: FC<{
	data: {
		name: string;
		description?: string;
		action: () => void;
	}[];
}> = ({ data }) => {
	const handleClick = (
		e: PointerEvent<HTMLButtonElement>,
		action: () => void
	) => {
		action();
	};

	return data.map(({ name, description, action }, index) => (
		<Button
			key={`${name}-${index}`}
			title={description}
			onPointerDown={(e) => handleClick(e, action)}
			className="size-8"
		>
			{name}
		</Button>
	));
};

/** @internal */
const MsgOptions: FC<{
	data: {
		content: string;
		description?: string;
		action: () => void;
	}[];
}> = ({ data }) => {
	const handleClick = (
		e: PointerEvent<HTMLButtonElement>,
		action: () => void
	) => {
		action();
	};

	return data.map(({ content, description, action }, index) => (
		<Button
			key={`${content}-${index}`}
			title={description}
			onPointerDown={(e) => handleClick(e, action)}
			className="h-8"
		>
			{content}
		</Button>
	));
};

const ChatItem: FC<ChatStoreChat & { isPlayer: boolean }> = ({
	content,
	type,
	isPlayer
}) => {
	const isEmote = type === "emote";
	const typeLabel = isEmote ? "Emote" : "Said";

	return (
		<li
			className={cn(
				"relative flex items-center gap-1 h-7 w-fit bg-linear-to-r from-dark/80 to-dark/5 px-2 py-0.5"
			)}
		>
			{isEmote && (
				<div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-neon-cyan/10 to-neon-purple/5" />
			)}
			<span>({isPlayer ? "You" : "Opponent"}):</span>
			{isEmote && <Icon.HandSign size={20} />}
			<span>{typeLabel} -</span>
			<span>{content}</span>
		</li>
	);
};

const emotesData = [
	{
		content: "👍",
		description: "Good job!"
	},
	{
		content: "👎",
		description: "Bad!"
	},
	{
		content: "👉",
		description: "Finger gun!"
	}
];
const msgData = [
	{
		content: "Nice move!",
		description: "Nice move!"
	},
	{
		content: "Interesting move!",
		description: "Interesting move!"
	}
];

export const PlayChat = () => {
	const { chats, notify, reset } = useChatStore();
	const { playerSide, app } = useGameStore();
	const { key } = useLocation();

	const chatListRef = useRef<HTMLUListElement>(null);

	const handleEmoteAction = useCallback(
		(payload: (typeof HANDS_SUPPORT_EMOTES)[number]) => {
			const worker = app?.module.getWorkerThread()?.worker;
			if (!worker) return;

			worker.postMessage({
				token: HAND_WILL_EMOTE_TOKEN,
				value: {
					duration: 3,
					emote: payload,
					side: playerSide
				}
			} as MessageData<ObservablePayload<HandsController["emote$$"]>>);
		},
		[app?.module, playerSide]
	);

	useEffect(() => {
		const chatList = chatListRef.current;
		if (!chatList) return;
		chatList.scrollTo({ top: chatList.scrollHeight, behavior: "smooth" });
	}, [chats]);

	useEffect(() => {
		reset();
	}, [key]);

	return (
		<section className="flex flex-col gap-2 h-fit z-10 absolute bottom-6 left-6 pointer-events-none select-none">
			<ul
				ref={chatListRef}
				className="h-24 overflow-y-hidden no-scrollbar mask-t-from-70% mask-t-to-transparent text-xs text-light/50 flex flex-col justify-end"
			>
				<div className="flex flex-col gap-1">
					{chats.map(({ timestamp, side, description, ...chat }, index) => (
						<ChatItem
							key={`${timestamp}-${index}`}
							{...{ ...chat, timestamp, side }}
							isPlayer={side === playerSide}
							description={description}
						/>
					))}
				</div>
			</ul>

			<div className="flex items-center gap-2">
				<PopoverButton
					popoverProps={{
						className: "gap-2",
						children: (
							<EmotesOptions
								data={HANDS_SUPPORT_EMOTES.map((emote) => ({
									name: emote.emoji,
									action: () => handleEmoteAction(emote)
								}))}
							/>
						)
					}}
					className="bg-dark/80 hover:bg-dark"
				>
					<Icon.HandSign size={24} />
				</PopoverButton>

				<PopoverButton
					popoverProps={{
						className: "gap-2",
						children: (
							<MsgOptions
								data={msgData.map(({ content, description }) => ({
									content,
									description,
									action: () =>
										notify({
											content,
											side: playerSide,
											type: "message"
										})
								}))}
							/>
						)
					}}
					className="bg-dark/80 hover:bg-dark"
				>
					<Icon.Chat size={24} />
				</PopoverButton>
			</div>
		</section>
	);
};
