import {
	forwardRef,
	ForwardRefExoticComponent,
	RefAttributes,
	useEffect,
	useMemo,
	useRef,
	useState
} from "react";

import { ButtonHTMLAttributes } from "react";
import { Link, LinkProps } from "react-router";

/** @internal */
type ALinkProps = LinkProps & RefAttributes<HTMLAnchorElement>;
/** @internal */
type ButtonRef = HTMLButtonElement | ForwardRefExoticComponent<ALinkProps>;

export type ButtonProps = (
	| ButtonHTMLAttributes<HTMLButtonElement>
	| ALinkProps
) & {
	disabled?: boolean;
	asLink?: boolean;
};

export const Button = forwardRef<ButtonRef, ButtonProps>(
	({ className, asLink, disabled, ...props }, ref) => {
		const [pressed, setPressed] = useState(false);

		const disabledClassNames = useMemo(
			() => (disabled ? "!opacity-30 !pointer-events-none !select-none" : ""),
			[disabled]
		);
		const Comp = useMemo(() => (asLink ? Link : "button"), [asLink]);

		const compRef = useRef<ButtonRef>(null);

		useEffect(() => {
			const element = compRef.current as HTMLElement | undefined;

			const handlePressDown = (e: MouseEvent) => {
				setPressed(true);
			};

			const handlePressUp = (e: MouseEvent) => {
				setPressed(false);
			};

			element?.addEventListener("mousedown", handlePressDown);
			element?.addEventListener("mouseup", handlePressUp);
			element?.addEventListener("mouseleave", handlePressUp);

			return () => {
				element?.removeEventListener("mousedown", handlePressDown);
				element?.removeEventListener("mouseup", handlePressUp);
				element?.removeEventListener("mouseleave", handlePressUp);
			};
		}, []);

		return (
			<Comp
				ref={(_ref: ButtonRef) => {
					compRef.current = _ref;

					return ref as any;
				}}
				className={`flex justify-center items-center gap-2 pointer-events-auto cursor-pointer transition-all duration-300 opacity-80 hover:opacity-100 ring-0 outline-0 rounded ${className || ""} ${disabledClassNames} ${pressed ? "scale-105" : ""}`}
				{...(props as any)}
			/>
		);
	}
);
