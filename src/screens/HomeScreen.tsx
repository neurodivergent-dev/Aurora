import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Play, Shuffle, Search, Music } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useMusicStore } from "../store/musicStore";
import { useTheme } from "../components/ThemeProvider";
import { BackgroundEffects } from "../components/BackgroundEffects/";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

import { TrackItem } from "../components/TrackItem";

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { 
    playlist, currentTrack, isPlaying, play, pause, 
    setCurrentTrack, isShuffled, toggleShuffle,
    selectedTrackIds, setSelectedTrackIds
  } = useMusicStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const filteredPlaylist = playlist.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.artist && track.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleLongPress = (track: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!selectedTrackIds.includes(track.id)) {
      setSelectedTrackIds([...selectedTrackIds, track.id]);
    }
  };

  const handlePress = (track: any) => {
    if (selectedTrackIds.length > 0) {
      // Selection mode is active
      Haptics.selectionAsync();
      if (selectedTrackIds.includes(track.id)) {
        setSelectedTrackIds(selectedTrackIds.filter(id => id !== track.id));
      } else {
        setSelectedTrackIds([...selectedTrackIds, track.id]);
      }
    } else {
      // Normal playback mode
      const isSelected = currentTrack?.id === track.id;
      if (isSelected && isPlaying) {
        pause();
      } else {
        setCurrentTrack(track);
        play();
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackgroundEffects />

      <View style={{ flex: 1 }}>
        {/* Premium Header */}
        <LinearGradient
          colors={[colors.primary, colors.secondary || colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: Math.max(insets.top, 10) + 16, paddingBottom: 24 }]}
        >
          <View style={styles.headerDecorationCircle1} importantForAccessibility="no" />
          <View style={styles.headerDecorationCircle2} importantForAccessibility="no" />

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t("home.library")}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.iconBtn, isSearchVisible && { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                onPress={() => {
                  setIsSearchVisible(!isSearchVisible);
                  if (isSearchVisible) setSearchQuery("");
                }}
                accessibilityRole="button"
              >
                <Search size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {isSearchVisible && (
            <Animated.View entering={FadeInDown.duration(200)} style={{ marginTop: 15 }}>
              <TextInput
                style={[styles.searchInput, { backgroundColor: 'rgba(0, 0, 0, 0.2)', color: "#FFFFFF" }]}
                placeholder={t("settings.ai.chat.placeholder")}
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </Animated.View>
          )}
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Featured Action Container */}
          <Animated.View entering={FadeInDown.delay(100)} style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={styles.heroInfo}>
              <Text style={[styles.heroLabel, { color: colors.primary }]}>{t("home.playlists").toUpperCase()}</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>{t("themeSettings.default")}</Text>
              <Text style={[styles.heroSubtitle, { color: colors.subText }]}>{playlist.length} {t("home.playlists")}</Text>
            </View>
            <TouchableOpacity
              style={[styles.playBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (playlist.length > 0) {
                  setCurrentTrack(playlist[0]);
                  play();
                }
              }}
            >
              <Play size={24} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: isShuffled ? colors.primary + '20' : colors.card, borderColor: isShuffled ? colors.primary : colors.border, borderWidth: 1 }
              ]}
              onPress={() => {
                toggleShuffle();
              }}
            >
              <Shuffle size={20} color={isShuffled ? colors.primary : colors.text} />
              <Text style={[styles.actionText, { color: isShuffled ? colors.primary : colors.text }]}>{t("home.shuffle")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => useMusicStore.getState().loadLocalMusic()}
            >
              <Music size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>{t("home.addLocalMusic")}</Text>
            </TouchableOpacity>
          </View>

          {/* Tracks List */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("home.library")}</Text>

          <View style={styles.listContainer}>
            {filteredPlaylist.map((item, index) => {
              const isSelected = currentTrack?.id === item.id;
              const isActionsSelected = selectedTrackIds.includes(item.id);
              
              return (
                <TrackItem 
                  key={item.id}
                  item={item}
                  index={index}
                  isSelected={isSelected}
                  isPlaying={isPlaying}
                  isActionsSelected={isActionsSelected}
                  onPress={() => handlePress(item)}
                  onLongPress={() => handleLongPress(item)}
                />
              );
            })}

            {filteredPlaylist.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.subText }]}>{t("home.noMusic")}</Text>
              </View>
            )}

            {/* Standard padding for MiniPlayer / Action Bar */}
            <View style={{ height: 120 }} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerGradient: {
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: 10,
  },
  headerDecorationCircle1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerDecorationCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    height: 50,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    zIndex: 1,
  },
  heroCard: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heroInfo: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  listContainer: {
    gap: 0,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  }
});
