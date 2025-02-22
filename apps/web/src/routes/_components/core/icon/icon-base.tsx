import { forwardRef, JSX } from "react";
import { DefaultContext, IconBaseProps, IconContext } from "./context";

/**
 * @author kamijin-fanta <https://github.com/kamijin-fanta>
 *
 * @see https://github.com/react-icons/react-icons/blob/master/packages/react-icons/src/iconBase.tsx
 */
export const IconBase = forwardRef<
	SVGSVGElement,
	IconBaseProps & { attr?: Record<string, string> }
>((props, ref): JSX.Element => {
	const elem = (conf: IconContext) => {
		const { attr, size, title, ...svgProps } = props;
		const computedSize = size || conf.size || "1em";
		let className: string | undefined;

		if (conf.className) className = conf.className;
		if (props.className)
			className = (className ? className + " " : "") + props.className;

		return (
			<svg
				ref={ref}
				stroke="currentColor"
				fill="currentColor"
				strokeWidth="0"
				{...conf.attr}
				{...attr}
				{...svgProps}
				className={className}
				style={{
					color: props.color || conf.color,
					...conf.style,
					...props.style
				}}
				height={computedSize}
				width={computedSize}
				xmlns="http://www.w3.org/2000/svg"
			>
				{title && <title>{title}</title>}
				{props.children}
			</svg>
		);
	};

	return IconContext !== undefined ? (
		<IconContext.Consumer>
			{(conf: IconContext) => elem(conf)}
		</IconContext.Consumer>
	) : (
		elem(DefaultContext)
	);
});
