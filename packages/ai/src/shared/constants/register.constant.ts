import { SupportedAiModelKey } from "../enums";

export const SUPPORTED_AI_MODEL_LABELS: Record<SupportedAiModelKey, string> = {
	[SupportedAiModelKey.basicBot]: "Basic bot (local)",
	[SupportedAiModelKey.zeyu]: "Zeyu minimax (local)",
	[SupportedAiModelKey.stockfish]: "Stockfish (chess-api.com)",
	[SupportedAiModelKey.openAiChatGpt]: "OpenAI ChatGPT (server)",
	[SupportedAiModelKey.googleGemini]: "Google Gemini (server)",
	[SupportedAiModelKey.anthropicClaude]: "Anthropic Claude (server)"
};
