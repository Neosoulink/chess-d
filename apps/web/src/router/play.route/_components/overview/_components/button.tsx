import { Button } from "@/router/_components/core";
import { cn } from "@/shared/utils";
import { ComponentPropsWithRef, FC } from "react";

export const GameOverviewButton: FC<ComponentPropsWithRef<typeof Button>> = ({
	children,
	className,
	type = "button",
	...props
}) => {
	return (
		<Button
			{...{
				...props,
				type,
				className: cn("size-8 bg-dark/80 hover:bg-dark", className)
			}}
		>
			{children}
		</Button>
	);
};
