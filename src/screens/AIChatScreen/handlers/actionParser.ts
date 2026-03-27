import { AIAction } from '../../../types/chat';

export const findAction = (response: string, type: string): AIAction | null => {
  try {
    const uType = type.toUpperCase();
    const variations = [
      `(AURORA_COMMAND:${uType}:`,
      `(AURORA_COMMAND:${uType}=`,
      `[ACTION:${uType}:`,
      `[ACTION:${uType}=`,
      `[${uType}:`,
      `[${uType}=`,
      `[ACTION:${uType}]`,
      `[${uType}]`,
      `(AURORA_COMMAND:${uType})`
    ];

    for (const prefix of variations) {
      const uPrefix = prefix.toUpperCase();
      const uResponse = response.toUpperCase();
      const startIndex = uResponse.indexOf(uPrefix);

      if (startIndex !== -1) {
        console.log(`[ACTION PARSER] Match found for prefix: ${prefix} at index: ${startIndex}`);
        const closer = prefix.startsWith('(') ? ')' : ']';
        const lastIndex = response.indexOf(closer, startIndex);

        if (lastIndex !== -1) {
          const fullMatch = response.substring(startIndex, lastIndex + 1);

          // Handle tags without data (e.g., [ACTION:RESET_ALL_DATA] or (AURORA_COMMAND:PAUSE_MUSIC))
          if (prefix.endsWith(']') || prefix.endsWith(')')) {
            return {
              fullMatch,
              type: uType,
              data: null,
              regex: { [Symbol.replace]: (str: string) => str.replace(fullMatch, '') }
            };
          }

          // Extract data part (preserving case)
          const dataPart = response.substring(startIndex + prefix.length, lastIndex).trim();
          console.log(`[ACTION PARSER] Data part extracted: "${dataPart}"`);

          return {
            fullMatch,
            type: uType,
            data: dataPart,
            regex: { [Symbol.replace]: (str: string) => str.replace(fullMatch, '') }
          };
        } else {
          // If no closer found, but we have a match for the prefix, check for missing closing parenthesis
          console.warn(`[ACTION PARSER] Found prefix ${prefix} but no closing ${closer}`);
        }
      }
    }
  } catch (error) {
    console.error("[ACTION PARSER] Error:", error);
    return null;
  }
  return null;
};

export const parseActionData = (jsonStr: string | null): any => {
  if (!jsonStr) return null;

  const rawClean = jsonStr.trim();
  const escapeNewlines = (str: string) => str.replace(/\n/g, '\\n').replace(/\r/g, '\\r');

  try {
    // Strategy 1: The standard approach with newline escaping
    const escaped = escapeNewlines(rawClean.replace(/```json|```|`/g, '').trim());
    return JSON.parse(escaped);
  } catch (e) {
    console.log(`[ACTION PARSER] Strategy 1 failed, trying manual extraction...`);
    // Strategy 2: Manual Key-Value Extraction (Best for lyrics or broken JSON)
    try {
      const data: any = {};
      
      // Generic string/value matching for simple keys
      const simpleKeys = ['themeId', 'effect', 'isDark', 'lang', 'trackId', 'imageUrl', 'route', 'level'];
      simpleKeys.forEach(key => {
        // Match "key": "value" or "key": value
        const regex = new RegExp(`"${key}"\\s*:\\s*(?:"([^"]+)"|([^,}]+))`);
        const match = rawClean.match(regex);
        if (match) {
          const val = match[1] || match[2];
          if (val !== undefined) {
            const trimmedVal = val.trim();
            if (trimmedVal === 'true') data[key] = true;
            else if (trimmedVal === 'false') data[key] = false;
            else data[key] = trimmedVal;
          }
        }
      });

      // Special handling for lyrics which can span multiple lines
      const lyricsStartTag = '"lyrics"';
      const lyricsStartIndex = rawClean.indexOf(lyricsStartTag);
      if (lyricsStartIndex !== -1) {
        const afterLyricsKey = rawClean.substring(lyricsStartIndex + lyricsStartTag.length);
        const firstQuote = afterLyricsKey.indexOf('"');
        if (firstQuote !== -1) {
          const remaining = afterLyricsKey.substring(firstQuote + 1);
          const lastQuote = remaining.lastIndexOf('"');
          if (lastQuote !== -1) {
            data.lyrics = remaining.substring(0, lastQuote);
          }
        }
      }
      if (Object.keys(data).length > 0) return data;
    } catch (innerE) { }

    // Strategy 3: Aggressive JSON cleanup (Find first { and last })
    try {
      const start = rawClean.indexOf('{');
      const end = rawClean.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const segment = rawClean.substring(start, end + 1);
        return JSON.parse(escapeNewlines(segment));
      }
    } catch (e3) { }
  }
  return null;
};
