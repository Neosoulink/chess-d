import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ComponentPropsWithRef, FC, useEffect, useRef } from "react";

import { MAIN_MENU_SECTIONS } from "@/shared/constants";
import { useMainMenuStore } from "@/router/_stores";
import { cn } from "@/shared/utils";
import { Button, Icon } from "@/router/_components/core";
import { MainMenuSection } from "../_components/section";

import NeymarkChessBackgroundPath from "@/assets/images/illustrations/neymark-chess.jpg?url";

/** @internal */
const LogoTitle: FC = () => {
	const { isOpen, currentSections } = useMainMenuStore();

	const logoRef = useRef<SVGSVGElement | null>(null);
	const splitRef = useRef<HTMLHeadingElement | null>(null);

	useEffect(() => {
		const [currentSection] = currentSections || [];

		if (
			!splitRef?.current ||
			!isOpen ||
			currentSection !== MAIN_MENU_SECTIONS.main
		)
			return;

		const split = SplitText.create(splitRef.current as HTMLHeadingElement, {
			type: "words, chars"
		});
		const tl = gsap.timeline();

		tl.from(logoRef.current, {
			color: "var(--color-neon-purple)",
			duration: 0.5,
			scale: 0,
			autoAlpha: 0
		});

		tl.from(
			split.chars,
			{
				color: "var(--color-neon-purple)",
				duration: 0.5,
				y: 10,
				autoAlpha: 0,
				stagger: 0.05
			},
			"-=0.5"
		);

		return () => {
			tl.progress(1).kill();
		};
	}, [currentSections, isOpen]);

	return (
		<section className="flex -ml-4 pointer-events-none select-none relative z-10 w-fit">
			<Icon.ChessKnight
				ref={logoRef}
				withGradientStroke
				size={190}
				filter="drop-shadow(0px 0px 30px color-mix(in srgb, var(--color-primary) 30%, transparent))"
				className="origin-center"
			/>

			<h1
				ref={splitRef}
				className={cn(
					"text-9xl leading-32 flex flex-col w-full -ml-4",
					"text-shadow-primary/40 text-shadow-[0_0_10px_var(--color-primary)]"
				)}
			>
				Chess <span className="text-6xl pl-12">Dimension</span>
			</h1>
		</section>
	);
};

/** @internal */
const OptionItem = ({
	asLink,
	disabled,
	action,
	icon,
	children,
	...props
}: ComponentPropsWithRef<"button"> & {
	asLink?: boolean;
	disabled?: boolean;
	icon?: keyof typeof Icon;
	action?: string | (() => unknown);
}) => {
	const baseGradientClassNames =
		"bg-linear-to-r from-primary/80 from-30% to-secondary/80";

	return (
		<Button
			{...{
				asLink,
				disabled,
				withClickEffect: false,
				className: cn(
					"justify-start group relative rounded-4xl p-0.5 transition-all duration-300 w-full",
					disabled ? "bg-light/10" : baseGradientClassNames
				),
				...(asLink && typeof action === "string" ? { to: action } : {}),
				...(typeof action === "function" ? { onClick: action } : {})
			}}
			{...props}
		>
			<div
				className={cn(
					baseGradientClassNames,
					"transition-all duration-300 h-full absolute top-0 left-0 w-0 group-hover:w-full group-hover:opacity-100 opacity-0 rounded-4xl"
				)}
			/>

			<div
				className={cn(
					"flex items-center gap-3 px-5 py-1.5 rounded-4xl w-full justify-start h-full",
					"bg-linear-to-b from-dark/40 via-dark/40 to-dark/40"
				)}
			>
				<span className="opacity-0 group-hover:opacity-100 transition-opacity z-10">
					<Icon.ChessPawn size={25} />
				</span>

				<span className="z-10 group-hover:pl-2 transition-all text-shadow-primary/70 text-shadow-[0_0_2px_var(--color-primary)]">
					{children}
				</span>
			</div>
		</Button>
	);
};

export const MainMenuMainSection: FC = () => {
	const { isOpen, currentSections, setSections, setOpen } = useMainMenuStore();

	const optionRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

	const options: {
		children: string;
		action: string | (() => unknown);
		asLink?: boolean;
		icon?: keyof typeof Icon;
	}[] = [
		{
			children: "New Game",
			action: () => setSections(MAIN_MENU_SECTIONS.newGame)
		},
		{
			children: "Load Game",
			action: () => setSections(MAIN_MENU_SECTIONS.loadGame)
		},
		{
			children: "Settings",
			action: () => setSections(MAIN_MENU_SECTIONS.settings)
		},
		{
			children: "Home",
			asLink: true,
			action: "/"
		},
		{
			children: "Close",
			action: () => setOpen(false)
		}
	];

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
		<MainMenuSection className="flex flex-col justify-center gap-10 pt-5 pb-3 pl-10">
			<img
				src={NeymarkChessBackgroundPath}
				alt="Neymark Chess Background"
				className="absolute top-0 left-0 w-full h-full object-cover object-center opacity-10 pointer-events-none"
			/>

			<LogoTitle />

			<nav className="flex flex-col text-2xl gap-2 pr-1 w-full overflow-x-hidden overflow-y-auto">
				{options.map((option, index) => (
					<div
						key={`${option.children}`}
						ref={(el) => {
							optionRefs.current.set(option.children, el);
						}}
						className="w-full max-w-96"
						style={{
							paddingRight: `${index * 20}px`
						}}
					>
						<OptionItem {...option} />
					</div>
				))}
			</nav>
		</MainMenuSection>
	);
};
