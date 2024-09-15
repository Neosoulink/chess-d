import { Intersection } from "three";
import { PieceModel, PiecesGroupModel } from "../models";

export type PieceId = number;

export interface PieceUpdatePayload {
	intersection?: Intersection<PiecesGroupModel>;
	piece: PieceModel;
}
