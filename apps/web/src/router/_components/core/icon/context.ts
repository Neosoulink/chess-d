import {
	Context,
	createContext,
	CSSProperties,
	JSX,
	ReactNode,
	SVGAttributes
} from "react";

export interface IconContext {
	color?: string;
	size?: string;
	className?: string;
	style?: CSSProperties;
	attr?: SVGAttributes<SVGElement>;
}

export interface IconBaseProps extends SVGAttributes<SVGElement> {
	children?: ReactNode;
	size?: string | number;
	color?: string;
	title?: string;
}

export type IconType = (props: IconBaseProps) => JSX.Element;

export const DefaultContext: IconContext = {
	color: undefined,
	size: undefined,
	className: undefined,
	style: undefined,
	attr: undefined
};

export const IconContext: Context<IconContext> =
	createContext && createContext(DefaultContext);
