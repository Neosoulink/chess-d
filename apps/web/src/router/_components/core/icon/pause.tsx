import { forwardRef } from "react";

import { IconBase } from "./icon-base";
import { IconBaseProps } from "./context";

export const PauseIcon = forwardRef<SVGSVGElement, IconBaseProps>(
	({ ...props }, ref) => (
		<IconBase ref={ref} {...{ viewBox: "0 0 17 24", ...props }}>
			<path
				d="M6.0045 0H0.75C0.336 0 0 0.336 0 0.75V23.25C0 23.664 0.336 24 0.75 24H6.0045C6.41925 24 6.7545 23.664 6.7545 23.25V0.75C6.7545 0.336 6.41925 0 6.0045 0ZM5.2545 22.5H1.5V1.5H5.2545V22.5ZM15.747 0H10.5187C10.1047 0 9.76875 0.336 9.76875 0.75V23.25C9.76875 23.664 10.1047 24 10.5187 24H15.747C16.161 24 16.497 23.664 16.497 23.25V0.75C16.497 0.336 16.1617 0 15.747 0ZM14.997 22.5H11.2687V1.5H14.997V22.5Z"
				fill="currentColor"
			/>
		</IconBase>
	)
);
