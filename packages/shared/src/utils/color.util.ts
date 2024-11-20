import { ColorSide } from "../enums";

export const getOppositeSide = (color: ColorSide) =>
	color === ColorSide.black ? ColorSide.white : ColorSide.black;
