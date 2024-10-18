import { PieceSymbol } from "chess.js";

import { FixedArray } from "./array.interface";

export type PieceSquareTable = FixedArray<FixedArray<number, 8>, 8>;

export type PieceSquareTables = Record<PieceSymbol, PieceSquareTable>;
