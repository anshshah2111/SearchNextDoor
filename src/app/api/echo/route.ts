import { ECHO_SYSTEM_PROMPT } from "@/lib/echo-prompt";
import { getEchoFallback } from "@/lib/echo-fallback";

export async function POST(req: Request) {
  const { history, intent } = await req.json();
  // history: [{ role: "user" | "assistant", content: string }]
  // intent: "opener" | "discovery" | "checkin" | "closer" | "freeform"

  // Try Anthropic API if key is available
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey });

      const messages = [...(history || [])];
      if (intent && intent !== "freeform") {
        messages.push({
          role: "user",
          content: `[SYSTEM: intent=${intent}. Respond as Echo for this beat. Stay in character. One short response.]`,
        });
      }

      // Ensure messages alternate correctly
      const cleanMessages = ensureAlternating(messages);

      const response = await client.messages.create({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 200,
        system: ECHO_SYSTEM_PROMPT,
        messages: cleanMessages,
      });

      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b.type === "text" ? b.text : ""))
        .join(" ");

      return Response.json({ text, source: "anthropic" });
    } catch (error) {
      console.error("Anthropic API error, falling back:", error);
    }
  }

  // Fallback to pre-scripted responses
  const text = getEchoFallback(intent || "freeform");
  return Response.json({ text, source: "fallback" });
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
      // Merge consecutive same-role messages
      result[result.length - 1].content += " " + msg.content;
    } else {
      result.push({ role, content: msg.content });
    }
  }

  // Ensure first message is from user
  if (result.length > 0 && result[0].role !== "user") {
    result.unshift({ role: "user", content: "[Starting walk]" });
  }

  return result;
}
