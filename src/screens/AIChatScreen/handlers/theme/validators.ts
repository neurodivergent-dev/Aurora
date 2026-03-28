/**
 * Helper: Check if a color is light
 * Returns true for light colors like #FFFFFF, false for dark like #000000
 */
export const isLightColor = (hex: string): boolean => {
  if (!hex || typeof hex !== 'string') return true; // Default to light
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return true;

  try {
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    // Luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5; // > 0.5 = light, < 0.5 = dark
  } catch (e) {
    return true;
  }
};

/**
 * Helper: Generate complementary color
 */
export const getComplementaryColor = (hex: string): string => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return '#818CF8';
  
  try {
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    
    // Complementary: rotate hue by 180 degrees
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    
    return `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`.toUpperCase();
  } catch (e) {
    return '#818CF8';
  }
};
