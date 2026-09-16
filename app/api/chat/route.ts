import { convertToModelMessages, streamText, stepCountIs } from "ai";

import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { reasoningModel } from "@/lib/ai/models";
import { tmdbTools } from "@/lib/ai/tools";

export const runtime = "nodejs";
export const maxDuration = 60;

const json = (body: object, status: number) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

export async function POST(req: Request) {
	if (!process.env.GROQ_API_KEY) {
		return json({ error: "GROQ_API_KEY is not configured on the server." }, 500);
	}

	let messages;
	try {
		({ messages } = await req.json());
	} catch (error) {
		return json({ error: "Invalid request body." }, 400);
	}

	if (!Array.isArray(messages) || messages.length === 0) {
		return json({ error: "A conversation history is required." }, 400);
	}

	const modelMessages = await convertToModelMessages(messages, { tools: tmdbTools });

	const result = streamText({
		model: reasoningModel(),
		system: CHAT_SYSTEM_PROMPT,
		messages: modelMessages,
		tools: tmdbTools,
		stopWhen: stepCountIs(6),
	});

	return result.toUIMessageStreamResponse();
}