import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { createAudioPlayer, AudioPlayer, setAudioModeAsync, requestNotificationPermissionsAsync } from 'expo-audio';
import { useThemeStore } from '../store/themeStore';
import { useMusicStore } from '../store/musicStore';

const SOUND_ASSETS: Record<string, number> = {
  complete: require('../../assets/sounds/complete.mp3'),
  delete: require('../../assets/sounds/delete.mp3'),
  undo: require('../../assets/sounds/undo.mp3'),
  click: require('../../assets/sounds/click.mp3'),
  fanfare: require('../../assets/sounds/fanfare.mp3'),
  timer: require('../../assets/sounds/timer.mp3'),
};

const AMBIENT_ASSETS: Record<string, any> = {
  river: require('../../assets/sounds/river.mp3'),
  forest: require('../../assets/sounds/forest.mp3'),
  lofi: require('../../assets/sounds/lofi.mp3'),
  rain: require('../../assets/sounds/rain.mp3'),
  zen: require('../../assets/sounds/zen.mp3'),
};

/**
 * High-performance Sound & Music Player.
 * Unified audio engine for UI sounds, Ambient loops, and Music tracks.
 */
export const SoundPlayer: React.FC = () => {
  const { soundTrigger, soundsEnabled, ambientSound } = useThemeStore();
  const { isPlaying, currentTrack, volume, setPlaybackPosition, setPlaybackDuration, next, seekPosition, clearSeek, isRepeating } = useMusicStore();

  const playerRef = useRef<AudioPlayer | null>(null);
  const ambientPlayerRef = useRef<AudioPlayer | null>(null);
  const musicPlayerRef = useRef<AudioPlayer | null>(null);
  const musicListenerRef = useRef<any>(null);

  // Setup Permissions and Global Audio Mode
  useEffect(() => {
    const setup = async () => {
      try {
        // Essential for Android 13+ media notifications
        await requestNotificationPermissionsAsync();

        await setAudioModeAsync({
          shouldPlayInBackground: true,
          interruptionMode: 'doNotMix',
          playsInSilentMode: true,
        });
      } catch (e) {
        console.log('[SOUND PLAYER] Audio Setup Error:', e);
      }
    };
    setup();
  }, []);

  // Handle UI Sounds
  useEffect(() => {
    if (!soundsEnabled || !soundTrigger) return;

    const playSound = async () => {
      const soundAsset = SOUND_ASSETS[soundTrigger.type];
      if (!soundAsset) return;

      try {
        if (playerRef.current) {
          playerRef.current.release();
          playerRef.current = null;
        }

        const player = createAudioPlayer(soundAsset);
        playerRef.current = player;

        if (soundTrigger.type === 'fanfare' || soundTrigger.type === 'complete') player.volume = 0.3;
        else if (soundTrigger.type === 'click') player.volume = 0.1;
        else player.volume = 0.2;

        player.play();
      } catch (error) {
        console.log('[SOUND PLAYER] Native Lock Error:', error);
      }
    };

    playSound();

    return () => {
      if (playerRef.current) {
        playerRef.current.release();
        playerRef.current = null;
      }
    };
  }, [soundTrigger, soundsEnabled]);

  // Handle Ambient Sound
  useEffect(() => {
    if (!soundsEnabled || ambientSound === 'none') {
      if (ambientPlayerRef.current) {
        ambientPlayerRef.current.pause();
        ambientPlayerRef.current.release();
        ambientPlayerRef.current = null;
      }
      return;
    }

    const setupAmbient = async () => {
      const asset = AMBIENT_ASSETS[ambientSound];
      if (!asset) return;

      try {
        if (ambientPlayerRef.current) {
          ambientPlayerRef.current.release();
        }

        const player = createAudioPlayer(asset);
        player.loop = true;
        player.volume = 0.15;
        player.play();
        ambientPlayerRef.current = player;
      } catch (error) {
        console.log('[AMBIENT PLAYER] Linkage Error:', error);
      }
    };

    setupAmbient();

    return () => {
      if (ambientPlayerRef.current) {
        ambientPlayerRef.current.release();
        ambientPlayerRef.current = null;
      }
    };
  }, [ambientSound, soundsEnabled]);

  const currentTrackUrlRef = useRef<string | number | null>(null);

  // Handle Music Track Loading
  useEffect(() => {
    if (!currentTrack) {
      if (musicPlayerRef.current) {
        if (musicListenerRef.current) musicListenerRef.current.remove();
        musicPlayerRef.current.pause();
        musicPlayerRef.current.release();
        musicPlayerRef.current = null;
        currentTrackUrlRef.current = null;
      }
      return;
    }

    if (currentTrackUrlRef.current !== currentTrack.url) {
      setPlaybackPosition(0);
      setPlaybackDuration(0);
      
      if (musicPlayerRef.current) {
        if (musicListenerRef.current) musicListenerRef.current.remove();
        musicPlayerRef.current.pause();
        musicPlayerRef.current.release();
      }

      try {
        // Wrap URI in object for broader compatibility
        let source: any = typeof currentTrack.url === 'string' ? { uri: currentTrack.url } : currentTrack.url;

        // Ensure local file URIs are properly handled
        if (typeof currentTrack.url === 'string' && currentTrack.url.startsWith('file://')) {
          source = { uri: currentTrack.url };
        }

        const player = createAudioPlayer(source);
        musicPlayerRef.current = player;
        currentTrackUrlRef.current = typeof currentTrack.url === 'string' ? currentTrack.url : (currentTrack.url as any).uri || currentTrack.url;

        // If track has pre-calculated duration, use it immediately
        if (currentTrack.duration && currentTrack.duration > 0) {
          setPlaybackDuration(currentTrack.duration);
        }

        player.volume = volume;
        player.loop = isRepeating;

        console.log(`[SOUND PLAYER] Source configured for: ${currentTrack.title}. URL: ${currentTrack.url}`);

        player.setActiveForLockScreen(true, {
          title: currentTrack.title,
          artist: currentTrack.artist || 'PlayerAI',
        });

        musicListenerRef.current = player.addListener('playbackStatusUpdate', (status: any) => {
          if (status.error) console.log('[SOUND PLAYER] Status Error:', status.error);

          if (status.currentTime !== undefined) setPlaybackPosition(status.currentTime);
          
          if (status.duration !== undefined && status.duration > 0) {
            const currentDuration = useMusicStore.getState().playbackDuration;
            // Update duration if it's new, larger, or if currentTime has exceeded it
            if (status.duration > currentDuration || (status.currentTime !== undefined && status.currentTime > currentDuration)) {
              setPlaybackDuration(Math.max(status.duration, status.currentTime || 0));
            }
          } else if (status.currentTime !== undefined) {
             // Fallback: If duration is not reported, use currentTime as the duration for now
             const currentDuration = useMusicStore.getState().playbackDuration;
             if (status.currentTime > currentDuration) {
               setPlaybackDuration(status.currentTime);
             }
          }

          if (status.isLoaded && status.didJustFinish) next();
        });

        // If it should be playing, start it as soon as possible
        if (isPlaying) {
          console.log(`[SOUND PLAYER] Starting playback for: ${currentTrack.title}`);
          player.play();
        }
      } catch (error) {
        console.error('[SOUND PLAYER] Loading/Playback Error:', error);
      }
    }

    // Cleanup when component unmounts (crucial for React Strict Mode & Hot Reloading)
    return () => {
      // We don't release here because we want the player to persist across state changes
      // NO WAIT, returning cleanup here implies whenever currentTrack changes, it runs.
      // That's actually wrong, we only want to clean up on unmount.
    };
  }, [currentTrack]); // Only load when currentTrack changes

  // Handle Play/Pause
  useEffect(() => {
    if (musicPlayerRef.current) {
      if (isPlaying) {
        musicPlayerRef.current.play();
      } else {
        musicPlayerRef.current.pause();
      }
    }
  }, [isPlaying]); // Only handle play state


  // Sync Music Volume
  useEffect(() => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.volume = volume;
    }
  }, [volume]);

  // Sync Repeat (Loop)
  useEffect(() => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.loop = isRepeating;
    }
  }, [isRepeating]);

  // Handle Seeking
  useEffect(() => {
    if (musicPlayerRef.current && seekPosition !== null) {
      musicPlayerRef.current.seekTo(seekPosition);
      clearSeek();
    }
  }, [seekPosition]);

  // Global Unmount Cleanup
  useEffect(() => {
    return () => {
      if (musicPlayerRef.current) {
        if (musicListenerRef.current) musicListenerRef.current.remove();
        musicPlayerRef.current.pause();
        musicPlayerRef.current.release();
        musicPlayerRef.current = null;
      }
    };
  }, []);

  return <View style={{ display: 'none' }} />;
};

