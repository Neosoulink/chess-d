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
	playTrack: (trackId: string) => void;
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

	const playTrack = (trackId: string) => {
		const track = get().tracks[trackId];
		if (!track?.audio || get().isMuted) return;

		track?.audio?.stop();
		track?.audio?.play();
	};

	const playSfxUiSelect = () => {
		playTrack("sfx-ui-select");
	};

	const playSfxUiClick = () => {
		get().tracks["sfx-ui-select"]?.audio?.stop();
		playTrack("sfx-ui-click");
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
		playTrack,
		getInteractiveElements,
		createInteractiveListeners,
		removeInteractiveListeners,
		refreshInteractiveListeners
	};
});
