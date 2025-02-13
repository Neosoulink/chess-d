import { create } from "zustand";
import { Properties } from "@quick-threejs/utils";

export interface LoaderStore {
	isLoading: boolean;
	setIsLoading: (isLoading: boolean) => void;
}

export const loaderStoreInitialState: Properties<LoaderStore> = {
	isLoading: true
};

export const useLoaderStore = create<LoaderStore>((set, get) => ({
	...loaderStoreInitialState,
	setIsLoading: (isLoading: boolean) => set(() => ({ isLoading }))
}));
