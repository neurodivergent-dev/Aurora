import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { exportData, dataToJSON } from '../../../utils/backup';
import { useLanguageStore } from '../../../store/languageStore';
import { useThemeStore } from '../../../store/themeStore';
import { useAIStore } from '../../../store/aiStore';
import { findAction } from './actionParser';

export const handleBackupActions = (response: string, t?: (key: string) => string): { cleanResponse: string; changed: boolean } => {
  let cleanResponse = response;
  let changed = false;

  try {
    // 1. EXPORT_DATA
    const exportMatch = findAction(cleanResponse, 'EXPORT_DATA');
    if (exportMatch) {
      const data = exportData();
      const jsonString = dataToJSON(data);
      const fileName = `aurora-backup-${new Date().toISOString().split("T")[0]}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      FileSystem.writeAsStringAsync(filePath, jsonString).then(() => {
        Sharing.isAvailableAsync().then((canShare) => {
          if (canShare) Sharing.shareAsync(filePath);
        });
      });
      
      cleanResponse = cleanResponse.replace(exportMatch.regex as any, '').trim();
      changed = true;
    }

    // 2. OPEN_BACKUP_SETTINGS
    const backupSettingsMatch = findAction(cleanResponse, 'OPEN_BACKUP_SETTINGS');
    if (backupSettingsMatch) {
      cleanResponse = cleanResponse.replace(backupSettingsMatch.regex as any, '').trim();
      setTimeout(() => router.push('/backup-settings'), 3000);
      changed = true;
    }
  } catch (error) { 
    console.error('[BACKUP HANDLER] Error:', error);
  }

  return { cleanResponse, changed };
};
