import { FC } from "react";
import { Link } from "react-router";

import { MainMenuSection } from "../../../../shared/enum";
import { useMainMenuStore } from "../../../_stores";

export const MainSection: FC = () => {
	const { setSection } = useMainMenuStore();

	return (
		<section>
			<h1 className="text-4xl">Main Menu</h1>

			<nav className="flex flex-col text-2xl">
				<Link
					to="/"
					className="py-4 hover:pl-2 hover:bg-gray-100 border-b border-gray-300 transition-[padding,background-color] duration-300"
				>
					Home
				</Link>

				<button
					onClick={() => setSection(MainMenuSection.newGame)}
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
		</section>
	);
};
