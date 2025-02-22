declare module "@chrisoakman/chessboard2/dist/chessboard2.min.js" {

	interface Chessboard2Props {
		/**
		 * @description If true, pieces on the board are draggable to other squares.
		 *
		 * @default false
		 */
		draggable?: Boolean


		/**
		 * @description
		 *
		 * If 'snapback', pieces dropped off the board will return to their original square.
		 *
		 * If 'trash', pieces dropped off the board will be removed from the board.
		 *
		 * This property has no effect when draggable is false.
		 *
		 * @default 'snapback'
		 */
		dropOffBoard?: 'snapback' | 'trash'

		/**
		 * @description
		 *
		 * `'start'` or `FEN String` or `Position Object`
		 *
		 * If provided, sets the initial position of the board.
		 *
		 * @default undefined
		 */
		position?: string | Record<string, string>

		/**
		 * @description
		 *
		 * Fires when the board position changes.
		 *
		 * The first argument to the function is the old position, the second argument is the new position.
		 *
		 * **Warning:** do not call any position-changing methods in your onChange function or you will cause an infinite loop.
		 *
		 * Position-changing methods are: clear(), move(), position(), and start().
		 */
		onChange?: () => void

		/**
		 * @description Fires when a piece is picked up.
		 *
		 * The first argument to the function is the source of the piece, the second argument is the piece, the third argument is the current position on the board, and the fourth argument is the current orientation.
		 *
		 * The drag action is prevented if the function returns false.
		 */
		onDragStart?: () => void

		/**
		 * @description
		 *
		 * Fires when a dragged piece changes location.
		 *
		 * The first argument to the function is the new location of the piece, the second argument is the old location of the piece, the third argument is the source of the dragged piece, the fourth argument is the piece, the fifth argument is the current position on the board, and the sixth argument is the current orientation.
		 */
		onDragMove?: () => void

		/**
		 * @description
		 *
		 * Fires when a piece is dropped.
		 *
		 * The first argument to the function is the source of the dragged piece, the second argument is the target of the dragged piece, the third argument is the piece, the fourth argument is the new position once the piece drops, the fifth argument is the old position before the piece was picked up, and the sixth argument is the current orientation.
		 *
		 * If `'snapback'` is returned from the function, the piece will return to it's source square.
		 *
		 * If `'trash'` is returned from the function, the piece will be removed.
		 */
		onDrop?: () => void

		/**
		 * @description
		 *
		 * Fires when the mouse leaves a square.
		 *
		 * The first argument to the function is the square that was left, the second argument is the piece on that square (or false if there is no piece), the third argument is the current position of the board, and the fourth argument is the current orientation.
		 *
		 * *Note that onMouseoutSquare will not fire during piece drag and drop. Use onDragMove.*
		 */
		onMouseoutSquare?: () => void

		/**
		 * @description
		 *
		 * Fires when the mouse enters a square.
		 *
		 * The first argument to the function is the square that was entered, the second argument is the piece on that square (or false if there is no piece), the third argument is the current position of the board, and the fourth argument is the current orientation.
		 *
		 * *Note that onMouseoverSquare will not fire during piece drag and drop. Use onDragMove.*
		 */
		onMouseoverSquare?: () => void

		/**
		 * @description
		 *
		 * Fires at the end of animations when the board position changes.
		 *
		 * The first argument to the function is the old position, the second argument is the new position.
		 */
		onMoveEnd?: () => void

		/**
		 * @description
		 *
		 * Fires when the "snapback" animation is complete when pieces are dropped off the board.
		 *
		 * The first argument to the function is the dragged piece, the second argument is the square the piece returned to, the third argument is the current position, and the fourth argument is the current orientation.
		 */
		onSnapbackEnd?: () => void

		/**
		 * @description
		 *
		 * Fires when the piece "snap" animation is complete.
		 *
		 * The first argument to the function is the source of the dragged piece, the second argument is the target of the dragged piece, and the third argument is the piece.
		 */
		onSnapEnd?: () => void

		/**
		 * @description If provided, sets the initial orientation of the board.
		 *
		 * @default 'white'
		 */
		orientation?: 'white' | 'black'

		/**
		 * @description Turn board notation on or off.
		 *
		 * @default true
		 */
		showNotation?: boolean

		/**
		 * @description
		 *
		 * If true, the board will have spare pieces that can be dropped onto the board.
		 *
		 * If sparePieces is set to true, draggable gets set to true as well.
		 *
		 * @default false
		 */
		sparePieces?: boolean

		/**
		 * @description To control how Chessboard reports errors.
		 *
		 * Every error in Chessboard has a unique code to help diagnose problems and search for solutions.
		 *
		 * If `false` then errors will be ignored.
		 *
		 * If `'console'` then errors will be sent to console.log().
		 *
		 * If `'alert'` then errors will be sent to window.alert().
		 *
		 * If `Function` then the first argument is the unique error code, the second argument is an error string, and an optional third argument is a data structure that is relevant to the error.
		 */
		showErrors?: false | 'console' | 'alert' | (() => void)

		/**
		 * @description
		 *
		 * A template string used to determine the source of piece images.
		 *
		 * If pieceTheme is a function the first argument is the piece code.
		 *
		 * The function should return an <img> source.
		 *
		 */
		pieceTheme?: string | (() => HTMLImageElement)


		/**
		 * @description
		 *
		 * Animation speed for when pieces appear on a square.
		 *
		 * Note that the "appear" animation only occurs when sparePieces is false.
		 *
		 * @default 200
		 */
		appearSpeed?: number | 'slow' | 'fast'

		/**
		 * @description Animation speed for when pieces move between squares or from spare pieces to the board.
		 *
		 * @default 200
		 */
		moveSpeed?: number | 'slow' | 'fast'


		/**
		 * @description Animation speed for when pieces that were dropped outside the board return to their original square.
		 *
		 * @default 50
		 */
		snapbackSpeed?: number | 'slow' | 'fast'

		/**
		 * @description Animation speed for when pieces "snap" to a square when dropped.
		 *
		 * @default 25
		 */
		snapSpeed?: number | 'slow' | 'fast'

		/**
		 * @description Animation speed for when pieces are removed.
		 *
		 * @default 100
		 */
		trashSpeed?: number | 'slow' | 'fast'
	}

	interface Chessboard2 {
		/**
		 * @description Removes all the pieces on the board.
		 *
		 * Alias of `position({})` and `position({}, false)`
		 *
		 * @param useAnimation If `false`, removes pieces instantly. default is `false`
		 */
		clear(useAnimation?: boolean): void

		/** @description Remove the widget from the DOM.  */
		destroy: () => void

		/**
		 * @description Returns the current position as a FEN string.
		 *
		 * Alias of `position('fen')`
		 */
		fen(): string

		/**
		 * @description
		 *
		 * Flips the board orientation.
		 *
		 * Alias of `orientation('flip')`
		 */
		flip(): void

		/**
		 * @description Executes one or more moves on the board.
		 *
		 * @param moves A list of moves in SAN format. e.g. `['e2-e4', 'g8-f6']`
		 *
		 * @returns An updated Position Object of the board including the move(s).
		 */
		move(...moves: string[]): unknown

		/**
		 * @description Returns the current position as a Position Object.
		 *
		 * @param fen If specified, return the position as a FEN string. default is a fen string
		 */
		position(fen: string): string

		/**
		 * @description Animates to a new position.
		 *
		 * @param newPosition Position `Object`, `FEN string`, or `'start'`
		 * @param useAnimation If specified, animate the move. default is `false`
		 */
		position(newPosition: string | Record<string | string>, useAnimation?: boolean): string

		/** @description Returns the current orientation of the board. */
		orientation(): 'black' | 'white'

		/**
		 * @description Sets the orientation of the board.
		 *
		 * @param side If specified, sets the orientation of the board accordingly. (`'flip'`, flips the orientation).
		 */
		orientation(side?: 'black' | 'white'| 'flip'): 'black' | 'white'

		/** @description Recalculates board and square sizes based on the parent element and redraws the board accordingly. */
		resize(): void

		/**
		 * @description
		 *
		 * Sets the board to the start position.
		 *
		 * Alias of `position('start')` and `position('start', false)`
		 *
		 * @param useAnimation If is false, sets the position instantly.
		 *
		 * @default false
		 */
		start(useAnimation?: boolean): void

		addArrow: (l: any, m: any, n: any, p: any) => unknown
		addCircle: (l: any, m: any, n: any, p: any) => unknown
		addItem: (l: any, m: any, n: any, p: any) => unknown
		arrows: (l: any, m: any, n: any, p: any) => unknown
		circles: (l: any, m: any, n: any, p: any) => unknown
		clearArrows: (l: any, m: any, n: any, p: any) => unknown
		clearCircles: (l: any, m: any, n: any, p: any) => unknown
		clearItems: () => unknown
		clearPieces: (l: any, m: any, n: any, p: any) => unknown
		config: (l: any, m: any, n: any, p: any) => unknown
		coordinates: () => unknown
		getArrows: (l: any, m: any, n: any, p: any) => unknown
		getCircles: (l: any, m: any, n: any, p: any) => unknown
		getConfig: (l: any, m: any, n: any, p: any) => unknown
		getCoordinates: () => unknown
		getItems: (l: any, m: any, n: any, p: any) => unknown
		getOrientation: (l: any, m: any, n: any, p: any) => unknown
		getPieces: (l: any, m: any, n: any, p: any) => unknown
		getPosition: (l: any, m: any, n: any, p: any) => unknown
		hideCoordinates: (l: any, m: any, n: any, p: any) => unknown
		items: (l: any, m: any, n: any, p: any) => unknown
		moveItem: (l: any, m: any, n: any, p: any) => unknown
		pieces: (l: any, m: any, n: any, p: any) => unknown
		removeArrow: (l: any, m: any, n: any, p: any) => unknown
		removeCircle: (l: any, m: any, n: any, p: any) => unknown
		removeItem: (l: any, m: any, n: any, p: any) => unknown
		setConfig: (l: any, m: any, n: any, p: any) => unknown
		setCoordinates: () => unknown
		setOrientation: (l: any, m: any, n: any, p: any) => unknown
		setPosition: (l: any, m: any, n: any, p: any) => unknown
		showCoordinates: (l: any, m: any, n: any, p: any) => unknown
		toggleCoordinates: (l: any, m: any, n: any, p: any) => unknown
	}


	function Chessboard2(ref: string | HTMLElement, props: string | Chessboard2Props): Chessboard2

	export { Chessboard2 }
}

