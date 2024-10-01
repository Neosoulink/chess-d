import { ColorVariant } from "../enums";

export const getOppositeColor = (color: ColorVariant) =>
	color === ColorVariant.black ? ColorVariant.white : ColorVariant.black;
