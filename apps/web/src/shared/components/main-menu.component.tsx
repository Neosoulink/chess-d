import { FC, useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router";

import { GameMode } from "../enum";
import { stopEventPropagation } from "../utils";
import { useMainMenuStore } from "../stores";

export interface MainMenuComponentProps {}

/** @internal */
const GameModeOptions: {
	label: string;
	title: string;
	mode: keyof typeof GameMode;
}[] = [
	{ label: "AI", mode: "ai", title: "Play against the computer" },
	{
		label: "Human",
		mode: "human",
		title: "Play against another human player"
	},
	{ label: "Free Mode", mode: "free", title: "Play against yourself" },
	{
		label: "Simulation",
		mode: "simulation",
		title: "Watch the AIs playing against each other"
	}
];

/** @internal */
const MainSection: FC = () => {
	const { openNewGameSection } = useMainMenuStore();

	return (
		<nav className="flex flex-col text-2xl">
			<Link
				to="/"
				className="py-4 hover:pl-2 hover:bg-gray-100 border-b border-gray-300 transition-[padding,background-color] duration-300"
			>
				Home
			</Link>

			<button
				onClick={openNewGameSection}
				className="py-4 hover:pl-2 hover:bg-gray-100 border-b border-gray-300 text-left transition-[padding,background-color] duration-300"
			>
				New Game
			</button>

			<Link
				to="/about"
				className="py-4 hover:pl-2 hover:bg-gray-100 border-b border-gray-300 transition-[padding,background-color] duration-300"
			>
				About
			</Link>
		</nav>
	);
};

/** @internal */
const NewGameSection: FC = () => {
	const { closeNewGameSection } = useMainMenuStore();

	return (
		<section className="flex flex-col gap-8 items-start">
			<div>
				<h2 className="text-xl mb-2">Choose your game mode:</h2>

				<div className="flex flex-wrap gap-4 text-xl">
					{GameModeOptions.map((option) => (
						<Link
							key={option.mode}
							to={`/play?mode=${option.mode}`}
							title={option.title}
							viewTransition
							className="p-5 rounded shadow-md hover:bg-gray-100"
						>
							{option.label}
						</Link>
					))}
				</div>
			</div>

			<button className="shadow-md p-2 rounded" onClick={closeNewGameSection}>
				Return
			</button>
		</section>
	);
};

export const MainMenuComponent: FC<MainMenuComponentProps> = () => {
	const location = useLocation();

	const {
		isMenuOpen,
		isNewGameSectionOpen,
		openMenu,
		closeMenu,
		closeNewGameSection
	} = useMainMenuStore();

	const handleEscPress = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === "Escape" && isMenuOpen) closeMenu();
			if (event.key === "Escape" && !isMenuOpen) openMenu();
		},
		[isMenuOpen, closeMenu, openMenu]
	);

	useEffect(() => {
		closeMenu();
		closeNewGameSection();
	}, [closeMenu, closeNewGameSection, location]);

	useEffect(() => {
		document.addEventListener("keydown", handleEscPress);
		return () => document.removeEventListener("keydown", handleEscPress);
	}, [handleEscPress]);

	useEffect(() => {
		if (isMenuOpen) closeNewGameSection();
	}, [closeNewGameSection, isMenuOpen]);

	return (
		<div
			className={`fixed h-dvh w-dvw flex justify-center items-center z-50 top-0 left-0 p-4 bg-gradient-to-b from-gray-900/40 via-gray-950/80 to-gray-900/40 transition-opacity duration-300 overflow-hidden ${isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
			onClick={closeMenu}
		>
			<section
				onClick={stopEventPropagation}
				className="bg-gray-50 text-gray-950 p-12 rounded-xl max-w-[584px] min-w-[584px] relative"
			>
				<button
					className="absolute top-5 right-5 text-xl h-10 w-10 flex justify-center items-center rounded-full shadow-md hover:bg-gray-100 select-none hover:shadow-lg transition-[shadow,background-color] duration-300"
					onClick={closeMenu}
				>
					x
				</button>

				<header className="flex flex-col gap-4">
					<h1 className="text-4xl">Main Menu</h1>

					{!isNewGameSectionOpen && <MainSection />}

					{isNewGameSectionOpen && <NewGameSection />}
				</header>
			</section>
		</div>
	);
};
