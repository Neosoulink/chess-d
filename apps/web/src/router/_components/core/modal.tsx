import { ComponentPropsWithRef, MouseEventHandler } from "react";

import { cn } from "@/shared/utils";
import { Icon } from "./icon";
import { Button } from "./button";

export interface ModalProps extends ComponentPropsWithRef<"section"> {
	show?: boolean;
	withBgColor?: boolean;
	onClose?: MouseEventHandler<HTMLButtonElement>;
}

export const Modal = ({
	show,
	onClose,
	children,
	className,
	withBgColor = true,
	...props
}: ModalProps) => {
	return (
		<section
			data-name="modal"
			className={cn(
				"fixed h-dvh w-dvw z-50 top-0 left-0 transition-opacity duration-300 overflow-hidden backdrop-blur-xs",
				withBgColor &&
					"bg-linear-to-b from-primary/60 to-secondary/60 transition-colors",
				show ? "opacity-100" : "opacity-0 pointer-events-none",
				className
			)}
			{...props}
		>
			{onClose && (
				<Button className="absolute top-5 right-5 h-10 w-10" onClick={onClose}>
					<Icon.Cross />
				</Button>
			)}

			{withBgColor && (
				<div className="absolute top-0 left-0 w-full h-full bg-black/75 z-0" />
			)}

			{children}
		</section>
	);
};
