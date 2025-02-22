import { forwardRef } from "react";

import { IconBase } from "./icon-base";
import { IconBaseProps } from "./context";

export const ArrowForwardIcon = forwardRef<SVGSVGElement, IconBaseProps>(
	({ className, ...props }, ref) => (
		<IconBase ref={ref} {...{ viewBox: "0 0 29 24", ...props }}>
			<path
				d="M28.1 10.9413L16.1617 0V6.54077C9.36852 6.48048 6.15273 9.15747 6.03859 9.25568C-1.33548 14.8484 0.234278 22.6707 0.250813 22.749L0.517506 24L1.23278 22.9051C6.72986 14.4857 14.3093 14.983 16.1617 15.2485V21.8826L28.1 10.9413ZM1.16877 21.1913C1.10156 18.8215 1.65149 13.8478 6.74319 9.98546C6.77359 9.95969 9.75469 7.51267 16.0086 7.51267C16.2279 7.51267 16.4519 7.51559 16.6791 7.5224L17.2285 7.53698V2.35658L26.5953 10.9413L17.2285 19.5256V14.4638L16.8205 14.3738C16.726 14.352 7.71609 12.4879 1.16877 21.1913Z"
				fill="inherit"
			/>
		</IconBase>
	)
);
