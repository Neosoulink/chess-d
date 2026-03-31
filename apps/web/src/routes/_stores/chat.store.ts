import { ColorSide } from "@chess-d/shared";
import { Properties } from "@quick-threejs/utils";
import { useEffect } from "react";
import { Observable, Subject } from "rxjs";
import { create } from "zustand";

export interface ChatStoreChat {
	content: string;
	side: ColorSide;
	timestamp: number;
	type: "message" | "emote";
	description?: string;
}

export interface ChatStore {
	chats: ChatStoreChat[];
	chat$: Observable<ChatStoreChat>;
	notify: (chat: Omit<ChatStoreChat, "timestamp">) => void;
	reset: () => void;
}

export const chatStoreInitialState: Omit<Properties<ChatStore>, "chat$"> = {
	chats: []
};

export const useChatStore = create<ChatStore>((set, get) => {
	const chat$$ = new Subject<ChatStoreChat>();
	const chat$ = chat$$.asObservable();

	chat$.subscribe((chat) => {
		set((state) => ({ chats: [...state.chats, chat] }));
	});

	const notify: ChatStore["notify"] = (chat) => {
		const payload = { ...chat, timestamp: Date.now() };
		chat$$.next(payload);
	};

	const reset: ChatStore["reset"] = () => {
		set(() => chatStoreInitialState);
	};

	return {
		...chatStoreInitialState,
		chat$,
		notify,
		reset
	};
});
