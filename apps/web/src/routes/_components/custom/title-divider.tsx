import { ComponentPropsWithRef } from "react";

import { Icon } from "../core";
import { Divider } from "../core/divider";
import { cn } from "@/shared/utils";

export interface TitleDividerProps extends ComponentPropsWithRef<"div"> {
	title: string;
	icon?: keyof typeof Icon;
	heading?: "1" | "2" | "3" | "4" | "5" | "6";
}

export const TitleDivider = ({
	icon,
	title,
	heading = "1",
	...divProps
}: TitleDividerProps) => {
	const IconComponent = icon && Icon[icon];
	const HeadingComponent = `h${heading}` as const;

	return (
		<HeadingComponent
			{...{
				...divProps,
				className: cn("relative", divProps.className)
			}}
		>
			{IconComponent ? (
				<IconComponent
					size="1.25rem"
					className="absolute top-1/2 -translate-y-1/2 right-full mr-1"
				/>
			) : null}

			<span>{title}</span>
			<Divider />
		</HeadingComponent>
	);
};
