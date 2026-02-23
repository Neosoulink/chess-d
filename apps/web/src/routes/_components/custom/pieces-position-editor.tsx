import { ColorSide, DEFAULT_FEN } from "@chess-d/shared";
import { Chessboard2 } from "@chrisoakman/chessboard2/dist/chessboard2.min.js";
import { validateFen } from "chess.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useGameStore } from "../../_stores";
import { Button, Icon, Input } from "../core";

export const PiecesPositionEditor = () => {
	const { initialGameState, setInitialGameState } = useGameStore();
	const { fen, playerSide } = initialGameState || {};

	const [inputFen, setInputFen] = useState(fen || DEFAULT_FEN);
	const [showMap, setShowMap] = useState(false);

	const startSide = useMemo(
		() => (inputFen?.split(" ")[1] as ColorSide) || ColorSide.white,
		[inputFen]
	);

	const defaultFen = useRef(fen || DEFAULT_FEN);
	const mapWrapperRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<Chessboard2>(null);

	const changeStartSide = useCallback(
		(side: ColorSide) => {
			const safeFen = fen || defaultFen.current;
			const [positions, _startSide, ...rest] = safeFen.split(" ");
			const newFen = `${positions} ${side} ${rest.join(" ")}`;

			if (!validateFen(newFen).ok) return;

			setInputFen(newFen);
			setInitialGameState({ ...initialGameState, fen: newFen });
		},
		[initialGameState, fen, defaultFen, setInitialGameState]
	);

	const changePlayerSide = useCallback(
		(side: ColorSide) => {
			setInitialGameState({ ...initialGameState, playerSide: side });
		},
		[initialGameState, setInitialGameState]
	);

	const changeInputFen = useCallback(
		(newFen: string) => {
			setInputFen(newFen);
			if (validateFen(newFen).ok)
				setInitialGameState({ ...initialGameState, fen: newFen });
		},
		[initialGameState, setInitialGameState]
	);

	const changeMapFen = useCallback(
		(mapBoard: Chessboard2) => {
			const safeFen = fen || defaultFen.current;
			const [positions, startSide, ...rest] = safeFen.split(" ");
			const newFen = `${mapBoard?.fen() || positions} ${startSide} ${rest.join(" ")}`;

			if (!newFen || !validateFen(newFen).ok) return;

			setInitialGameState({ ...initialGameState, fen: newFen });
			setInputFen(newFen);
		},
		[initialGameState, fen, defaultFen, setInitialGameState]
	);

	const reset = useCallback(() => {
		setInitialGameState({ fen: DEFAULT_FEN });
		setInputFen(DEFAULT_FEN);
		mapRef.current?.position(DEFAULT_FEN, true);
	}, [setInitialGameState]);

	useEffect(() => {
		const mapParentElement = mapWrapperRef.current;
		const mapElement = document.createElement("div");
		let mapBoard: Chessboard2 | undefined;

		if (showMap) {
			mapParentElement?.appendChild(mapElement);

			if (mapParentElement) {
				mapBoard = Chessboard2(mapElement, {
					draggable: true,
					onChange: () => mapBoard && changeMapFen(mapBoard)
				});
				mapBoard.position(defaultFen.current, true);
				mapRef.current = mapBoard;
			}
		}

		return () => {
			mapBoard?.destroy();
			mapElement.remove();
		};
	}, [setInitialGameState, showMap, changeMapFen]);

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
				<div className="flex-1 flex flex-col gap-4">
					<div className="flex gap-4">
						<div className="flex-1">
							<label htmlFor="fen" className="block mb-2 font-medium">
								Start Side
							</label>

							<Input
								asSelect
								value={startSide}
								onChange={(e) => changeStartSide(e.target.value as ColorSide)}
							>
								<option value={ColorSide.white}>White</option>
								<option value={ColorSide.black}>Black</option>
							</Input>
						</div>

						<div className="flex-1">
							<label htmlFor="fen" className="block mb-2 font-medium">
								Your side
							</label>

							<Input
								asSelect
								value={playerSide}
								onChange={(e) => changePlayerSide(e.target.value as ColorSide)}
							>
								<option value={ColorSide.white}>White</option>
								<option value={ColorSide.black}>Black</option>
							</Input>
						</div>
					</div>

					<div className="flex-1">
						<label htmlFor="fen" className="block mb-2 font-medium">
							Pieces Position
						</label>

						<Input
							value={inputFen}
							onChange={(e) => changeInputFen(e.target.value)}
						/>
					</div>
				</div>

				<Button className="h-11 w-11 text-2xl bg-black/30" onClick={reset}>
					<Icon.Reload />
				</Button>

				<Button
					className={`h-11 w-11 text-2xl bg-black/30 ${showMap ? "" : " text-light/90"}`}
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
