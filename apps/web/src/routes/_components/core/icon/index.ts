import { ArrowBackwardIcon } from "./arrow-backward";
import { ArrowForwardIcon } from "./arrow-forward";
import { HintIcon } from "./hint";
import { MenuIcon } from "./menu";
import { PopupIcon } from "./popup";
import { SaveIcon } from "./save";

export const Icon = {
	ArrowBackward: ArrowBackwardIcon,
	ArrowForward: ArrowForwardIcon,
	Hint: HintIcon,
	Menu: MenuIcon,
	Popup: PopupIcon,
	save: SaveIcon
} as const;

export * from "./context";
export * from "./icon-base";
