import { forwardRef } from "react";

import { IconBase } from "./icon-base";
import { IconBaseProps } from "./context";

export const CrossIcon = forwardRef<SVGSVGElement, IconBaseProps>(
	({ className, ...props }, ref) => (
		<IconBase ref={ref} {...{ viewBox: "0 0 24 24", ...props }}>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M6 18L18 6M6 6l12 12"
			/>
		</IconBase>
	)
);
