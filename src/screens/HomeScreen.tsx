import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Play, Shuffle, Search, Music, Pause, RefreshCw } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useMusicStore } from "../store/musicStore";
import { useTheme } from "../components/ThemeProvider";
import { BackgroundEffects } from "../components/BackgroundEffects";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { playlist, currentTrack, isPlaying, play, pause, setCurrentTrack, isShuffled, toggleShuffle } = useMusicStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const filteredPlaylist = playlist.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.artist && track.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          <View style={styles.headerDecorationCircle1} />
          <View style={styles.headerDecorationCircle2} />

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t("home.library")}</Text>
            <View style={styles.headerActions}>

              <TouchableOpacity
                style={[styles.iconBtn, isSearchVisible && { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                onPress={() => {
                  setIsSearchVisible(!isSearchVisible);
                  if (isSearchVisible) setSearchQuery(""); // Kapanınca aramayı temizle
                }}
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
              return (
                <Animated.View key={item.id} entering={FadeInDown.delay(200 + index * 50)}>
                  <TouchableOpacity
                    style={[styles.trackItem, isSelected && { backgroundColor: colors.primary + '20' }]}
                    onPress={() => {
                      if (isSelected && isPlaying) {
                        pause();
                      } else {
                        setCurrentTrack(item);
                        play();
                      }
                    }}
                  >
                    <View style={[styles.trackIcon, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                      {isSelected && isPlaying ? (
                        <Pause size={20} color={colors.primary} fill={colors.primary} />
                      ) : (
                        <Music size={20} color={isSelected ? colors.primary : colors.text} />
                      )}
                    </View>

                    <View style={styles.trackInfo}>
                      <Text style={[styles.trackTitle, { color: isSelected ? colors.primary : colors.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={[styles.trackArtist, { color: colors.subText }]} numberOfLines={1}>
                        {item.artist}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            {filteredPlaylist.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.subText }]}>{t("home.noMusic")}</Text>
              </View>
            )}

            {/* Added padding for bottom to avoid MiniPlayer overlap */}
            <View style={{ height: 100 }} />
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerDecorationCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    gap: 15,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: "500",
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  heroInfo: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  listContainer: {
    gap: 8,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
  },
  trackIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  trackInfo: {
    flex: 1,
    justifyContent: "center",
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 13,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  }
});
