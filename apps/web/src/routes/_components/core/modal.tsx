import {
	forwardRef,
	HTMLAttributes,
	MouseEventHandler,
	useEffect,
	useState
} from "react";
import { Icon } from "./icon";
import { Button } from "./button";

export interface ModalProps extends HTMLAttributes<HTMLElement> {
	show?: boolean;
	onClose?: MouseEventHandler<HTMLButtonElement>;
}

export const Modal = forwardRef<HTMLElement, ModalProps>(
	({ show, onClose, children, className, ...props }, ref) => {
		const [showClassNames, setShowClassNames] = useState("hidden");

		useEffect(() => {
			let timeout: NodeJS.Timeout;

			if (show) {
				setShowClassNames("opacity-0");
				timeout = setTimeout(() => setShowClassNames("opacity-100"), 100);
			} else {
				setShowClassNames("opacity-0");
				timeout = setTimeout(() => setShowClassNames("hidden"), 300);
			}

			return () => clearTimeout(timeout);
		}, [show]);

		return (
			<section
				ref={ref}
				className={`fixed h-dvh w-dvw flex flex-col z-50 top-0 left-0 p-4 bg-black/30 backdrop-blur-xs transition-opacity duration-300 overflow-hidden ${showClassNames} ${className}`}
				{...props}
			>
				{onClose && (
					<Button
						className="absolute top-5 right-5 h-10 w-10"
						onClick={onClose}
					>
						<Icon.Cross />
					</Button>
				)}

				{children}
			</section>
		);
	}
);
