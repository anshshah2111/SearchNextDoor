import { ECHO_SYSTEM_PROMPT } from "@/lib/echo-prompt";
import { getEchoFallback } from "@/lib/echo-fallback";

// Provider priority: OLLAMA (local/free) > GROQ (free cloud) > ANTHROPIC (paid) > fallback
// Set one of these in .env.local:
//   OLLAMA_HOST=http://localhost:11434   (default, just install Ollama)
//   GROQ_API_KEY=gsk_xxx                (free at console.groq.com)
//   ANTHROPIC_API_KEY=sk-ant-xxx        (paid)

export async function POST(req: Request) {
  const { history, intent } = await req.json();

  const messages = [...(history || [])];
  if (intent && intent !== "freeform") {
    messages.push({
      role: "user",
      content: `[SYSTEM: intent=${intent}. Respond as Echo for this beat. Stay in character. One short response.]`,
    });
  }

  const cleanMessages = ensureAlternating(messages);

  // 1. Try Ollama (local, completely free) — quick ping then call
  const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2";
  if (await isOllamaRunning(ollamaHost)) {
    try {
      const text = await callOllama(ollamaHost, ollamaModel, cleanMessages);
      if (text) return Response.json({ text, source: "ollama" });
    } catch {
      // Ollama responded to ping but chat failed, try next provider
    }
  }

  // 2. Try Groq (free cloud tier — 30 req/min, fast inference)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const text = await callGroq(groqKey, cleanMessages);
      if (text) return Response.json({ text, source: "groq" });
    } catch (e) {
      console.error("Groq error:", e);
    }
  }

  // 3. Try Anthropic (paid)
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    try {
      const text = await callAnthropic(anthropicKey, cleanMessages);
      if (text) return Response.json({ text, source: "anthropic" });
    } catch (e) {
      console.error("Anthropic error:", e);
    }
  }

  // 4. Fallback to pre-scripted responses (always works, no setup)
  const text = getEchoFallback(intent || "freeform");
  return Response.json({ text, source: "fallback" });
}

/** Quick check if Ollama is running (1s timeout so it doesn't block) */
async function isOllamaRunning(host: string): Promise<boolean> {
  try {
    const res = await fetch(host, { signal: AbortSignal.timeout(1000) });
    return res.ok;
  } catch {
    return false;
  }
}

/** Ollama — local LLM, completely free. Install: https://ollama.com */
async function callOllama(
  host: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<string | null> {
  // Ollama uses OpenAI-compatible chat API
  const response = await fetch(`${host}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: ECHO_SYSTEM_PROMPT },
        ...messages,
      ],
      stream: false,
      options: {
        num_predict: 150, // Keep responses short like Echo
        temperature: 0.7,
      },
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.message?.content?.trim() || null;
}

/** Groq — free cloud tier, OpenAI-compatible API. Get key: console.groq.com */
async function callGroq(
  apiKey: string,
  messages: { role: string; content: string }[]
): Promise<string | null> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: ECHO_SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

/** Anthropic Claude — paid API */
async function callAnthropic(
  apiKey: string,
  messages: { role: string; content: string }[]
): Promise<string | null> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 200,
    system: ECHO_SYSTEM_PROMPT,
    messages: messages as { role: "user" | "assistant"; content: string }[],
  });

  return response.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join(" ")
    .trim() || null;
}

/** Ensure messages alternate between user and assistant */
function ensureAlternating(
  messages: { role: string; content: string }[]
): { role: "user" | "assistant"; content: string }[] {
  if (messages.length === 0) return [];

  const result: { role: "user" | "assistant"; content: string }[] = [];
  for (const msg of messages) {
    const role = msg.role as "user" | "assistant";
    if (result.length > 0 && result[result.length - 1].role === role) {
      result[result.length - 1].content += " " + msg.content;
    } else {
      result.push({ role, content: msg.content });
    }
  }

  if (result.length > 0 && result[0].role !== "user") {
    result.unshift({ role: "user", content: "[Starting walk]" });
  }

  return result;
}
