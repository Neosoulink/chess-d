import { ColorSide, DEFAULT_FEN } from "@chess-d/shared";
import { Chessboard2 } from "@chrisoakman/chessboard2/dist/chessboard2.min.js";

import { Button, Icon, Input } from "../core";
import { useCallback, useEffect, useRef, useState } from "react";
import { validateFen } from "chess.js";
import { useGameStore } from "../../_stores";

export const PiecesPositionEditor = () => {
	const { fen, setFen } = useGameStore();
	const [inputFen, setInputFen] = useState(fen || DEFAULT_FEN);
	const [showMap, setShowMap] = useState(false);

	const defaultFen = useRef(fen || DEFAULT_FEN);
	const mapWrapperRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<Chessboard2>(null);

	const changeSide = useCallback(
		(side: ColorSide) => {
			const newFen = `${fen?.split(" ")[0]} ${side} KQkq - 0 1`;

			if (!validateFen(newFen).ok) return;

			setInputFen(newFen);
			setFen(newFen);
		},
		[fen, setFen]
	);

	const reset = useCallback(() => {
		setFen(DEFAULT_FEN);
		setInputFen(DEFAULT_FEN);
		mapRef.current?.position(DEFAULT_FEN, true);
	}, [setFen]);

	useEffect(() => {
		const mapParentElement = mapWrapperRef.current;
		const mapElement = document.createElement("div");
		let mapBoard: Chessboard2 | undefined;

		if (showMap) {
			mapParentElement?.appendChild(mapElement);

			if (mapParentElement) {
				mapBoard = Chessboard2(mapElement, {
					draggable: true,
					onChange: () => {
						const newFen = `${mapBoard?.fen()} w KQkq - 0 1`;

						if (!newFen || !validateFen(newFen).ok) return;

						setFen(newFen);
						setInputFen(newFen);
					}
				});

				mapBoard.position(defaultFen.current, true);
				mapRef.current = mapBoard;
			}
		}

		return () => {
			mapBoard?.destroy();
			mapElement.remove();
		};
	}, [setFen, showMap]);

	useEffect(() => {
		if (fen && validateFen(fen).ok) {
			defaultFen.current = fen;
			setTimeout(() => {
				mapRef.current?.position(fen, true);
			}, 0);
		}
	}, [fen]);

	return (
		<div className="flex flex-col gap-2 items-center">
			<div className="flex gap-2 items-end w-full">
				<div className="flex-1 flex gap-4">
					<div>
						<label htmlFor="fen" className="block mb-2 font-medium">
							Your side
						</label>

						<Input
							asSelect
							onChange={(e) => {
								changeSide(e.target.value as ColorSide);
							}}
						>
							<option value={ColorSide.white}>White</option>
							<option value={ColorSide.black}>Black</option>
						</Input>
					</div>

					<div className="flex-1">
						<label htmlFor="fen" className="block mb-2 font-medium">
							Pieces Position
						</label>

						<Input
							value={inputFen}
							onChange={(e) => {
								const newFen = e.target.value;
								setInputFen(newFen);

								if (validateFen(newFen).ok) setFen(newFen);
							}}
						/>
					</div>
				</div>

				<Button className="h-11 w-11 text-2xl bg-black/30" onClick={reset}>
					<Icon.Reload />
				</Button>

				<Button
					className={`h-11 w-11 text-2xl bg-black/30 ${showMap ? "" : "!opacity-30 hover:!opacity-100"}`}
					onClick={() => setShowMap(!showMap)}
				>
					<Icon.Chessboard />
				</Button>
			</div>

			{showMap && (
				<div ref={mapWrapperRef} className="h-52 w-52 pointer-events-auto" />
			)}
		</div>
	);
};
