import { cn } from "@/shared/utils";
import { ComponentPropsWithRef, RefAttributes, useMemo } from "react";

import { ButtonHTMLAttributes } from "react";
import { Link, LinkProps } from "react-router";

/** @internal */
type ALinkProps = LinkProps & RefAttributes<HTMLAnchorElement>;

export type ButtonProps = (
	| ButtonHTMLAttributes<HTMLButtonElement>
	| ALinkProps
) & {
	disabled?: boolean;
	asLink?: boolean;
	withClickEffect?: boolean;
} & ComponentPropsWithRef<"button">;

export const Button = ({
	className,
	asLink,
	disabled,
	withClickEffect = true,
	...props
}: ButtonProps) => {
	const Comp = useMemo(() => (asLink ? Link : "button"), [asLink]);

	return (
		<Comp
			className={cn(
				"h-10 px-2 bg-light/20 flex justify-center items-center gap-2 pointer-events-auto transition-[border-color,background-color,color,opacity] duration-250",
				"hover:bg-light/30 hover:text-shadow-[0_0_4px_color-mix(in_srgb,var(--color-neon-gold)_25%,transparent)] text-current hover:no-underline",
				withClickEffect && "active:scale-110",
				disabled && "opacity-30 pointer-events-none select-none",
				className
			)}
			{...(props as any)}
		/>
	);
};
