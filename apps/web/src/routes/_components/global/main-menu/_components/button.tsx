import {
	ComponentPropsWithoutRef,
	ComponentPropsWithRef,
	ReactNode
} from "react";

import { cn } from "@/shared/utils";
import { Button, Icon } from "@/routes/_components/core";

export type MainMenuButtonProps = ComponentPropsWithRef<typeof Button> & {
	icon?: ReactNode;
	wrapperProps?: ComponentPropsWithoutRef<"div">;
};

export const MainMenuButton = ({
	className,
	icon,
	disabled,
	children,
	wrapperProps,
	...props
}: MainMenuButtonProps) => {
	const bgGradient =
		"bg-linear-to-r from-neon-cyan/80 from-30% to-neon-purple/80";
	return (
		<Button
			className={cn(
				"justify-start group relative rounded-4xl p-0.5 transition-all duration-300",
				disabled ? "bg-light/10" : bgGradient,
				className
			)}
			disabled={disabled}
			{...props}
		>
			<div
				className={cn(
					bgGradient,
					"transition-all duration-300 h-full absolute top-0 left-0 w-0 group-hover:w-full group-hover:opacity-100 opacity-0 rounded-4xl"
				)}
			/>

			<div
				className={cn(
					"flex items-center gap-3 px-5 py-1.5 rounded-4xl w-full justify-start h-full",
					"bg-linear-to-b from-deep-space/40 via-deep-space/40 to-deep-space/40 text-light",
					wrapperProps?.className
				)}
				{...wrapperProps}
			>
				<span className="opacity-0 group-hover:opacity-100 transition-opacity z-10">
					<Icon.Pawn size={30} />
				</span>

				<span className="z-10 group-hover:pl-2 transition-all text-shadow-neon-gold/80 text-shadow-[0_0_2px_var(--color-neon-gold)]">
					{children}
				</span>
			</div>
		</Button>
	);
};
