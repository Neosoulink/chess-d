import { gsap } from "gsap";
import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router";

import { cn } from "@/shared/utils";
import { useMainMenuStore } from "@/router/_stores";
import { MAIN_MENU_SECTIONS } from "@/shared/constants";
import { Modal } from "../../core";
import { MainMenuCreditsSection } from "./_sections/credits";
import { MainMenuMainSection } from "./_sections/main";
import { MainMenuNewGameSection } from "./_sections/new-game";
import { MainMenuSaveLoadSection } from "./_sections/save-load";
import { MainMenuSettingsSection } from "./_sections/settings";

/** @internal */
const MAIN_MENU_SECTIONS_MAP = [
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
	},
	{
		name: MAIN_MENU_SECTIONS.credits,
		component: MainMenuCreditsSection
	}
] as const;

export const GlobalMainMenu = () => {
	const location = useLocation();

	const { isOpen, currentSections, setOpen } = useMainMenuStore();

	const sectionRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
	const prevSectionNameRef = useRef<string | null>(null);
	const isInitialMount = useRef(true);

	const currentSectionName = useMemo(() => {
		const [_currentSection] = currentSections || [];
		return _currentSection || MAIN_MENU_SECTIONS.main;
	}, [currentSections]);

	useEffect(() => setOpen(false), [setOpen, location]);
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
		<Modal show={!!isOpen}>
			{(() => {
				return MAIN_MENU_SECTIONS_MAP.map(({ name, component }) => {
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
	);
};
