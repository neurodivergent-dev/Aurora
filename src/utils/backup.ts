import { useThemeStore } from "../store/themeStore";
import { useLanguageStore } from "../store/languageStore";
import { useMusicStore, UserPlaylist, Track } from "../store/musicStore";

export interface BackupData {
  version: string;
  timestamp: string;
  theme: {
    themeId: string;
    themeMode: "light" | "dark" | "system";
  };
  language: string;
  myPlaylists: UserPlaylist[];
  localTracks: Track[];
}

/**
 * Export all app data to JSON
 */
export const exportData = (): BackupData => {
  const theme = useThemeStore.getState();
  const language = useLanguageStore.getState().currentLanguage;
  const music = useMusicStore.getState();

  const backupData: BackupData = {
    version: "2.1.0",
    timestamp: new Date().toISOString(),
    theme: {
      themeId: theme.themeId,
      themeMode: theme.themeMode,
    },
    language: language || "en",
    myPlaylists: music.myPlaylists || [],
    localTracks: music.localTracks || [],
  };

  return backupData;
};

/**
 * Convert backup data to JSON string
 */
export const dataToJSON = (data: BackupData): string => {
  return JSON.stringify(data, null, 2);
};

/**
 * Parse JSON string to backup data
 */
export const jsonToData = (jsonString: string): BackupData | null => {
  try {
    const data = JSON.parse(jsonString);
    // Validate the data structure
    if (!data.version || !data.theme) {
      return null;
    }
    return data as BackupData;
  } catch (error) {
    console.error("Failed to parse backup JSON:", error);
    return null;
  }
};

/**
 * Import backup data to app
 */
export const importData = (data: BackupData): boolean => {
  try {
    // Import theme
    const { setThemeId, setThemeMode } = useThemeStore.getState();
    setThemeId(data.theme.themeId);
    setThemeMode(data.theme.themeMode);

    // Import language
    const { setLanguage } = useLanguageStore.getState();
    setLanguage(data.language);

    // Import Music data (playlists and local tracks)
    const { myPlaylists, localTracks } = data;
    if (myPlaylists || localTracks) {
      useMusicStore.setState({
        myPlaylists: myPlaylists || [],
        localTracks: localTracks || []
      });
    }

    return true;
  } catch (error) {
    console.error("Failed to import data:", error);
    return false;
  }
};
