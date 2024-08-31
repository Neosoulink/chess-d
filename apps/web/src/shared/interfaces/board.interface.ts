/** @description Location on the board. */
export interface BoardCoords {
	/** @description Also known as **[file](https://en.wikipedia.org/wiki/Glossary_of_chess#file)** */
	col: number;
	/** @description Also known as **[rank](https://en.wikipedia.org/wiki/Chessboard#:~:text=are%20known%20as-,ranks,-%2C%20and%20the%20lines)** */
	row: number;
}

/** @description Board cell (or square). */
export interface BoardCell extends BoardCoords {
	isBlack: boolean;
}
