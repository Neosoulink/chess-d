import { forwardRef, useMemo } from "react";

import { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	disabled?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, disabled, ...props }, ref) => {
		const disabledClassNames = useMemo(
			() => (disabled ? "!opacity-30 !pointer-events-none !select-none" : ""),
			[disabled]
		);

		return (
			<button
				ref={ref}
				className={`flex justify-center items-center pointer-events-auto cursor-pointer transition-all opacity-50 hover:opacity-100 ${className || ""} ${disabledClassNames}`}
				{...props}
			/>
		);
	}
);
