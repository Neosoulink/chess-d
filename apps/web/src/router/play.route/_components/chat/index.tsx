import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router";

import { HAND_WILL_EMOTE_TOKEN } from "@/shared/tokens";
import { MessageData } from "@/shared/types";
import { ObservablePayload } from "@chess-d/shared";
import { HandsController } from "@/core/game/world/hands/hands.controller";
import { Icon } from "@/router/_components/core";
import { PopoverButton } from "@/router/_components/custom";
import { useChatStore } from "@/router/_stores/chat.store";
import { useGameStore, useSettingsStore } from "@/router/_stores";
import { HANDS_SUPPORT_EMOTES } from "@/shared/constants";
import { ChatEmotesOptions } from "./_components/emotes-options";
import { ChatMessagesOptions } from "./_components/messages-options";
import { ChatItem } from "./_components/item";

const msgData = [
	{
		content: "Nice move!",
		description: "Nice move!"
	},
	{
		content: "Let me think...",
		description: "Let me think..."
	}
];

export const PlayChat = () => {
	const { chats, notify, reset } = useChatStore();
	const { gameState, app } = useGameStore();
	const { state: settingsState } = useSettingsStore();
	const { key } = useLocation();

	const playerSide = useMemo(
		() => gameState?.playerSide,
		[gameState?.playerSide]
	);

	const isHandsVisible = useMemo(
		() => !!settingsState.hands?.params?.visible?.inputProps?.checked,
		[settingsState.hands?.params?.visible?.inputProps?.checked]
	);

	const chatListRef = useRef<HTMLUListElement>(null);

	const handleEmoteAction = useCallback(
		(payload: (typeof HANDS_SUPPORT_EMOTES)[number]) => {
			if (!isHandsVisible) return;

			const worker = app?.module.getWorkerThread()?.worker;

			if (!worker || !playerSide) return;

			worker.postMessage({
				token: HAND_WILL_EMOTE_TOKEN,
				value: {
					duration: 3,
					emote: payload,
					side: playerSide
				}
			} satisfies MessageData<ObservablePayload<HandsController["emote$$"]>>);
		},
		[app?.module, isHandsVisible, playerSide]
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
				className="max-h-20 overflow-y-auto no-scrollbar mask-t-from-70% mask-t-to-transparent text-xs"
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
				{isHandsVisible && (
					<PopoverButton
						popoverProps={{
							className: "gap-2",
							children: (
								<ChatEmotesOptions
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
				)}

				<PopoverButton
					popoverProps={{
						className: "gap-2",
						children: (
							<ChatMessagesOptions
								data={msgData.map(({ content, description }) => ({
									content,
									description,
									action: () =>
										playerSide &&
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
