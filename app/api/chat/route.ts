import { NextRequest } from "next/server";
import type OpenAI from "openai";
import { getQwen, QWEN_MODEL, NO_THINK, type ChatMessage } from "@/lib/qwen";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are "Saathi", a warm, trustworthy AI civic companion for Indian citizens (part of the Smart Bharat platform).
Your job: make government services simple and accessible for everyone.
- Explain complex government schemes, documents, and processes in plain, simple language.
- Recommend relevant public services and list the exact documents a citizen needs.
- Help citizens report public issues (potholes, garbage, water, electricity) and understand next steps.
- Be concise, friendly, and use short paragraphs or bullet points.
- Never invent scheme names, amounts, or numbers you are unsure about — tell the citizen to verify on the official portal.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, language } = (await req.json()) as {
      messages: ChatMessage[];
      language?: string;
    };

    if (!process.env.DASHSCOPE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "DASHSCOPE_API_KEY is not set. Add it in .env.local or Vercel env vars." }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const langLine = language
      ? `\nAlways reply in ${language}, regardless of the language the question is written in.`
      : `\nReply in the same language the citizen writes in.`;

    const stream = await getQwen().chat.completions.create({
      model: QWEN_MODEL,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + langLine },
        ...(messages ?? []),
      ],
      ...NO_THINK,
    } as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content ?? "";
            if (token) controller.enqueue(encoder.encode(token));
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode("\n\n[stream error] " + (err as Error).message)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
