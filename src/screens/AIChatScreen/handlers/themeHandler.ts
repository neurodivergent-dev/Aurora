import { findAction } from './actionParser';
import logger from '../../../utils/logger';
import { 
  handleSetDarkMode, 
  handleSetAppTheme, 
  handleCreateTheme 
} from './theme';

export const handleThemeActions = (response: string): { cleanResponse: string; changed: boolean } => {
  let cleanResponse = response;
  let changed = false;

  try {
    // 1. SET_DARK_MODE
    const darkMatch = findAction(cleanResponse, 'SET_DARK_MODE');
    if (darkMatch) {
      const result = handleSetDarkMode(cleanResponse, darkMatch);
      if (result.changed) {
        cleanResponse = result.newResponse;
        changed = true;
      }
    }

    // 2. SET_APP_THEME
    const themeMatch = findAction(cleanResponse, 'SET_APP_THEME');
    if (themeMatch) {
      const result = handleSetAppTheme(cleanResponse, themeMatch);
      if (result.changed) {
        cleanResponse = result.newResponse;
        changed = true;
      }
    }

    // 3. CREATE_THEME
    const createThemeMatch = findAction(cleanResponse, 'CREATE_THEME');
    if (createThemeMatch) {
      const result = handleCreateTheme(cleanResponse, createThemeMatch);
      if (result.changed) {
        cleanResponse = result.newResponse;
        changed = true;
      }
    }
  } catch (error) {
    logger.error(`Critical Error in ThemeHandler: ${error}`, 'ThemeHandler');
  }

  return { cleanResponse: cleanResponse.trim(), changed };
};
