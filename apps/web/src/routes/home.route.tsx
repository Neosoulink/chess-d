import { useMainMenuStore } from "../shared/stores";

export const HomeRoute = () => {
	const { openMenu } = useMainMenuStore();

	return (
		<main className="flex flex-col justify-center items-center h-screen gap-8">
			<div className="flex flex-col justify-center items-center">
				<h1 className="text-4xl"> Chess Dimension </h1>
				<p className="text-2xl">Basic 3D chess game built with Three.js </p>
			</div>

			<button
				className="transition-colors bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				onClick={() => openMenu()}
			>
				Start a new game
			</button>
		</main>
	);
};
