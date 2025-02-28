import { MainMenuSection } from "../shared/enum";
import { Button, Icon } from "./_components/core";
import { useMainMenuStore } from "./_stores";

export const HomeRoute = () => {
	const { open: openMenu } = useMainMenuStore();

	return (
		<section className="fixed left-1/2 -translate-x-1/2 bottom-4 flex flex-col justify-center items-center w-fit gap-4 py-6 px-20 backdrop-blur-xs bg-black/30 rounded-xl">
			<h1 className="text-4xl"> Chess Dimension </h1>

			<Button
				className="bg-black/30 font-bold py-2 px-4 uppercase"
				onClick={() => openMenu(MainMenuSection.newGame)}
			>
				Start a new game
			</Button>

			<small>
				Open the main menu with{" "}
				<code className="border rounded p-[1px]">Esc</code> or the{" "}
				<code className="border rounded p-[2px] inline-block -mb-1">
					<Icon.Menu size={10} />
				</code>{" "}
				button
			</small>
		</section>
	);
};
