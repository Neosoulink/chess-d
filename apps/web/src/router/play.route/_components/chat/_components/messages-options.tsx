import { Button } from "@/router/_components/core";
import { FC, PointerEvent } from "react";

export const ChatMessagesOptions: FC<{
	data: {
		content: string;
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

	return data.map(({ content, description, action }, index) => (
		<Button
			key={`${content}-${index}`}
			title={description}
			onPointerDown={(e) => handleClick(e, action)}
			className="h-8"
		>
			{content}
		</Button>
	));
};
