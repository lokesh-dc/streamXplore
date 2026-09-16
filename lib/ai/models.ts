import { groq } from "@ai-sdk/groq";

/**
 * Groq provides OpenAI-compatible endpoints on fast LPU hardware.
 * These models are free on Groq's free tier (subject to rate limits).
 *
 * Model IDs live in the environment so they can be switched without a redeploy:
 *   GROQ_MODEL          - capable model for chat / search / recommendations
 *   GROQ_FAST_MODEL     - lightweight model for summaries / insights
 */

export const REASONING_MODEL_ID =
	process.env.GROQ_MODEL || process.env.GROQ_REASONING_MODEL || "openai/gpt-oss-120b";
export const FAST_MODEL_ID = process.env.GROQ_FAST_MODEL || "openai/gpt-oss-20b";

/**
 * Reasoning-capable model. Used for the chatbot, semantic search compilation,
 * and recommendation curation where tool-calling quality matters.
 */
export const reasoningModel = () => groq(REASONING_MODEL_ID);

/**
 * Fast/cheap model. Used for lighter tasks like summarization and
 * watchlist insights where a smaller model is sufficient.
 */
export const fastModel = () => groq(FAST_MODEL_ID);