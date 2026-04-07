import { cn } from "@/shared/utils";
import {
	ComponentProps,
	forwardRef,
	InputHTMLAttributes,
	TextareaHTMLAttributes,
	useMemo
} from "react";

/** @internal */
type InputRef = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export type InputProps = (Omit<InputHTMLAttributes<HTMLInputElement>, "type"> &
	Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "type">) & {
	type?: ComponentProps<"input">["type"] | "select" | "textarea";
	invalid?: boolean;
};

export const Input = forwardRef<InputRef, InputProps>(
	({ multiple, className, disabled, invalid, type, ...props }, ref) => {
		const Comp = useMemo(
			() =>
				type === "select"
					? "select"
					: type === "textarea"
						? "textarea"
						: "input",
			[type]
		);

		return (
			<Comp
				ref={ref as any}
				disabled={disabled}
				type={type}
				className={cn(
					"bg-light/20 text-white text-lg text-shadow-neon-gold/40 block px-2.5 h-10 transition-all duration-250",
					"border-r-8 border-transparent",
					"hover:bg-light/30 hover:text-shadow-[0_0_4px_var(--color-neon-gold)]",
					"focus:ring-0 focus:outline-light/30 focus:bg-light/30",
					type === "checkbox" &&
						"after:content-['Disabled'] checked:after:content-['Enabled'] after:absolute after:top-1/2 after:-translate-y-1/2 appearance-none",
					invalid && "ring-2 ring-negative focus:ring-2",
					disabled && "opacity-50 pointer-events-none",
					className
				)}
				{...(props as any)}
			/>
		);
	}
);
