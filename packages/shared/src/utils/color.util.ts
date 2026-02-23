import { Color } from "chess.js";
import { ColorSide } from "../enums";

export const getOppositeColorSide = (color: ColorSide) =>
	color === ColorSide.black ? ColorSide.white : ColorSide.black;

export const getColorSideFromTurn = (turn: Color) =>
	turn === "w" ? ColorSide.white : ColorSide.black;
