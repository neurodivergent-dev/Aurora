import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../components/ThemeProvider";
import { BackgroundEffects } from "../components/BackgroundEffects/";
import { Search, Plus, PlayCircle, Music, Headphones, Flame, RefreshCw, ChevronRight, Trash2, Edit2, Heart } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight, FadeIn } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useMusicStore, Track, UserPlaylist } from "../store/musicStore";
import { soundService } from "../services/SoundService";
import { KeyboardAvoidingView, Platform, Modal } from "react-native";

import * as Haptics from "expo-haptics";

const { width, height: screenHeight } = Dimensions.get("window");

const CATEGORY_KEYS = [
  { key: "all", label: "playlist_screen.categories.all" },
  { key: "recommended", label: "playlist_screen.categories.recommended" },
  { key: "focus", label: "playlist_screen.categories.focus" },
  { key: "relax", label: "playlist_screen.categories.relax" },
  { key: "energetic", label: "playlist_screen.categories.energetic" },
];

export const PlaylistsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [activeCategory, setActiveCategory] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { playlist, play, setCurrentTrack, loadLocalMusic, currentTrack, isPlaying, pause, myPlaylists, createPlaylist, updatePlaylist, deletePlaylist, favoriteTrackIds } = useMusicStore();

  const favoritesCount = useMemo(() => favoriteTrackIds.length, [favoriteTrackIds]);

  const playFeedback = () => {
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Sexy "Sizin İçin Seçilenler" Mantığı
  const featuredTracks = useMemo(() => {
    // 1. Önce kütüphaneyi karıştır
    const shuffled = [...playlist].sort(() => Math.random() - 0.5);

    // 2. Eğer favoriler varsa onları listenin başına taşı (önceliklendir)
    const favorites = shuffled.filter(t => favoriteTrackIds.includes(t.id));
    const nonFavorites = shuffled.filter(t => !favoriteTrackIds.includes(t.id));

    const finalPool = [...favorites, ...nonFavorites];

    if (activeCategory === "all") return finalPool.slice(0, 8); // Hepsi seçiliyse karışık sexy bir havuz sun

    // Kategoriye göre filtrele ama yine içinden rastgele/favori seç
    return finalPool.filter(track => {
      const genre = (track.genre || "").toLowerCase();
      if (activeCategory === "focus") return genre === "lofi";
      if (activeCategory === "relax") return genre === "ambient" || genre === "nature";
      if (activeCategory === "energetic") return genre === "local" || genre === "electronic";
      return true;
    }).slice(0, 8);
  }, [activeCategory, playlist, favoriteTrackIds]);

  const filteredTracks = useMemo(() => {
    if (activeCategory === "all") return playlist;
    return playlist.filter(track => {
      const genre = (track.genre || "").toLowerCase();
      if (activeCategory === "focus") return genre === "lofi";
      if (activeCategory === "relax") return genre === "ambient" || genre === "nature";
      if (activeCategory === "energetic") return genre === "local" || genre === "electronic";
      return true;
    });
  }, [activeCategory, playlist]);

  const handlePlayTrack = (track: Track) => {
    playFeedback();
    if (currentTrack?.id === track.id && isPlaying) {
      pause();
    } else {
      setCurrentTrack(track);
      play();
    }
  };

  const scrollToSection = () => {
    playFeedback();
    setActiveCategory("all");
    scrollRef.current?.scrollTo({ y: 400, animated: true });
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      if (editingPlaylistId) {
        updatePlaylist(editingPlaylistId, newPlaylistName, [...selectedTracks]);
      } else {
        createPlaylist(newPlaylistName, [...selectedTracks]);
      }
      setNewPlaylistName("");
      setSelectedTracks([]);
      setEditingPlaylistId(null);
      setIsModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDeletePlaylist = (id: string) => {
    playFeedback();
    deletePlaylist(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const handleEditPlaylist = (list: UserPlaylist) => {
    playFeedback();
    setEditingPlaylistId(list.id);
    setNewPlaylistName(list.name);
    setSelectedTracks([...list.trackIds]);
    setIsModalVisible(true);
  };

  const toggleTrackSelection = (trackId: string) => {
    playFeedback();
    setSelectedTracks(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const modalFilteredTracks = useMemo(() => {
    return playlist.filter(track =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [playlist, searchQuery]);

  const renderTrackItem = useCallback(({ item }: { item: Track }) => {
    const isSelected = selectedTracks.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.trackSelectRow,
          { borderColor: isSelected ? colors.primary : colors.border, backgroundColor: isSelected ? colors.primary + '10' : 'transparent' }
        ]}
        onPress={() => toggleTrackSelection(item.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={t("a11y.trackItem", { title: item.title, artist: item.artist || 'Aurora' })}
      >
        <View style={styles.trackSelectInfo}>
          <Text style={[styles.trackSelectTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.trackSelectArtist, { color: colors.subText }]} numberOfLines={1}>{item.artist}</Text>
        </View>
        <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: isSelected ? colors.primary : 'transparent' }]}>
          {isSelected && <Plus size={14} color="#FFF" />}
        </View>
      </TouchableOpacity>
    );
  }, [selectedTracks, colors, t, toggleTrackSelection]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackgroundEffects />

      <LinearGradient
        colors={[colors.primary, colors.secondary || colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: Math.max(insets.top, 10) + 16, paddingBottom: 24 }]}
      >
        <View style={styles.headerDecorationCircle1} />
        <View style={styles.headerDecorationCircle2} />

        <Animated.View entering={FadeInDown.delay(100)} style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t("playlist_screen.title")}</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.iconBtn} 
              onPress={() => { playFeedback(); loadLocalMusic(); }}
              accessibilityRole="button"
              accessibilityLabel={t("a11y.addMusic")}
            >
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={styles.safeArea}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Kategoriler */}
          <Animated.View entering={FadeInRight.delay(200)} style={styles.categoriesWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList} accessibilityRole="radiogroup">
              {CATEGORY_KEYS.map((cat, index) => {
                const isActive = activeCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => { playFeedback(); setActiveCategory(cat.key); }}
                    style={[
                      styles.categoryPill,
                      {
                        backgroundColor: isActive ? colors.primary : colors.card,
                        borderColor: isActive ? colors.primary : colors.border
                      }
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isActive }}
                    accessibilityLabel={t(cat.label)}
                  >
                    <Text style={[styles.categoryText, { color: isActive ? "#FFFFFF" : colors.subText }]}>
                      {t(cat.label)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Carousel Bölümü */}
          <Animated.View entering={FadeInDown.delay(300)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {activeCategory === "all" ? t("playlist_screen.sections.featured") : t(`playlist_screen.categories.${activeCategory}`)}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
              snapToInterval={width * 0.6 + 20}
              decelerationRate="fast"
            >
              {featuredTracks.map((track, index) => (
                <TouchableOpacity 
                  key={track.id} 
                  activeOpacity={0.8} 
                  onPress={() => handlePlayTrack(track)}
                  accessibilityRole="button"
                  accessibilityLabel={t("a11y.trackPlaying", { title: track.title, artist: track.artist || 'Aurora' })}
                  accessibilityHint={currentTrack?.id === track.id && isPlaying ? t("a11y.pauseTrack", { title: track.title }) : t("a11y.playTrack", { title: track.title })}
                >
                  <LinearGradient
                    colors={favoriteTrackIds.includes(track.id)
                      ? ["#FF416C", "#FF4B2B"] // Favoriler için sexy kırmızı/turuncu gradyan
                      : [colors.primary, colors.secondary || colors.primary]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.featuredCard}
                  >
                    <View style={styles.cardGenreWrapper}>
                      <Text style={styles.cardGenre}>{favoriteTrackIds.includes(track.id) ? t("playlist_screen.favorite") : (track.genre || "Music")}</Text>
                    </View>

                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{track.title}</Text>
                      <Text style={styles.cardAuthor}>{track.artist}</Text>
                    </View>

                    <View style={styles.playOverlay}>
                      <PlayCircle size={44} color="#FFFFFF" fill={currentTrack?.id === track.id && isPlaying ? "rgba(255,255,255,0.4)" : "transparent"} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}

              {featuredTracks.length === 0 && (
                <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                  <Music size={40} color={colors.subText} strokeWidth={1} style={{ marginBottom: 12 }} />
                  <Text style={{ color: colors.subText, textAlign: 'center' }}>{t("home.noMusic")}</Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>

          {/* Koleksiyon Bölümü */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.librarySection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("playlist_screen.sections.collection")}</Text>

            <TouchableOpacity
              style={[styles.libraryItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                if (favoritesCount > 0) {
                  playFeedback();
                  router.push({
                    pathname: "/playlist-detail",
                    params: { id: 'favorites' }
                  });
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={`${t("playlist_screen.myFavorites")}, ${favoritesCount} ${t("playlist_screen.track")}`}
            >
              <View style={[styles.libraryIconWrapper, { backgroundColor: "#FF4444" }]}>
                <Heart size={24} color="#FFF" fill="#FFF" />
              </View>
              <View style={styles.libraryItemInfo}>
                <Text style={[styles.libraryItemTitle, { color: colors.text }]}>{t("playlist_screen.myFavorites")}</Text>
                <Text style={[styles.libraryItemStats, { color: colors.subText }]}>{favoritesCount} {t("playlist_screen.track")}</Text>
              </View>
              <ChevronRight size={20} color={colors.subText} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.libraryItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                playFeedback();
                router.replace("/");
              }}
              accessibilityRole="button"
              accessibilityLabel={`${t("home.playlists")}, ${playlist.length} ${t("tabs.library")}`}
            >
              <View style={[styles.libraryIconWrapper, { backgroundColor: colors.primary }]}>
                <Flame size={24} color="#FFF" />
              </View>
              <View style={styles.libraryItemInfo}>
                <Text style={[styles.libraryItemTitle, { color: colors.text }]}>{t("home.playlists")}</Text>
                <Text style={[styles.libraryItemStats, { color: colors.subText }]}>{playlist.length} {t("tabs.library")}</Text>
              </View>
              <ChevronRight size={20} color={colors.subText} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.libraryItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => { playFeedback(); loadLocalMusic(); }}
              accessibilityRole="button"
              accessibilityLabel={`${t("playlist_screen.localFiles")}, ${t("playlist_screen.localFilesDesc")}`}
            >
              <View style={[styles.libraryIconWrapper, { backgroundColor: colors.secondary || colors.primary }]}>
                <Music size={24} color="#FFF" />
              </View>
              <View style={styles.libraryItemInfo}>
                <Text style={[styles.libraryItemTitle, { color: colors.text }]}>{t("playlist_screen.localFiles")}</Text>
                <Text style={[styles.libraryItemStats, { color: colors.subText }]}>{t("playlist_screen.localFilesDesc")}</Text>
              </View>
              <Plus size={20} color={colors.subText} />
            </TouchableOpacity>

            {/* Kullanıcı Listeleri */}
            {myPlaylists.map((list) => (
              <View key={list.id} style={[styles.libraryItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={styles.libraryItemMain}
                  onPress={() => {
                    playFeedback();
                    router.push({
                      pathname: "/playlist-detail",
                      params: { id: list.id }
                    });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${list.name}, ${list.trackIds.length} ${t("playlist_screen.track")}`}
                >
                  <View style={[styles.libraryIconWrapper, { backgroundColor: colors.primary + '30' }]}>
                    <Music size={24} color={colors.primary} />
                  </View>
                  <View style={styles.libraryItemInfo}>
                    <Text style={[styles.libraryItemTitle, { color: colors.text }]}>{list.name}</Text>
                    <Text style={[styles.libraryItemStats, { color: colors.subText }]}>{list.trackIds.length} {t("playlist_screen.track")}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.libraryItemActions}>
                  <TouchableOpacity 
                    onPress={() => handleEditPlaylist(list)} 
                    style={styles.actionBtn}
                    accessibilityRole="button"
                    accessibilityLabel={t("a11y.edit")}
                  >
                    <Edit2 size={18} color={colors.subText} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDeletePlaylist(list.id)} 
                    style={styles.actionBtn}
                    accessibilityRole="button"
                    accessibilityLabel={t("a11y.delete")}
                  >
                    <Trash2 size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Yeni Liste Oluştur Butonu */}
          <TouchableOpacity
            style={[styles.createNewBtn, { borderColor: colors.primary, marginHorizontal: 20, marginTop: 20 }]}
            onPress={() => { playFeedback(); setIsModalVisible(true); }}
            accessibilityRole="button"
            accessibilityLabel={t("playlist_screen.newList")}
          >
            <Plus size={20} color={colors.primary} />
            <Text style={[styles.createNewText, { color: colors.primary }]}>{t("playlist_screen.newList")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { setIsModalVisible(false); setEditingPlaylistId(null); }}
      >
        <View style={styles.modalOverlay} accessibilityViewIsModal={true}>
          <TouchableOpacity
            activeOpacity={1}
            style={StyleSheet.absoluteFill}
            onPress={() => { setIsModalVisible(false); setEditingPlaylistId(null); }}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingPlaylistId ? t("playlist_screen.editList") : t("playlist_screen.newList")}
              </Text>

              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t("playlist_screen.enterListName")}
                  placeholderTextColor={colors.subText}
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                  accessibilityLabel={t("playlist_screen.enterListName")}
                />
              </View>

              <Text style={[styles.modalSubtitle, { color: colors.text }]}>{t("playlist_screen.selectSongs")} ({selectedTracks.length})</Text>

              <View style={[styles.innerSearchWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Search size={16} color={colors.subText} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.innerSearchInput, { color: colors.text }]}
                  placeholder={t("playlist_screen.searchPlaceholder")}
                  placeholderTextColor={colors.subText}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  accessibilityLabel={t("a11y.searchInput")}
                />
              </View>

              <View style={styles.listContainer}>
                {modalFilteredTracks.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingTop: 30 }}>
                    <Music size={32} color={colors.subText} />
                    <Text style={{ color: colors.subText, marginTop: 10 }}>{t("playlist_screen.noSongsInLibrary")}</Text>
                  </View>
                ) : (
                  <FlashList<Track>
                    data={modalFilteredTracks}
                    renderItem={renderTrackItem}
                    keyExtractor={(item) => item.id}
                    {...({ estimatedItemSize: 72 } as any)}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.border }]}
                  onPress={() => { setIsModalVisible(false); setEditingPlaylistId(null); setSelectedTracks([]); }}
                  accessibilityRole="button"
                  accessibilityLabel={t("common.cancel")}
                >
                  <Text style={{ color: colors.subText, fontWeight: "600" }}>{t("common.cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.primary, opacity: newPlaylistName.trim() ? 1 : 0.5 }]}
                  onPress={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  accessibilityRole="button"
                  accessibilityLabel={editingPlaylistId ? t("common.update") : t("common.create")}
                >
                  <Text style={{ color: "#FFF", fontWeight: "700" }}>
                    {editingPlaylistId ? t("common.update") : t("common.create")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
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
    marginBottom: 20,
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
  headerTitle: { color: "#FFFFFF", fontSize: 32, fontWeight: "800" },
  headerIcons: { flexDirection: "row", gap: 15 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesWrapper: { marginBottom: 30 },
  categoriesList: { paddingHorizontal: 20, gap: 12 },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: { fontSize: 14, fontWeight: "600" },
  sectionTitle: { fontSize: 20, fontWeight: "700", paddingHorizontal: 20, marginBottom: 15 },
  featuredList: { paddingHorizontal: 20, gap: 20 },
  featuredCard: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 24,
    padding: 20,
    justifyContent: "space-between",
    position: 'relative',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  emptyCard: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardGenreWrapper: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cardGenre: { color: "#FFFFFF", fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  cardInfo: { marginTop: "auto" },
  cardTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800", marginBottom: 4 },
  cardAuthor: { color: "rgba(255, 255, 255, 0.8)", fontSize: 13, fontWeight: "500" },
  playOverlay: { position: 'absolute', bottom: 20, right: 20 },
  librarySection: { marginTop: 30 },
  libraryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  libraryIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  libraryItemInfo: { flex: 1 },
  libraryItemTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  libraryItemStats: { fontSize: 12 },
  libraryItemMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  libraryItemActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionBtn: { padding: 8 },
  fullListSection: { marginTop: 30 },
  trackListContainer: {
    marginHorizontal: 20,
    gap: 0,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  trackListIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackListInfo: { flex: 1 },
  trackItemTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  trackItemArtist: { fontSize: 12 },
  createNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
  },
  createNewText: { fontSize: 16, fontWeight: "600" },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: width * 0.9,
    height: screenHeight * 0.82,
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalTitle: { fontSize: 24, fontWeight: "800", marginBottom: 20, textAlign: 'center' },
  inputWrapper: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  inputField: { width: '100%' },
  input: {
    fontSize: 16,
    padding: 0,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubtitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  listContainer: { flex: 1, minHeight: 100, marginBottom: 20 },
  trackSelector: { flex: 1 },
  trackSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  trackSelectInfo: { flex: 1, marginRight: 10 },
  trackSelectTitle: { fontSize: 14, fontWeight: "600" },
  trackSelectArtist: { fontSize: 12 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  innerSearchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  }
});
