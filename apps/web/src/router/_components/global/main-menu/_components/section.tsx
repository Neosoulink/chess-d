import { cn } from "@/shared/utils";
import { ComponentPropsWithoutRef, ReactNode } from "react";

export type MainMenuSectionProps = ComponentPropsWithoutRef<"section"> & {
	icon?: ReactNode;
	wrapperProps?: ComponentPropsWithoutRef<"div">;
};

export const MainMenuSection = ({
	children,
	className,
	...props
}: MainMenuSectionProps) => {
	return (
		<section className={cn("size-full z-10", className)} {...props}>
			{children}
		</section>
	);
};
