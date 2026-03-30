export type UIEffectType = 'SHOW_RESET_ALERT' | 'RATE_APP';

export interface UIEffect {
  type: UIEffectType;
  data?: any;
}

export const handleInlineActions = (
  response: string
): { cleanResponse: string; effects: UIEffect[] } => {
  let cleanResponse = response;
  const effects: UIEffect[] = [];

  // RESET_ALL_DATA
  if (
    response.includes('[ACTION:RESET_ALL_DATA]') ||
    response.includes('(AURORA_COMMAND:RESET_ALL_DATA)')
  ) {
    cleanResponse = cleanResponse
      .replace('[ACTION:RESET_ALL_DATA]', '')
      .replace('(AURORA_COMMAND:RESET_ALL_DATA)', '')
      .trim();
    effects.push({ type: 'SHOW_RESET_ALERT' });
  }

  // RATE_APP
  if (
    response.includes('[ACTION:RATE_APP]') ||
    response.includes('(AURORA_COMMAND:RATE_APP)')
  ) {
    cleanResponse = cleanResponse
      .replace('[ACTION:RATE_APP]', '')
      .replace('(AURORA_COMMAND:RATE_APP)', '')
      .trim();
    effects.push({ type: 'RATE_APP' });
  }

  return { cleanResponse, effects };
};
