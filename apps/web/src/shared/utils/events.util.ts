import { MouseEvent } from "react";

export const stopEventPropagation = (
	e: MouseEvent,
	callback?: (e: MouseEvent) => unknown
): void => {
	e.stopPropagation();
	callback?.(e);
};
