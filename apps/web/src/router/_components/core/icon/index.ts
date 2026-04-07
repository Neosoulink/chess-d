import { ActionRedoIcon } from "./action-redo";
import { ActionUndoIcon } from "./action-undo";
import { CameraIcon } from "./camera";
import { ChatIcon } from "./chat";
import { ChessBishopIcon } from "./chess-bishop";
import { ChessboardIcon } from "./chessboard";
import { ChessKingIcon } from "./chess-king";
import { ChessKnightIcon } from "./chess-knight";
import { ChessPawnIcon } from "./chess-pawn";
import { ChessQueenIcon } from "./chess-queen";
import { ChessRookIcon } from "./chess-rook";
import { CrossIcon } from "./cross";
import { ExportIcon } from "./export";
import { FlagIcon } from "./flag";
import { GlobeIcon } from "./globe";
import { HandSignIcon } from "./hand-sign";
import { HintIcon } from "./hint";
import { HomeIcon } from "./home";
import { HourglassIcon } from "./hourglass";
import { LinkIcon } from "./link";
import { MenuIcon } from "./menu";
import { PictureIcon } from "./picture";
import { PopupIcon } from "./popup";
import { ProcessorIcon } from "./processor";
import { RefreshIcon } from "./refresh";
import { ReloadIcon } from "./reload";
import { RocketIcon } from "./rocket";
import { SaveIcon } from "./save";
import { SettingIcon } from "./setting";
import { ShareIcon } from "./share";
import { SunIcon } from "./sun";
import { TrashIcon } from "./trash";
import { VolumeOffIcon } from "./volume-off";
import { VolumeOnIcon } from "./volume-on";

export const Icon = {
	ActionRedo: ActionRedoIcon,
	ActionUndo: ActionUndoIcon,
	Camera: CameraIcon,
	Chat: ChatIcon,
	ChessBishop: ChessBishopIcon,
	Chessboard: ChessboardIcon,
	ChessKing: ChessKingIcon,
	ChessKnight: ChessKnightIcon,
	ChessPawn: ChessPawnIcon,
	ChessQueen: ChessQueenIcon,
	ChessRook: ChessRookIcon,
	Cross: CrossIcon,
	Export: ExportIcon,
	Flag: FlagIcon,
	Globe: GlobeIcon,
	HandSign: HandSignIcon,
	Hint: HintIcon,
	Home: HomeIcon,
	Hourglass: HourglassIcon,
	Link: LinkIcon,
	Menu: MenuIcon,
	Picture: PictureIcon,
	Popup: PopupIcon,
	Processor: ProcessorIcon,
	Refresh: RefreshIcon,
	Reload: ReloadIcon,
	Rocket: RocketIcon,
	Save: SaveIcon,
	Setting: SettingIcon,
	Sun: SunIcon,
	Share: ShareIcon,
	Trash: TrashIcon,
	VolumeOff: VolumeOffIcon,
	VolumeOn: VolumeOnIcon
} as const;

export type IconKey = keyof typeof Icon;

export * from "./context";
export * from "./icon-base";
