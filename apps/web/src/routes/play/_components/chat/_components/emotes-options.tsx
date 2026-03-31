import { Button } from "@/routes/_components/core";
import { FC, PointerEvent } from "react";

export const ChatEmotesOptions: FC<{
	data: {
		name: string;
		description?: string;
		action: () => void;
	}[];
}> = ({ data }) => {
	const handleClick = (
		e: PointerEvent<HTMLButtonElement>,
		action: () => void
	) => {
		action();
	};

	return data.map(({ name, description, action }, index) => (
		<Button
			key={`${name}-${index}`}
			title={description}
			onPointerDown={(e) => handleClick(e, action)}
			className="size-8"
		>
			{name}
		</Button>
	));
};
