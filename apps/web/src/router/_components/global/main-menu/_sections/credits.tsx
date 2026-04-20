import { gsap } from "gsap";
import { FC, useEffect, useRef } from "react";
import Markdown from "react-markdown";

import { MAIN_MENU_SECTIONS } from "@/shared/constants";
import { useMainMenuStore } from "@/router/_stores";
import { ModalSection } from "@/router/_components/custom";

import yeahImgPath from "@/assets/images/illustrations/yeah.png?url";
import creditsText from "@/assets/markdown/credits.md?raw";

export const MainMenuCreditsSection: FC = () => {
	const { isOpen, currentSections, setSections, setOpen } = useMainMenuStore();

	const optionRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

	useEffect(() => {
		const [currentSection] = currentSections || [];
		const optionEls = Array.from(optionRefs.current.values()).filter(Boolean);

		if (
			!optionEls.length ||
			!isOpen ||
			currentSection !== MAIN_MENU_SECTIONS.main
		)
			return;
		const tl = gsap.timeline();

		tl.from(optionEls, {
			duration: 0.25,
			delay: 0.25,
			x: 100,
			autoAlpha: 0,
			stagger: 0.075
		});

		return () => {
			tl.progress(1).kill();
		};
	}, [currentSections, isOpen]);

	return (
		<ModalSection
			header={{
				title: "Credits",
				icon: "Info"
			}}
			footerOptions={[
				{
					label: "Back",
					icon: "ActionUndo",
					action: () => setSections(MAIN_MENU_SECTIONS.main)
				},
				{
					label: "Close",
					action: () => setOpen(false)
				}
			]}
		>
			<Markdown>{creditsText}</Markdown>
			<a href="https://github.com/Neosoulink" title="Yeah!">
				<img
					alt="Yeah!"
					src={yeahImgPath}
					className="w-full object-cover object-center"
				/>
			</a>
		</ModalSection>
	);
};
