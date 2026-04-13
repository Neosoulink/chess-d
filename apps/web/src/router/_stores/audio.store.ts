import { LOADER_SUPPORTED_AUDIOS } from "@/shared/constants";
import { Properties } from "@quick-threejs/utils";
import { Audio, AudioListener } from "three";
import { create } from "zustand";

export interface AudioStore {
	tracks: Record<
		string,
		{
			audio: Audio<GainNode> | undefined;
			baseVolume?: number;
		}
	>;
	volumeMultiplier: number;
	isMuted: boolean;
	init: (resources: Record<string, any>) => void;
	setVolumes: (volumeMultiplier?: number, mute?: boolean) => void;
	getInteractiveElements: () => Element[];
	createInteractiveListeners: () => void;
	removeInteractiveListeners: () => void;
	refreshInteractiveListeners: () => void;
}

export const audioStoreInitialState: Properties<AudioStore> = {
	tracks: {},
	volumeMultiplier: 1,
	isMuted: false
};

export const useAudioStore = create<AudioStore>((set, get) => {
	const getInteractiveElements = () => {
		return [
			...document.querySelectorAll("#root button"),
			...document.querySelectorAll("#root a"),
			...document.querySelectorAll("#root input"),
			...document.querySelectorAll("#root select"),
			...document.querySelectorAll("#root textarea")
		];
	};

	const playSfxUiSelect = () => {
		const sfxSelect = get().tracks["sfx-ui-select"];

		sfxSelect?.audio?.stop();
		sfxSelect?.audio?.play();
	};

	const playSfxUiClick = () => {
		const sfxClick = get().tracks["sfx-ui-click"];
		const sfxSelect = get().tracks["sfx-ui-select"];

		sfxSelect?.audio?.stop();
		sfxClick?.audio?.stop();
		sfxClick?.audio?.play();
	};

	const playSfxUiKey = (e: KeyboardEvent) => {
		if (e.key !== "Escape") return;
		playSfxUiClick();
	};

	const createInteractiveListeners = () => {
		const sfxElement = getInteractiveElements();

		sfxElement.forEach((button) => {
			button.addEventListener("pointerenter", playSfxUiSelect);
		});
		sfxElement.forEach((button) => {
			button.addEventListener("click", playSfxUiClick);
		});
		document.addEventListener("keydown", playSfxUiKey);
	};

	const removeInteractiveListeners = () => {
		const sfxElement = getInteractiveElements();

		sfxElement.forEach((button) => {
			button.removeEventListener("pointerenter", playSfxUiSelect);
		});
		sfxElement.forEach((button) => {
			button.removeEventListener("click", playSfxUiClick);
		});
		document.removeEventListener("keydown", playSfxUiKey);
	};

	const refreshInteractiveListeners = () => {
		removeInteractiveListeners();
		createInteractiveListeners();
	};

	const init = (resources: Record<string, any>) => {
		LOADER_SUPPORTED_AUDIOS.forEach(({ id, options }) => {
			const buffer = resources[id];
			const audio = get().tracks[id];
			const currentVolumeMultiplier = get().volumeMultiplier;

			if (buffer instanceof AudioBuffer && !audio) {
				const audioListener = new AudioListener();
				const audio = new Audio(audioListener);
				const baseVolume = options?.volume ?? 1;

				audio.setBuffer(buffer);
				audio.setVolume(baseVolume * currentVolumeMultiplier);
				set((state) => ({
					tracks: {
						...state.tracks,
						[id]: {
							audio,
							baseVolume
						}
					}
				}));
			}
		});
	};

	return {
		...audioStoreInitialState,
		init,
		setVolumes: (volumeMultiplier: number = 1, mute: boolean = false) => {
			const volume = mute ? 0 : volumeMultiplier;

			set(() => ({ volume, isMuted: mute }));
			Object.values(get().tracks).forEach((track) => {
				track.audio?.setVolume((track.baseVolume ?? 1) * volume);
			});
		},
		getInteractiveElements,
		createInteractiveListeners,
		removeInteractiveListeners,
		refreshInteractiveListeners
	};
});
