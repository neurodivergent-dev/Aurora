import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { createAudioPlayer, AudioPlayer, setAudioModeAsync, requestNotificationPermissionsAsync } from 'expo-audio';
import { useThemeStore } from '../store/themeStore';
import { useMusicStore } from '../store/musicStore';
import logger from '../utils/logger';

export interface SoundSource {
  uri?: string;
  [key: string]: unknown;
}

export interface PlaybackStatus {
  error?: string;
  currentTime?: number;
  duration?: number;
}

const SOUND_ASSETS: Record<string, number> = {
  complete: require('../../assets/sounds/complete.mp3'),
  delete: require('../../assets/sounds/delete.mp3'),
  undo: require('../../assets/sounds/undo.mp3'),
  click: require('../../assets/sounds/click.mp3'),
  fanfare: require('../../assets/sounds/fanfare.mp3'),
  timer: require('../../assets/sounds/timer.mp3'),
};

const AMBIENT_ASSETS: Record<string, number> = {};

/**
 * High-performance Sound & Music Player.
 * Unified audio engine for UI sounds, Ambient loops, and Music tracks.
 */
export const SoundPlayer: React.FC = () => {
  const { soundTrigger, soundsEnabled, ambientSound } = useThemeStore();
  const { isPlaying, currentTrack, volume, setPlaybackPosition, setPlaybackDuration, next, seekPosition, clearSeek, isRepeating, playbackDuration } = useMusicStore();
  const playerRef = useRef<AudioPlayer | null>(null);
  const ambientPlayerRef = useRef<AudioPlayer | null>(null);
  const musicPlayerRef = useRef<AudioPlayer | null>(null);
  const musicListenerRef = useRef<{ remove: () => void } | null>(null);

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
        logger.error(`Audio Setup Error: ${e}`, 'SoundPlayer');
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
        logger.error(`Native Lock Error: ${error}`, 'SoundPlayer');
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
        logger.error(`Linkage Error: ${error}`, 'AmbientPlayer');
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
  const lastAccumulatedSecRef = useRef<number>(0);

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
      lastAccumulatedSecRef.current = 0;

      if (musicPlayerRef.current) {
        if (musicListenerRef.current) musicListenerRef.current.remove();
        musicPlayerRef.current.pause();
        musicPlayerRef.current.release();
      }

      try {
        // Wrap URI in object for broader compatibility
        let source: SoundSource | number = typeof currentTrack.url === 'string' ? { uri: currentTrack.url } : currentTrack.url;

        // Ensure local file URIs are properly handled
        if (typeof currentTrack.url === 'string' && currentTrack.url.startsWith('file://')) {
          source = { uri: currentTrack.url };
        }

        const player = createAudioPlayer(source);
        musicPlayerRef.current = player;
        currentTrackUrlRef.current = typeof currentTrack.url === 'string' ? currentTrack.url : (currentTrack.url as unknown as SoundSource).uri || currentTrack.url;

        // If track has pre-calculated duration, use it immediately
        if (currentTrack.duration && currentTrack.duration > 0) {
          setPlaybackDuration(currentTrack.duration);
        }

        player.volume = volume;
        player.loop = isRepeating;

        logger.info(`Source configured for: ${currentTrack.title}. URL: ${currentTrack.url}`, 'SoundPlayer');

        player.setActiveForLockScreen(true, {
          title: currentTrack.title,
          artist: currentTrack.artist || 'Aurora',
        });

        musicListenerRef.current = player.addListener('playbackStatusUpdate', (status: PlaybackStatus) => {
          if (status.error) logger.error(`Status Error: ${status.error}`, 'SoundPlayer');

          if (status.currentTime !== undefined) {
            setPlaybackPosition(status.currentTime);

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
          }
        });

        // If it should be playing, start it as soon as possible
        if (isPlaying) {
          logger.info(`Starting playback for: ${currentTrack.title}`, 'SoundPlayer');
          player.play();
        }
      } catch (error) {
        logger.error(`Loading/Playback Error: ${error}`, 'SoundPlayer');
      }
    }

    // Cleanup when component unmounts (crucial for React Strict Mode & Hot Reloading)
    return () => {
      if (musicListenerRef.current) {
        musicListenerRef.current.remove();
      }
    };
  }, [currentTrack]); // Only load when currentTrack changes

  // Handle Play/Pause & Force Load/Play on Cold Start
  useEffect(() => {
    if (musicPlayerRef.current) {
      if (isPlaying) {
        musicPlayerRef.current.play();
      } else {
        musicPlayerRef.current.pause();
      }
    } else if (isPlaying && currentTrack) {
        // COLD START CASE: If it should be playing but player is null, 
        // the main currentTrack effect will handle creation, 
        // but we ensure it plays immediately.
        logger.info("Cold start detected, player will initialize and play.", "SoundPlayer");
    }
  }, [isPlaying, currentTrack]); // React to play state AND track existence


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

