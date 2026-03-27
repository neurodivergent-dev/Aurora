import * as Haptics from 'expo-haptics';
import { useMusicStore } from '../../../store/musicStore';
import { useAIStore } from '../../../store/aiStore';
import { findAction, parseActionData } from './actionParser';
import * as FileSystem from 'expo-file-system/legacy';

const cleanCommand = (text: string, match: any) => {
  return text.replace(match.regex as any, '').split('\n').filter(line => line.trim() !== '').join('\n').trim();
};

export const handleMusicActions = (response: string): { cleanResponse: string; changed: boolean } => {
  let cleanResponse = response;
  let changed = false;
  const { 
    play, pause, next, setCurrentTrack, playlist, 
    setTrackArtwork, currentTrack, setTrackLyrics,
    createPlaylist, updatePlaylist, deletePlaylist, setVolume, loadLocalMusic, toggleFavorite, prev, toggleShuffle, toggleRepeat
  } = useMusicStore.getState();
  const { pollinationsApiKey, localSdIp, imageProvider, localSdModel } = useAIStore.getState();

  try {
    // 1. PLAY_MUSIC
    const playMatch = findAction(cleanResponse, 'PLAY_MUSIC');
    if (playMatch) {
      const data = parseActionData(playMatch.data);
      if (data) {
        if (data.trackId) {
          const track = playlist.find(t => t.id === data.trackId.toString());
          if (track) { setCurrentTrack(track); play(); changed = true; }
        } else if (data.genre) {
          const track = playlist.find(t => t.genre?.toLowerCase() === data.genre.toLowerCase());
          if (track) { setCurrentTrack(track); play(); changed = true; }
        }
      }
      cleanResponse = cleanCommand(cleanResponse, playMatch);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // 2. PAUSE_MUSIC
    const pauseMatch = findAction(cleanResponse, 'PAUSE_MUSIC');
    if (pauseMatch) {
      pause();
      cleanResponse = cleanCommand(cleanResponse, pauseMatch);
      changed = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // 3. NEXT_TRACK
    const nextMatch = findAction(cleanResponse, 'NEXT_TRACK');
    if (nextMatch) {
      next();
      cleanResponse = cleanCommand(cleanResponse, nextMatch);
      changed = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // 4. SET_VOLUME
    const volumeMatch = findAction(cleanResponse, 'SET_VOLUME');
    if (volumeMatch) {
      const data = parseActionData(volumeMatch.data);
      if (data && data.level !== undefined) {
        const newVol = Math.max(0, Math.min(1, data.level));
        setVolume(newVol);
        cleanResponse = cleanCommand(cleanResponse, volumeMatch);
        changed = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }

    // 5. CREATE_PLAYLIST
    const createPlaylistMatch = findAction(cleanResponse, 'CREATE_PLAYLIST');
    if (createPlaylistMatch) {
      const data = parseActionData(createPlaylistMatch.data);
      if (data && data.name && data.trackIds) {
        createPlaylist(data.name, data.trackIds);
        cleanResponse = cleanCommand(cleanResponse, createPlaylistMatch);
        changed = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    // 6. DELETE_PLAYLIST
    const deletePlaylistMatch = findAction(cleanResponse, 'DELETE_PLAYLIST');
    if (deletePlaylistMatch) {
      const data = parseActionData(deletePlaylistMatch.data);
      if (data && data.playlistId) {
        deletePlaylist(data.playlistId);
        cleanResponse = cleanCommand(cleanResponse, deletePlaylistMatch);
        changed = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    // 7. UPDATE_PLAYLIST
    const updatePlaylistMatch = findAction(cleanResponse, 'UPDATE_PLAYLIST');
    if (updatePlaylistMatch) {
      const data = parseActionData(updatePlaylistMatch.data);
      if (data && data.playlistId && data.name && data.trackIds) {
        updatePlaylist(data.playlistId, data.name, data.trackIds);
        cleanResponse = cleanCommand(cleanResponse, updatePlaylistMatch);
        changed = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    // 8. ADD_SONG (Load local music)
    const addSongMatch = findAction(cleanResponse, 'ADD_SONG');
    if (addSongMatch) {
      loadLocalMusic();
      cleanResponse = cleanCommand(cleanResponse, addSongMatch);
      changed = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // 9. SET_TRACK_LYRICS
    const lyricsMatch = findAction(cleanResponse, 'SET_TRACK_LYRICS');
    if (lyricsMatch) {
      const data = parseActionData(lyricsMatch.data);
      if (data && data.lyrics) {
        const trackId = data.trackId || (currentTrack?.id);
        if (trackId) {
          setTrackLyrics(trackId, data.lyrics);
          cleanResponse = cleanCommand(cleanResponse, lyricsMatch);
          changed = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }

    // 10. SET_TRACK_ARTWORK (with Local SD support)
    const artworkMatch = findAction(cleanResponse, 'SET_TRACK_ARTWORK');
    if (artworkMatch) {
      const data = parseActionData(artworkMatch.data);
      if (data && data.imageUrl) {
        const trackId = data.trackId || (currentTrack?.id);
        if (trackId) {
          let finalImageUrl = data.imageUrl;

          // SPECIAL HANDLING: If imageUrl is "IMAGE_TAG", find the [IMAGE:...] tag in the original response
          if (finalImageUrl === 'IMAGE_TAG') {
            const imageRegex = /\[IMAGE:(.*?)\]/;
            const match = response.match(imageRegex);
            if (match) {
              const rawPrompt = match[1].trim();
              
              if (localSdIp) {
                // LOCAL SD CASE: Find the locally saved file
                // IMPORTANT: Use the EXACT same hashing as in MarkdownText
                const promptHash = rawPrompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString();
                const fileName = `local_sd_${promptHash}.png`;
                finalImageUrl = `${FileSystem.documentDirectory}${fileName}`;
                console.log("[MUSIC HANDLER] Resolved Local SD file path:", finalImageUrl);
              } else {
                // POLLINATIONS CASE (Fallback)
                const encodedPrompt = encodeURIComponent(rawPrompt);
                const seed = rawPrompt.split('').reduce((acc, char) => acc + (char.charCodeAt(0) * 31), 0) % 100000;
                const authParam = pollinationsApiKey ? `&key=${pollinationsApiKey}` : '';
                finalImageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?width=800&height=800&seed=${seed}&model=flux&nologo=true${authParam}`;
                console.log("[MUSIC HANDLER] Extracted Pollinations URL:", finalImageUrl);
              }
            }
          }

          // Local SD support logic (avoid re-hashing if already localized)
          if (imageProvider === 'local' && localSdIp && !finalImageUrl.startsWith('file://')) {
            console.log("[LOCAL SD] Artwork generation requested...");
            // For now, use the URL directly - local SD handling can be added here
          } else if (pollinationsApiKey && finalImageUrl.includes('pollinations.ai') && !finalImageUrl.includes('key=')) {
            const separator = finalImageUrl.includes('?') ? '&' : '?';
            finalImageUrl = `${finalImageUrl}${separator}key=${pollinationsApiKey}`;
          }

          setTrackArtwork(trackId, finalImageUrl);
          cleanResponse = cleanCommand(cleanResponse, artworkMatch);
          changed = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }
    
    // 11. TOGGLE_FAVORITE
    const favoriteMatch = findAction(cleanResponse, 'TOGGLE_FAVORITE');
    if (favoriteMatch) {
      const data = parseActionData(favoriteMatch.data);
      const trackId = data?.trackId || currentTrack?.id;
      if (trackId) {
        toggleFavorite(trackId);
        cleanResponse = cleanCommand(cleanResponse, favoriteMatch);
        changed = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    // 12. PREV_TRACK
    const prevMatch = findAction(cleanResponse, 'PREV_TRACK');
    if (prevMatch) {
      prev();
      cleanResponse = cleanCommand(cleanResponse, prevMatch);
      changed = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // 13. TOGGLE_SHUFFLE
    const shuffleMatch = findAction(cleanResponse, 'TOGGLE_SHUFFLE');
    if (shuffleMatch) {
      toggleShuffle();
      cleanResponse = cleanCommand(cleanResponse, shuffleMatch);
      changed = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // 14. TOGGLE_REPEAT
    const repeatMatch = findAction(cleanResponse, 'TOGGLE_REPEAT');
    if (repeatMatch) {
      toggleRepeat();
      cleanResponse = cleanCommand(cleanResponse, repeatMatch);
      changed = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch (error) { 
    console.error('[MUSIC HANDLER] Error:', error);
  }

  return { cleanResponse, changed };
};
