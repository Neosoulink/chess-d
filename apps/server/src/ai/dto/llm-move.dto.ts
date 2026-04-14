import { SupportedAiProvider } from "@chess-d/shared";
import { IsArray, IsIn, IsOptional, IsString } from "class-validator";

export class LlmMoveDto {
	@IsIn(Object.values(SupportedAiProvider))
	provider: SupportedAiProvider;

	@IsString()
	fen: string;

	@IsArray()
	@IsString({ each: true })
	legalUci: string[];

	@IsOptional()
	@IsString()
	model?: string;
}
