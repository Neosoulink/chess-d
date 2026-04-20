import { version, author } from "@/../package.json";

export const GlobalTopLeftSection = () => {
	return (
		<small className="fixed top-10 left-6 z-60 text-xs">
			<span>@chess-D</span> <span>v{version}</span>{" "}
			<span>
				by{" "}
				<a href={author.url} target="_blank" rel="noopener noreferrer">
					{author.name}
				</a>
			</span>
		</small>
	);
};
