export interface BoardCoords {
	col: number;
	row: number;
}

export interface BoardCell extends BoardCoords {
	isBlack: boolean;
}
