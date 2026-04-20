import { cn } from "@/shared/utils";
import {
	ComponentPropsWithRef,
	MouseEventHandler,
	useCallback,
	useEffect,
	useRef,
	useState
} from "react";
import { Button } from "../core";

export type PopoverButtonProps = ComponentPropsWithRef<typeof Button> & {
	popoverProps?: ComponentPropsWithRef<"div">;
};

export const PopoverButton = ({
	className,
	popoverProps,
	onClick,
	...buttonProps
}: PopoverButtonProps) => {
	const [showPopover, setShowPopover] = useState(false);

	const buttonRef = useRef<HTMLButtonElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);

	const handleTogglePopover: MouseEventHandler<HTMLButtonElement> = useCallback(
		(e) => {
			setShowPopover((prev) => !prev);
			onClick?.(e);
		},
		[onClick]
	);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Node;
			const button = buttonRef.current;

			if (button?.contains(target) || button === target) return;

			setShowPopover(false);
		};

		window.addEventListener("pointerdown", handleClickOutside);
		return () => window.removeEventListener("pointerdown", handleClickOutside);
	}, []);

	useEffect(() => {
		const popover = popoverRef.current;
		const button = buttonRef.current;

		if (popover && button) {
			const top = button.getBoundingClientRect().top;
			const left = button.getBoundingClientRect().left;

			popover.style.top = top - 5 + "px";
			popover.style.left = left + "px";
		}
	}, [showPopover]);

	return (
		<>
			<Button
				{...{
					...buttonProps,
					ref: (el) => {
						buttonRef.current = el;

						return buttonProps.ref as any;
					},
					className: cn("", className),
					onClick: handleTogglePopover
				}}
			/>

			<div
				{...{
					...popoverProps,
					ref: (el) => {
						popoverRef.current = el;

						return popoverProps?.ref as any;
					},
					className: cn(
						"fixed top-0 left-0 -translate-y-full bg-dark p-2 origin-bottom flex items-center opacity-0 transition-[scale,opacity] duration-250 pointer-events-none origin-bottom-left scale-0",
						showPopover && "pointer-events-auto flex opacity-100 scale-100",
						popoverProps?.className
					)
				}}
			/>
		</>
	);
};
