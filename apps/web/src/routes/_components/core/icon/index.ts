import { ArrowBackwardIcon } from "./arrow-backward";
import { ArrowForwardIcon } from "./arrow-forward";
import { BishopIcon } from "./bishop";
import { ChessboardIcon } from "./chessboard";
import { CrossIcon } from "./cross";
import { ExportIcon } from "./export";
import { HintIcon } from "./hint";
import { HourglassIcon } from "./hourglass";
import { KingIcon } from "./king";
import { KnightIcon } from "./knight";
import { MenuIcon } from "./menu";
import { PawnIcon } from "./pawn";
import { PopupIcon } from "./popup";
import { QueenIcon } from "./queen";
import { RefreshIcon } from "./refresh";
import { ReloadIcon } from "./reload";
import { RookIcon } from "./rook";
import { SaveIcon } from "./save";
import { ShareIcon } from "./share";

export const Icon = {
	ArrowBackward: ArrowBackwardIcon,
	ArrowForward: ArrowForwardIcon,
	Bishop: BishopIcon,
	Chessboard: ChessboardIcon,
	Cross: CrossIcon,
	Export: ExportIcon,
	Hint: HintIcon,
	Hourglass: HourglassIcon,
	king: KingIcon,
	Knight: KnightIcon,
	Menu: MenuIcon,
	Pawn: PawnIcon,
	Popup: PopupIcon,
	Queen: QueenIcon,
	Refresh: RefreshIcon,
	Reload: ReloadIcon,
	Rook: RookIcon,
	Save: SaveIcon,
	Share: ShareIcon
} as const;

export * from "./context";
export * from "./icon-base";
