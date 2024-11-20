/** @description Define the size of one board cell (or square). */
export const BOARD_CELL_SIZE = 1;

/** @description Define the board matrix range size on the **x** & **y** axes. */
export const BOARD_MATRIX_RANGE_SIZE = 8;

/** @description Define total board matrix size. */
export const BOARD_MATRIX_SIZE = BOARD_MATRIX_RANGE_SIZE ** 2;

/** @description Define the total range cells size on the **x** & **y** axes. */
export const BOARD_RANGE_CELLS_SIZE =
	BOARD_MATRIX_RANGE_SIZE * BOARD_CELL_SIZE + BOARD_CELL_SIZE;

/** @description Define the half size of {@link BOARD_RANGE_CELLS_SIZE} */
export const BOARD_RANGE_CELLS_HALF_SIZE = BOARD_RANGE_CELLS_SIZE * 0.5;
