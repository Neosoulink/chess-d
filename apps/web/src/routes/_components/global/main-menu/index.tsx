import { gsap } from "gsap";
import {
	ComponentPropsWithRef,
	useCallback,
	useEffect,
	useMemo,
	useRef
} from "react";
import { useLocation } from "react-router";

import { cn } from "@/shared/utils";
import { useMainMenuStore } from "@/routes/_stores";
import { MAIN_MENU_SECTIONS } from "@/shared/constants";
import { Button, Modal, Icon } from "../../core";
import { MainMenuMainSection } from "./_sections/main";
import { MainMenuNewGameSection } from "./_sections/new-game";
import { MainMenuSaveLoadSection } from "./_sections/save-load";
import { MainMenuSettingsSection } from "./_sections/settings";

export interface MainMenuComponentProps
	extends ComponentPropsWithRef<typeof Modal> {}

const SUPPORTED_MAIN_MENU_SECTIONS = [
	{
		name: MAIN_MENU_SECTIONS.main,
		component: MainMenuMainSection
	},
	{
		name: MAIN_MENU_SECTIONS.newGame,
		component: MainMenuNewGameSection
	},
	{
		name: MAIN_MENU_SECTIONS.saveGame,
		component: MainMenuSaveLoadSection
	},
	{
		name: MAIN_MENU_SECTIONS.loadGame,
		component: MainMenuSaveLoadSection
	},
	{
		name: MAIN_MENU_SECTIONS.settings,
		component: MainMenuSettingsSection
	}
] as const;

export const MainMenuComponent = (props: MainMenuComponentProps) => {
	const location = useLocation();

	const { isOpen, currentSections, setSections, toggleOpen, setOpen } =
		useMainMenuStore();

	const sectionRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
	const prevSectionNameRef = useRef<string | null>(null);
	const isInitialMount = useRef(true);

	const currentSectionName = useMemo(() => {
		const [_currentSection] = currentSections || [];
		return _currentSection || MAIN_MENU_SECTIONS.main;
	}, [currentSections]);

	const handleToggleOpen = useCallback(() => {
		if (!isOpen) setSections(MAIN_MENU_SECTIONS.main);
		toggleOpen();
	}, [isOpen, setSections, toggleOpen]);

	const handleEscPress = useCallback(
		(event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			handleToggleOpen();
		},
		[handleToggleOpen]
	);

	useEffect(() => setOpen(false), [setOpen, location]);

	useEffect(() => {
		document.addEventListener("keydown", handleEscPress);
		return () => document.removeEventListener("keydown", handleEscPress);
	}, [handleEscPress]);

	useEffect(() => {
		if (!isOpen) return;

		const toMainSection = currentSectionName === MAIN_MENU_SECTIONS.main;
		const prevName = prevSectionNameRef.current;
		const currName = currentSectionName;

		const prevEl = prevName ? sectionRefs.current.get(prevName) : null;
		const currEl = currName ? sectionRefs.current.get(currName) || null : null;
		const prevElExists = prevEl && prevName !== currName;

		if (prevEl === currEl && prevName !== currName) {
			prevSectionNameRef.current = currName;
			return;
		}

		if (isInitialMount.current) {
			isInitialMount.current = false;
			if (currEl) {
				gsap.set(currEl, { opacity: 1, x: 0 });
			}
			prevSectionNameRef.current = currName;
			return;
		}

		const tl = gsap.timeline();

		if (prevElExists)
			tl.to(prevEl, {
				opacity: 0,
				x: toMainSection ? 80 : -80,
				duration: 0.25
			});

		if (currEl)
			tl.fromTo(
				currEl,
				{ opacity: 0, x: toMainSection ? -80 : 80 },
				{
					opacity: 1,
					x: 0,
					duration: 0.3
				},
				prevElExists ? "-=0.15" : 0
			);

		prevSectionNameRef.current = currName;

		return () => {
			tl.progress(1).kill();
		};
	}, [currentSectionName, isOpen]);

	return (
		<>
			<Button
				className={cn(
					"fixed top-12 right-12 z-60 rounded-lg p-1 size-9",
					"bg-radial from-deep-space/20 to-neon-cyan/20 text-neon-cyan",
					"border-neon-cyan/80 border",
					"shadow-[inset_0_0_5px_var(--color-neon-cyan),0_0_0px_var(--color-neon-cyan)] hover:shadow-[inset_0_0_10px_var(--color-neon-cyan),0_0_3px_var(--color-neon-cyan)]"
				)}
				onClick={handleToggleOpen}
			>
				{(() => {
					const OpenIcon = isOpen ? Icon.Cross : Icon.Menu;
					return <OpenIcon size={isOpen ? 16 : 18} />;
				})()}
			</Button>

			<Modal show={!!isOpen} {...props}>
				{(() => {
					return SUPPORTED_MAIN_MENU_SECTIONS.map(({ name, component }) => {
						const Section = component;
						const isActive = name === currentSectionName;

						return (
							<div
								key={name}
								ref={(el) => {
									sectionRefs.current.set(name, el);
								}}
								className={cn(
									"absolute inset-0 opacity-0 pointer-events-none z-10",
									isOpen && isActive && "pointer-events-auto",
									isActive && "opacity-100"
								)}
								inert={!isOpen || !isActive}
							>
								<Section />
							</div>
						);
					});
				})()}
			</Modal>
		</>
	);
};
