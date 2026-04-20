import { forwardRef } from "react";

import { IconBase } from "./icon-base";
import { IconBaseProps } from "./context";

export const PlayIcon = forwardRef<SVGSVGElement, IconBaseProps>(
	({ ...props }, ref) => (
		<IconBase ref={ref} {...{ viewBox: "0 0 21 24", ...props }}>
			<path
				d="M1.5274 1.50409L18.8184 11.9996L1.50409 22.4959L1.5274 1.50409ZM1.5274 0C1.27547 0 1.02428 0.0631717 0.797167 0.189515C0.319619 0.454235 0.0233135 0.958105 0.0233135 1.50409L0 22.4959C0 23.0426 0.295554 23.545 0.773102 23.8105C1.00097 23.9368 1.2514 24 1.50334 24C1.77859 24 2.05534 23.924 2.29674 23.7729L19.6111 13.2766C20.0533 13.0029 20.3225 12.5193 20.3225 11.9996C20.3225 11.48 20.0533 10.9964 19.6111 10.7227L2.32081 0.226365C2.07865 0.0759565 1.80265 0 1.5274 0Z"
				fill="currentColor"
			/>
		</IconBase>
	)
);
