import OpenAI from "openai";

/**
 * DashScope (Alibaba Cloud Qwen) — OpenAI-compatible mode.
 *
 * Env (.env.local / Vercel):
 *   DASHSCOPE_API_KEY   — key from Alibaba Cloud Model Studio
 *   DASHSCOPE_BASE_URL  — https://dashscope-intl.aliyuncs.com/compatible-mode/v1
 *   QWEN_MODEL          — text model, e.g. qwen3.7-max-2026-05-20
 *   QWEN_VL_MODEL       — vision model, e.g. qwen-vl-max
 *
 * The client is created LAZILY so `next build` never throws on a missing key.
 */
let _qwen: OpenAI | null = null;

export function getQwen(): OpenAI {
  if (!_qwen) {
    _qwen = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL:
        process.env.DASHSCOPE_BASE_URL ??
        "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    });
  }
  return _qwen;
}

export const QWEN_MODEL = process.env.QWEN_MODEL ?? "qwen3.7-max-2026-05-20";
export const QWEN_VL_MODEL = process.env.QWEN_VL_MODEL ?? "qwen-vl-max";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * qwen3.7-max is a THINKING model — it emits reasoning_content and burns
 * reasoning tokens by default. For a snappy demo we disable it via the
 * Qwen-specific enable_thinking flag (passed through the request body).
 */
export const NO_THINK = { enable_thinking: false } as Record<string, unknown>;

/**
 * Text completion → parsed JSON.
 *
 * DashScope supports response_format { type: "json_object" } ONLY (no json_schema),
 * so the exact shape must be described IN THE PROMPT. Returns null on any
 * network/parse failure so the CALLER can surface an honest error instead of
 * masking a model outage as a valid (empty) result.
 */
export async function qwenJSON<T>(opts: {
  system: string;
  user: string;
  model?: string;
  think?: boolean;
}): Promise<T | null> {
  try {
    const res = await getQwen().chat.completions.create({
      model: opts.model ?? QWEN_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      // Deep-reasoning mode is opt-in. When off we disable thinking for speed.
      enable_thinking: opts.think === true,
    } as never);
    const raw = res.choices[0]?.message?.content ?? "{}";
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error("qwenJSON error:", (err as Error).message);
    return null;
  }
}

/**
 * Vision completion → parsed JSON. Takes a base64 data URL
 * (data:image/jpeg;base64,...). Uses qwen-vl-max. Returns null on failure so
 * the caller can surface an honest error rather than a fake result.
 */
export async function qwenVisionJSON<T>(opts: {
  system: string;
  instruction: string;
  imageDataUrl: string;
}): Promise<T | null> {
  try {
    const res = await getQwen().chat.completions.create({
      model: QWEN_VL_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: opts.system },
        {
          role: "user",
          content: [
            { type: "text", text: opts.instruction },
            { type: "image_url", image_url: { url: opts.imageDataUrl } },
          ],
        },
      ],
    } as never);
    const raw = res.choices[0]?.message?.content ?? "{}";
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error("qwenVisionJSON error:", (err as Error).message);
    return null;
  }
}
