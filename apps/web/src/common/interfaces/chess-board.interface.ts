export interface BoardPosition {
	col: number;
	row: number;
}

export interface BoardMatrix extends BoardPosition {
	isBlack: boolean;
}
