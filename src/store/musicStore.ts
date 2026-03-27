import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import * as DocumentPicker from 'expo-document-picker';
import { createAudioPlayer } from 'expo-audio';

const mmkv = createMMKV({ id: 'music-store' });

// Zustand-compatible MMKV storage adapter
const mmkvStorage = {
  setItem: (key: string, value: string) => mmkv.set(key, value),
  getItem: (key: string) => mmkv.getString(key) ?? null,
  removeItem: (key: string) => mmkv.remove(key),
};

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string | number; // Local asset (number) or remote URL (string)
  artwork?: string;
  genre?: string;
  duration?: number;
  lyrics?: string;
}

export interface UserPlaylist {
  id: string;
  name: string;
  trackIds: string[];
}

// Default tracks with require() — NEVER persist these, asset IDs change on every build
const DEFAULT_TRACKS: Track[] = [
  {
    id: 'lofi-1',
    title: 'Ambient Beats',
    artist: 'AI Producer',
    url: require('../../assets/sounds/lofi.mp3'),
    genre: 'Lofi',
  },
  {
    id: 'zen-1',
    title: 'Deep Zen',
    artist: 'Mindfulness AI',
    url: require('../../assets/sounds/zen.mp3'),
    genre: 'Ambient',
  },
  {
    id: 'rain-1',
    title: 'Stormy Night',
    artist: 'Nature Synth',
    url: require('../../assets/sounds/rain.mp3'),
    genre: 'Nature',
  },
];

interface MusicState {
  isPlaying: boolean;
  currentTrack: Track | null;
  // Full playlist = DEFAULT_TRACKS + localTracks (computed on merge)
  playlist: Track[];
  // Only local (URI-based) tracks — these ARE safe to persist
  localTracks: Track[];
  volume: number;
  playbackPosition: number;
  playbackDuration: number;
  seekPosition: number | null;
  isShuffled: boolean;
  isRepeating: boolean;
  myPlaylists: UserPlaylist[];
  favoriteTrackIds: string[];
  alertVisible: boolean;
  alertConfig: { title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' | 'music' } | null;

  // Actions
  showAlert: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning' | 'music') => void;
  hideAlert: () => void;
  loadLocalMusic: () => Promise<void>;
  removeLocalTrack: (id: string) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTrack: (track: Track | null) => void;
  setPlaylist: (tracks: Track[]) => void;
  setVolume: (volume: number) => void;
  setPlaybackPosition: (position: number) => void;
  setPlaybackDuration: (duration: number) => void;
  seek: (position: number) => void;
  clearSeek: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  createPlaylist: (name: string, trackIds: string[]) => void;
  updatePlaylist: (id: string, name: string, trackIds: string[]) => void;
  deletePlaylist: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setTrackLyrics: (id: string, lyrics: string) => void;
  setTrackArtwork: (id: string, imageUrl: string) => void;
  clearAllLyrics: () => void;

  // Controls
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      myPlaylists: [] as UserPlaylist[],
      localTracks: [] as Track[],
      favoriteTrackIds: [] as string[],
      alertVisible: false,
      alertConfig: null,
      isPlaying: false,
      currentTrack: null,
      playlist: [...DEFAULT_TRACKS],
      volume: 0.8,
      playbackPosition: 0,
      playbackDuration: 0,
      seekPosition: null,
      isShuffled: false,
      isRepeating: false,

      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentTrack: (track) => set({ currentTrack: track }),
      setPlaylist: (playlist) => set({ playlist }),
      setVolume: (volume) => set({ volume }),
      setPlaybackPosition: (playbackPosition) => set({ playbackPosition }),
      setPlaybackDuration: (playbackDuration) => set({ playbackDuration }),
      seek: (position) => set({ seekPosition: position }),
      clearSeek: () => set({ seekPosition: null }),
      toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),
      toggleRepeat: () => set((state) => ({ isRepeating: !state.isRepeating })),

      showAlert: (title, message, type = 'info') => set({
        alertVisible: true,
        alertConfig: { title, message, type }
      }),
      hideAlert: () => set({ alertVisible: false }),

      createPlaylist: (name, trackIds) => set((state) => ({
        myPlaylists: [
          { id: Date.now().toString(), name, trackIds },
          ...state.myPlaylists,
        ],
      })),

      updatePlaylist: (id, name, trackIds) => set((state) => ({
        myPlaylists: state.myPlaylists.map((p) =>
          p.id === id ? { ...p, name, trackIds } : p
        ),
      })),

      deletePlaylist: (id) => set((state) => ({
        myPlaylists: state.myPlaylists.filter((p) => p.id !== id),
      })),
      toggleFavorite: (id) => set((state) => ({
        favoriteTrackIds: state.favoriteTrackIds.includes(id)
          ? state.favoriteTrackIds.filter(fid => fid !== id)
          : [...state.favoriteTrackIds, id]
      })),
      isFavorite: (id) => get().favoriteTrackIds.includes(id),
      setTrackLyrics: (id, lyrics) => set((state) => {
        const lowerId = id.toLowerCase();
        const updateInList = (list: Track[]) => list.map(t => {
          const isMatch = t.id === id || t.title.toLowerCase().includes(lowerId) || id.toLowerCase().includes(t.title.toLowerCase());
          return isMatch ? { ...t, lyrics } : t;
        });

        const newLocal = updateInList(state.localTracks);
        const newPlaylist = updateInList(state.playlist);

        let newCurrent = state.currentTrack;
        if (state.currentTrack) {
          const isCurrentMatch = state.currentTrack.id === id ||
            state.currentTrack.title.toLowerCase().includes(lowerId) ||
            id.toLowerCase().includes(state.currentTrack.title.toLowerCase());
          if (isCurrentMatch) {
            newCurrent = { ...state.currentTrack, lyrics };
          }
        }

        return {
          localTracks: newLocal,
          playlist: newPlaylist,
          currentTrack: newCurrent
        };
      }),

      setTrackArtwork: (id, imageUrl) => set((state) => {
        const lowerId = id.toLowerCase();
        const updateInList = (list: Track[]) => list.map(t => {
          const isMatch = t.id === id ||
            t.title.toLowerCase() === lowerId ||
            t.title.toLowerCase().includes(lowerId) ||
            id.toLowerCase().includes(t.title.toLowerCase());
          return isMatch ? { ...t, artwork: imageUrl } : t;
        });

        const newLocal = updateInList(state.localTracks);
        const newPlaylist = updateInList(state.playlist);

        let newCurrent = state.currentTrack;
        if (state.currentTrack) {
          const isCurrentMatch = state.currentTrack.id === id ||
            state.currentTrack.title.toLowerCase() === lowerId ||
            state.currentTrack.title.toLowerCase().includes(lowerId) ||
            id.toLowerCase().includes(state.currentTrack.title.toLowerCase());
          if (isCurrentMatch) {
            newCurrent = { ...state.currentTrack, artwork: imageUrl };
          }
        }

        return {
          localTracks: newLocal,
          playlist: newPlaylist,
          currentTrack: newCurrent
        };
      }),

      clearAllLyrics: () => set((state) => {
        const clear = (list: Track[]) => list.map(t => ({ ...t, lyrics: "" }));
        return {
          localTracks: clear(state.localTracks),
          playlist: clear(state.playlist),
          currentTrack: state.currentTrack ? { ...state.currentTrack, lyrics: "" } : null
        };
      }),

      removeLocalTrack: (id) => set((state) => {
        const newLocalTracks = state.localTracks.filter(t => t.id !== id);
        return {
          localTracks: newLocalTracks,
          playlist: [...DEFAULT_TRACKS, ...newLocalTracks],
        };
      }),

      loadLocalMusic: async () => {
        try {
          console.log("[loadLocalMusic] Açılıyor: Document Picker...");

          const result = await DocumentPicker.getDocumentAsync({
            type: ['audio/*'],
            copyToCacheDirectory: true,
            multiple: true,
          });

          if (result.canceled || !result.assets || result.assets.length === 0) {
            console.log("[loadLocalMusic] Kullanıcı iptal etti veya dosya seçmedi.");
            return;
          }

          const incoming: Track[] = await Promise.all(result.assets.map(async (asset) => {
            let duration = 0;
            try {
              // Create a temporary player to get the duration metadata
              const tempPlayer = createAudioPlayer(asset.uri);
              // Wait a bit for Metadata to be available
              duration = tempPlayer.duration || 0;
              tempPlayer.release();
            } catch (e) {
              console.log("[loadLocalMusic] Duration fetch error:", e);
            }

            return {
              id: asset.uri,
              title: asset.name ? asset.name.replace(/\.[^/.]+$/, '') : 'Bilinmeyen Şarkı',
              artist: 'Telefon Hafızası',
              url: asset.uri,
              duration,
              genre: 'Local',
            };
          }));

          const { localTracks } = get();
          const newTracks = incoming.filter(
            lt => !localTracks.find(p => p.id === lt.id || p.url === lt.url)
          );

          if (newTracks.length > 0) {
            const updatedLocal = [...localTracks, ...newTracks];
            set({
              localTracks: updatedLocal,
              playlist: [...DEFAULT_TRACKS, ...updatedLocal],
            });
            get().showAlert(
              "Müzikler Eklendi",
              `${newTracks.length} adet yeni lokal şarkı kütüphanene eklendi! 🎉`,
              'music'
            );
          } else {
            get().showAlert(
              "Zaten Mevcut",
              "Seçtiğin şarkılar zaten kütüphanende mevcut.",
              'info'
            );
          }
        } catch (error) {
          console.error("Lokal müzikler yüklenemedi:", error);
          get().showAlert(
            "Hata",
            "Lokal müzikleri eklerken bir hata oluştu.",
            'error'
          );
        }
      },

      play: () => {
        const { currentTrack, playlist } = get();
        if (!currentTrack && playlist.length > 0) {
          set({ currentTrack: playlist[0], isPlaying: true });
        } else {
          set({ isPlaying: true });
        }
      },
      pause: () => set({ isPlaying: false }),

      next: () => {
        const { playlist, currentTrack, isShuffled } = get();
        if (!currentTrack) {
          if (playlist.length > 0) set({ currentTrack: playlist[0], isPlaying: true });
          return;
        }

        if (isShuffled) {
          const remainingTracks = playlist.filter(t => t.id !== currentTrack.id);
          const randomTrack = remainingTracks[Math.floor(Math.random() * remainingTracks.length)];
          set({ currentTrack: randomTrack || playlist[0], isPlaying: true });
          return;
        }

        const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
        const nextIndex = (currentIndex + 1) % playlist.length;
        set({ currentTrack: playlist[nextIndex], isPlaying: true });
      },

      prev: () => {
        const { playlist, currentTrack, isShuffled } = get();
        if (!currentTrack) {
          if (playlist.length > 0) set({ currentTrack: playlist[playlist.length - 1], isPlaying: true });
          return;
        }

        if (isShuffled) {
          const remainingTracks = playlist.filter(t => t.id !== currentTrack.id);
          const randomTrack = remainingTracks[Math.floor(Math.random() * remainingTracks.length)];
          set({ currentTrack: randomTrack || playlist[0], isPlaying: true });
          return;
        }

        const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
        const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        set({ currentTrack: playlist[prevIndex], isPlaying: true });
      },
    }),
    {
      name: 'music-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // Persist ONLY: volume, myPlaylists, localTracks (string URI-based, safe to persist)
      // DO NOT persist: playlist (contains require() asset IDs that change every build)
      // DO NOT persist: currentTrack (same reason)
      partialize: (state) => ({
        volume: state.volume,
        myPlaylists: state.myPlaylists,
        localTracks: state.localTracks,
        favoriteTrackIds: state.favoriteTrackIds,
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        volume: persistedState?.volume ?? currentState.volume,
        myPlaylists: persistedState?.myPlaylists ?? [],
        localTracks: persistedState?.localTracks ?? [],
        favoriteTrackIds: persistedState?.favoriteTrackIds ?? [],
        // Reconstruct full playlist: defaults (fresh require IDs) + persisted local tracks
        playlist: [...DEFAULT_TRACKS, ...(persistedState?.localTracks ?? [])],
      }),
    }
  )
);
