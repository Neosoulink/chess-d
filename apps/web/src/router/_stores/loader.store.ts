import { create } from "zustand";
import { Properties } from "@quick-threejs/utils";

export interface LoaderStore {
	isLoading: boolean;
	showResourcesProgress: boolean;
	setIsLoading: (isLoading: boolean) => void;
	setShowResourcesProgress: (showResourcesProgress: boolean) => void;
}

export const loaderStoreInitialState: Properties<LoaderStore> = {
	isLoading: true,
	showResourcesProgress: true
};

export const useLoaderStore = create<LoaderStore>((set, get) => ({
	...loaderStoreInitialState,
	setIsLoading: (isLoading: boolean) => set(() => ({ isLoading })),
	setShowResourcesProgress: (showResourcesProgress: boolean) =>
		set(() => ({ showResourcesProgress }))
}));
