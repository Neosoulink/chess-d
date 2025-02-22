import { forwardRef } from "react";

import { IconBase } from "./icon-base";
import { IconBaseProps } from "./context";

export const MenuIcon = forwardRef<SVGSVGElement, IconBaseProps>(
	({ className, ...props }, ref) => (
		<IconBase ref={ref} {...{ viewBox: "0 0 25 21", ...props }}>
			<rect y="1.5" width="25" height="2" fill="inherit" />
			<rect y="9.5" width="25" height="2" fill="inherit" />
			<rect y="17.5" width="25" height="2" fill="inherit" />
		</IconBase>
	)
);
