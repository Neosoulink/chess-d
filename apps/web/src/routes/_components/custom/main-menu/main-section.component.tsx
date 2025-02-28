import { FC, PropsWithChildren } from "react";
import { Link } from "react-router";

import { MainMenuSection } from "../../../../shared/enum";
import { useMainMenuStore } from "../../../_stores";
import { Button } from "../../core";
import { Icon } from "../../core/icon";

/** @internal */
const LogoTitle: FC = () => (
	<section className="flex w-[584px] mb-12 -ml-4">
		<Icon.Knight size={190} />

		<h1 className="text-9xl leading-32 flex flex-col w-full -ml-4">
			Chess <span className="text-6xl pl-12">Dimension</span>
		</h1>
	</section>
);

/** @internal */
const OptionItem: FC<
	PropsWithChildren<{
		asLink?: boolean;
		disabled?: boolean;
		action?: string | (() => unknown);
	}>
> = ({ asLink, disabled, children, action }) => {
	return (
		<Button
			{...{
				asLink,
				disabled,
				...(asLink && typeof action === "string" ? { to: action } : {}),
				...(typeof action === "function" ? { onClick: action } : {})
			}}
			className="py-4 px-2 overflow-hidden justify-start group relative"
		>
			<div className="group-hover:bg-gradient-to-r from-30% from-black/50 to-black/0 transition-all duration-500 h-full absolute top-0 left-0 w-0 group-hover:w-full " />

			<span className="opacity-0 group-hover:opacity-100 transition-opacity z-10">
				<Icon.Pawn size={32} />
			</span>

			<span className="z-10 group-hover:pl-2 transition-all">{children}</span>

			{disabled && <span>(Coming Soon)</span>}
		</Button>
	);
};

export const MainSection: FC = () => {
	const { setSection, close } = useMainMenuStore();

	const options: Parameters<typeof OptionItem>[0][] = [
		{
			children: "New Game",
			action: () => setSection(MainMenuSection.newGame)
		},
		{
			children: "Load Game",
			disabled: true,
			action: () => setSection(MainMenuSection.newGame)
		},
		{
			children: "Settings",
			disabled: true,
			action: () => setSection(MainMenuSection.newGame)
		},
		{ children: "Credits", asLink: true, action: "/credits" },
		{ children: "Back Home", asLink: true, action: "/" },
		{ children: "Close", action: () => close() }
	];

	return (
		<section className="pt-44 px-24 pb-12">
			<LogoTitle />

			<nav className="flex flex-col text-2xl">
				{options.map((option) => (
					<OptionItem key={`${option.children}`} {...option} />
				))}
			</nav>
		</section>
	);
};
