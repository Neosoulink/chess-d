import { Move } from "chess.js";

export type MoveLike = Pick<Move, "from" | "to" | "color" | "piece">;
