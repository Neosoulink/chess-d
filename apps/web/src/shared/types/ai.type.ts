import { AiRegisterOptions, SupportedAiModel } from "@chess-d/ai";

export type AiWillPerformMovePayload = {
	ai: SupportedAiModel;
	fen: string;
	registerOptions?: AiRegisterOptions;
};
