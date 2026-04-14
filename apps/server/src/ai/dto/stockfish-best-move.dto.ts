import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class StockfishBestMoveDto {
	@IsString()
	fen: string;

	@IsOptional()
	@IsInt()
	@Min(50)
	@Max(60000)
	moveTimeMs?: number;
}
