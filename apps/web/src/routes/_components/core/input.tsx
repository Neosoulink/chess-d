import {
	forwardRef,
	InputHTMLAttributes,
	TextareaHTMLAttributes,
	useMemo
} from "react";

/** @internal */
type InputRef = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export type InputProps = (InputHTMLAttributes<HTMLInputElement> &
	TextareaHTMLAttributes<HTMLTextAreaElement>) & {
	asSelect?: boolean;
	asTextArea?: boolean;
};

export const Input = forwardRef<InputRef, InputProps>(
	({ asTextArea, asSelect, multiple, className, ...props }, ref) => {
		const Comp = useMemo(
			() => (asSelect ? "select" : asTextArea ? "textarea" : "input"),
			[asSelect, asTextArea]
		);

		return (
			<Comp
				ref={ref as any}
				className={`
					bg-black/30 outline outline-white/20 border-r-8 border-transparent text-white text-base rounded-sm block p-2.5 h-11 w-full
					focus:ring-0 focus:outline-white/30
					dark:bg-black/30 dark:border-transparent dark:placeholder-gray-400 dark:text-white dark:focus:ring-0 dark:text-base
					${className}`}
				{...(props as any)}
			/>
		);
	}
);
