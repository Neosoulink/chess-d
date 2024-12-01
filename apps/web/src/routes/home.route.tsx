import { useMainMenuStore } from "../shared/stores";

export const HomeRoute = () => {
	const { openMenu, openNewGameSection } = useMainMenuStore();

	return (
		<main className="flex flex-col justify-center items-center h-screen gap-8">
			<div className="flex flex-col justify-center items-center">
				<h1 className="text-4xl"> Chess Dimension </h1>
				<p className="text-2xl">
					3D chess game built with{" "}
					<code className="font-semibold">Three.js</code>
				</p>
			</div>

			<button
				className="transition-colors bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				onClick={() => {
					openMenu();
					setTimeout(openNewGameSection, 0);
				}}
			>
				Start a new game
			</button>

			<small>
				Or open the main menu with{" "}
				<code className="border rounded p-[1px]">Esc</code>
			</small>
		</main>
	);
};
