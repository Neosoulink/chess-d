import { FC } from "react";

import { cn } from "@/shared/utils";
import { ChatStoreItem } from "@/router/_stores/chat.store";
import { Icon } from "@/router/_components/core";

export const ChatItem: FC<ChatStoreItem & { isPlayer: boolean }> = ({
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
				<div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-primary/10 to-secondary/5" />
			)}
			<span>({isPlayer ? "You" : "Opponent"}):</span>
			{isEmote ? <Icon.HandSign size={20} /> : <Icon.Chat size={16} />}
			<span>{typeLabel} -</span>
			<span>{content}</span>
		</li>
	);
};
