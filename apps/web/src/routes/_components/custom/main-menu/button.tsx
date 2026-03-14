import { ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/utils";
import { Button } from "../../core";

export const MainMenuButton = ({
	className,
	...props
}: ComponentPropsWithoutRef<typeof Button>) => {
	return (
		<Button
			className={cn(
				"bg-linear-to-r from-deep-space to-neon-purple text-white px-4 py-2 rounded-md",
				className
			)}
			{...props}
		/>
	);
};
