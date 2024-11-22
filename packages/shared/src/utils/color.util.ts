import { ColorSide } from "../enums";

export const getOppositeColorSide = (color: ColorSide) =>
	color === ColorSide.black ? ColorSide.white : ColorSide.black;
