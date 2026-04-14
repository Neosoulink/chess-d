import { cn } from "@/shared/utils";
import { ComponentPropsWithRef } from "react";

export const Divider = ({
	className,
	variant = "default",
	...props
}: ComponentPropsWithRef<"hr"> & {
	variant?: "default" | "light";
}) => {
	return (
		<hr
			className={cn(
				"h-0.25 w-full border-none bg-linear-to-r from-primary to-secondary",
				variant === "light" &&
					"bg-linear-to-r from-light/1 via-light/10 to-light/1",
				className
			)}
			{...props}
		/>
	);
};
