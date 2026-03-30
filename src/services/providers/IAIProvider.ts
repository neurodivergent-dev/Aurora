export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface IAIProvider {
  /**
   * Generates a chat response from the AI provider.
   * @param message The raw user message.
   * @param history The chat history.
   * @param systemInstruction The dynamically generated system prompt/rules.
   * @param isGeneratingImage Whether the user is currently asking for an image generation.
   * @returns The string response from the AI.
   */
  chat(
    message: string,
    history: ChatHistoryItem[],
    systemInstruction: string,
    isGeneratingImage: boolean
  ): Promise<string>;
}
