import { Icon } from "./_components/core";
import { useMainMenuStore } from "./_stores";
import { cn } from "@/shared/utils";

export const HomeRoute = () => {
	const { isOpen } = useMainMenuStore();

	return (
		<section
			className={cn(
				"fixed left-1/2 -translate-x-1/2 bottom-10 flex flex-col justify-center items-center w-fit gap-4 py-2 px-8 backdrop-blur-xs bg-linear-to-r from-primary/30 to-secondary/30 rounded-xl pointer-events-none transition-opacity duration-300",
				isOpen && "opacity-0"
			)}
		>
			<small className="animate-pulse">
				Open main menu with the <code className="border rounded p-px">Esc</code>{" "}
				key or press the{" "}
				<code className="border rounded p-[2px] inline-block -mb-1">
					<Icon.Menu size={12} />
				</code>{" "}
				button
			</small>
		</section>
	);
};
