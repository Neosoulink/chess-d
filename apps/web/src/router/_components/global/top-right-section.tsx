import { ComponentPropsWithRef, useCallback, useEffect, useMemo } from "react";

import { Button, Icon } from "@/router/_components/core";
import { useMainMenuStore, useSettingsStore } from "@/router/_stores";
import { MAIN_MENU_SECTIONS } from "@/shared/constants";
import { cn } from "@/shared/utils";

/** @internal */
const CustomButton = ({
	className,
	...props
}: ComponentPropsWithRef<typeof Button>) => {
	return (
		<Button
			className={cn(
				"size-9",
				"bg-radial from-deep-space/20 to-primary/20 text-primary",
				"border-primary/80 border",
				"shadow-[inset_0_0_5px_var(--color-primary),0_0_0px_var(--color-primary)] hover:shadow-[inset_0_0_10px_var(--color-primary),0_0_3px_var(--color-primary)]",
				className
			)}
			{...props}
		/>
	);
};

export const GlobalTopRightSection = () => {
	const {
		isOpen: isMainMenuOpen,
		setSections: setMainMenuSections,
		toggleOpen: toggleMainMenuOpen,
		setOpen: setMainMenuOpen
	} = useMainMenuStore();
	const { state, applyState } = useSettingsStore();

	const isVolumeMuted = useMemo(
		() => !state.audio?.params.mute?.inputProps.checked,
		[state.audio]
	);

	const handleToggleOpen = useCallback(() => {
		if (!isMainMenuOpen) setMainMenuSections(MAIN_MENU_SECTIONS.main);
		toggleMainMenuOpen();
	}, [isMainMenuOpen, setMainMenuSections, toggleMainMenuOpen]);

	const handleEscPress = useCallback(
		(event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			handleToggleOpen();
		},
		[handleToggleOpen]
	);

	const toggleVolumeMute = useCallback(() => {
		const audioState = state.audio;

		if (!audioState?.params?.mute) return;

		applyState({
			audio: {
				...audioState,
				params: {
					...audioState.params,
					mute: {
						...audioState.params.mute,
						inputProps: {
							...audioState.params.mute.inputProps,
							checked: isVolumeMuted
						}
					}
				}
			}
		});
	}, [state.audio, applyState, isVolumeMuted]);

	const handleOpenCredits = useCallback(() => {
		setMainMenuOpen(true);
		setMainMenuSections(MAIN_MENU_SECTIONS.credits);
	}, [setMainMenuSections]);

	useEffect(() => {
		document.addEventListener("keydown", handleEscPress);
		return () => document.removeEventListener("keydown", handleEscPress);
	}, [handleEscPress]);

	return (
		<div className="fixed top-12 right-6 z-60 flex flex-col items-end gap-2 pointer-events-none">
			<div className="flex items-center justify-end gap-2">
				<CustomButton
					asLink
					target="_blank"
					to="https://github.com/Neosoulink/chess-d/issues/new"
				>
					<Icon.Support size={18} />
				</CustomButton>

				<CustomButton onClick={handleOpenCredits}>
					<Icon.Info size={24} />
				</CustomButton>

				<CustomButton onClick={handleToggleOpen}>
					{(() => {
						const OpenIcon = isMainMenuOpen ? Icon.Cross : Icon.Menu;
						return <OpenIcon size={isMainMenuOpen ? 16 : 17} />;
					})()}
				</CustomButton>
			</div>

			<CustomButton onClick={toggleVolumeMute}>
				{isVolumeMuted ? (
					<Icon.VolumeOff size={18} />
				) : (
					<Icon.VolumeOn size={18} />
				)}
			</CustomButton>
		</div>
	);
};
