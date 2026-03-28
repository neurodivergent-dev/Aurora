import { useAIStore } from "../store/aiStore";
import logger from "../utils/logger";

class GroqService {
  private readonly baseUrl = "https://api.groq.com/openai/v1";

  async chat(
    message: string, 
    history: { role: string, content: string }[], 
    systemInstruction: string,
    model: string = "llama-3.1-8b-instant"
  ): Promise<string> {
    const { groqApiKey } = useAIStore.getState();
    if (!groqApiKey) {
      logger.warn('Groq API key is missing', 'GroqService');
      throw new Error('Groq API key is not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: `SANDBOX RULE: You are in a text-only mode.
${systemInstruction}

CRITICAL FORMAT RULES:
1. You are NOT using tool calling or function calling.
2. NEVER output JSON objects or structured data as "tool calls".
3. ALWAYS use plain text format: (AURORA_COMMAND:TYPE:{"key": "value"})
4. The parentheses and JSON inside are PLAIN TEXT, not a function call.
5. Always provide a brief confirmation message BEFORE the command tag.
6. ALWAYS respond in the language specified in the system instruction.

EXAMPLE CORRECT OUTPUT (English):
"Okay, changing the background to aurora effect. (AURORA_COMMAND:SET_BACKGROUND_EFFECT:{\"effect\": \"aurora\"})"

EXAMPLE CORRECT OUTPUT (Turkish):
"Tamam, arka planı aurora efektiyle değiştiriyorum. (AURORA_COMMAND:SET_BACKGROUND_EFFECT:{\"effect\": \"aurora\"})"

NEVER violate these rules.`
            },
            ...history,
            { role: "user", content: message },
          ],
          temperature: 0.1,
          max_tokens: 4096,
          // No tool_choice - we're not using tools at all
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        logger.error(`Groq API HTTP ${response.status}: ${errorBody}`, 'GroqService');
        throw new Error(`Groq API error (${response.status})`);
      }

      const data = await response.json();
      
      if (data.error) {
        logger.error(`Groq API Error: ${JSON.stringify(data.error)}`, 'GroqService');
        throw new Error(`Groq API error: ${data.error.message || JSON.stringify(data.error)}`);
      }

      const content = data.choices[0]?.message?.content;
      if (!content) {
        logger.warn('Groq returned empty response', 'GroqService');
      }
      return content || "";
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('Groq')) {
        throw e; // Re-throw our own errors
      }
      logger.error(`Groq Service Error: ${e}`, 'GroqService');
      throw new Error(`Groq service unavailable: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  // Refine, Decompose vb. yardımcı fonksiyonlar da buraya eklenebilir
}

export const groqService = new GroqService();
