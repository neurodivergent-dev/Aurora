import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../components/ThemeProvider";
import { BackgroundEffects } from "../components/BackgroundEffects";
import { ChevronLeft, Music, Play, PlayCircle, Heart } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { useMusicStore, Track } from "../store/musicStore";
import { soundService } from "../services/SoundService";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

export const PlaylistDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { playlist, setCurrentTrack, play, currentTrack, isPlaying, pause, myPlaylists, favoriteTrackIds } = useMusicStore();

  const isFavorites = id === 'favorites';

  const userPlaylist = React.useMemo(() => myPlaylists.find(p => p.id === id), [myPlaylists, id]);

  const filteredPlaylist = React.useMemo(() => {
    if (isFavorites) {
      return playlist.filter(track => favoriteTrackIds.includes(track.id));
    }
    if (!userPlaylist) return [];
    return playlist.filter(track => userPlaylist.trackIds.includes(track.id));
  }, [playlist, userPlaylist, favoriteTrackIds, isFavorites]);

  const playlistTitle = isFavorites ? t("playlist_screen.myFavorites") : (userPlaylist?.name || t("playlist_screen.defaultName"));
  const playlistStats = `${filteredPlaylist.length} ${t("playlist_screen.track")}`;

  const playFeedback = () => {
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePlayTrack = (track: Track) => {
    playFeedback();
    if (currentTrack?.id === track.id && isPlaying) {
      pause();
    } else {
      setCurrentTrack(track);
      play();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackgroundEffects />
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[colors.primary, colors.secondary || colors.primary]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t("a11y.goBack")}
        >
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={[styles.iconContainer, isFavorites && { backgroundColor: 'rgba(255, 68, 68, 0.3)' }]}>
            {isFavorites ? (
              <Heart size={40} color="#FFF" fill="#FFF" />
            ) : (
              <Music size={40} color="#FFF" />
            )}
          </View>
          <Text style={styles.title} accessibilityRole="header">{playlistTitle}</Text>
          <Text style={styles.subtitle}>{playlistStats}</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("playlist_screen.tracks")}</Text>
        
        {filteredPlaylist.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Music size={40} color={colors.subText} />
            <Text style={{ color: colors.subText, marginTop: 12 }}>{t("playlist_screen.noSongsInList")}</Text>
          </View>
        )}

        {filteredPlaylist.map((track, index) => {
          const isCurrent = currentTrack?.id === track.id;
          return (
            <Animated.View 
              key={track.id} 
              entering={FadeInDown.delay(index * 50)}
            >
              <TouchableOpacity
                style={[styles.trackRow, { borderBottomColor: colors.border }]}
                onPress={() => handlePlayTrack(track)}
                accessibilityRole="button"
                accessibilityLabel={t("a11y.trackItem", { title: track.title, artist: track.artist || 'Aurora' })}
                accessibilityHint={isCurrent && isPlaying ? t("a11y.pauseTrack", { title: track.title }) : t("a11y.playTrack", { title: track.title })}
                accessibilityState={{ selected: isCurrent }}
              >
                <View style={[styles.trackIcon, { backgroundColor: isCurrent ? colors.primary + '20' : colors.card }]}>
                  {isCurrent && isPlaying ? (
                    <View style={styles.playingIndicator}>
                      <View style={[styles.playingBar, { backgroundColor: colors.primary, height: 12 }]} />
                      <View style={[styles.playingBar, { backgroundColor: colors.primary, height: 18 }]} />
                      <View style={[styles.playingBar, { backgroundColor: colors.primary, height: 10 }]} />
                    </View>
                  ) : (
                    <Music size={20} color={isCurrent ? colors.primary : colors.subText} />
                  )}
                </View>
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackTitle, { color: isCurrent ? colors.primary : colors.text }]} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={[styles.trackArtist, { color: colors.subText }]} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </View>
                <PlayCircle size={24} color={isCurrent ? colors.primary : colors.border} />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  trackIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 13,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  playingBar: {
    width: 3,
    borderRadius: 1.5,
  }
});
