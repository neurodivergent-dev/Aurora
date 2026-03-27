import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Pressable,
  Modal,
  FlatList,
  Alert,
  ScrollView,
  Image
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronDown,
  Music,
  Heart,
  Repeat,
  Shuffle,
  Volume2,
  List,
  Trash2,
  Plus,
  FileText,
  Languages
} from "lucide-react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { useMusicStore } from "../store/musicStore";
import { useTheme } from "../components/ThemeProvider";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BackgroundEffects } from "../components/BackgroundEffects";
import TextTicker from 'react-native-text-ticker';

import { CustomAlert } from "../components/CustomAlert";

const { width, height } = Dimensions.get("window");

export const MusicPlayerScreen: React.FC = () => {
  const {
    currentTrack, isPlaying, play, pause, next, prev,
    playbackPosition, playbackDuration, seek, volume,
    setVolume, isShuffled, isRepeating, toggleShuffle,
    toggleRepeat, playlist, localTracks, removeLocalTrack,
    loadLocalMusic, setCurrentTrack, favoriteTrackIds, toggleFavorite, isFavorite, setTrackLyrics, clearAllLyrics
  } = useMusicStore();
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [trackWidth, setTrackWidth] = React.useState(0);
  const [volWidth, setVolWidth] = React.useState(0);
  const [isLibraryVisible, setIsLibraryVisible] = React.useState(false);
  const [lyricsResetAlertVisible, setLyricsResetAlertVisible] = React.useState(false);
  const [resetType, setResetType] = React.useState<'single' | 'all'>('single');
  const [isLyricsVisible, setIsLyricsVisible] = React.useState(false);

  const progressVal = useSharedValue(0);

  React.useEffect(() => {
    progressVal.value = playbackDuration > 0 ? (playbackPosition / playbackDuration) * 100 : 0;
  }, [playbackPosition, playbackDuration]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressVal.value}%` as any,
    };
  });

  const handleSeek = (e: any) => {
    if (trackWidth > 0 && playbackDuration > 0) {
      const x = e.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, x / trackWidth));
      seek(ratio * playbackDuration);
    }
  };

  const handleVolumeSeek = (e: any) => {
    if (volWidth > 0) {
      const x = e.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, x / volWidth));
      setVolume(ratio);
    }
  };

  const handleDeleteLyrics = () => {
    if (!currentTrack) return;
    setLyricsResetAlertVisible(true);
  };

  const confirmLyricsDelete = () => {
    setLyricsResetAlertVisible(false);
    if (currentTrack) {
      setTrackLyrics(currentTrack.id, "");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackgroundEffects />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 10), paddingBottom: insets.bottom }]}>
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <ChevronDown size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Now Playing</Text>
            <TouchableOpacity onPress={() => setIsLibraryVisible(true)} style={styles.iconBtn}>
              <List size={24} color={colors.text} />
            </TouchableOpacity>
          </View>


          {/* Artwork Area */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.artworkContainer}
          >
            <View style={styles.artworkWrapper}>
              {currentTrack?.artwork ? (
                <Image
                  source={{ uri: currentTrack.artwork }}
                  style={styles.artworkImage}
                  resizeMode="cover"
                  onLoadStart={() => console.log("[DEBUG] Image Load Start:", currentTrack.artwork)}
                  onLoad={() => console.log("[DEBUG] Image Load Success")}
                  onError={(e) => console.error("[DEBUG] Image Load Error:", e.nativeEvent.error)}
                />
              ) : (
                <LinearGradient
                  colors={[colors.primary, colors.secondary || colors.primary]}
                  style={styles.artworkGradient}
                >
                  <Music size={120} color="#FFFFFF" opacity={0.5} />
                </LinearGradient>
              )}
            </View>

            <View style={styles.glassInfo}>
              <View style={styles.titleRow}>
                {/* Sol tarafta hizayı mükemmel ortalamak için görünmez boşluk (Sağdaki 44px'lik butonu dengeler) */}
                <View style={{ width: 44 }} />
                
                <View style={{ flex: 1, paddingHorizontal: 10, overflow: 'hidden' }}>
                  <TextTicker
                    style={[styles.trackTitle, { color: colors.text }]}
                    duration={8000}
                    loop
                    bounce
                    repeatSpacer={40}
                    marqueeDelay={1500}
                  >
                    {currentTrack?.title || 'Bilinmeyen Şarkı'}
                  </TextTicker>
                  <Text style={[styles.trackArtist, { color: colors.subText }]} numberOfLines={1}>{currentTrack?.artist || 'Bilinmeyen Sanatçı'}</Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => setIsLyricsVisible(true)}
                  style={[styles.lyricsToggle, { backgroundColor: colors.primary + '15' }]}
                >
                  <FileText size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Player Controls */}
          <View style={styles.playerSection}>
            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <Pressable
                style={styles.progressTrack}
                onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
                onPress={handleSeek}
              >
                <View style={styles.trackBackground}>
                  <Animated.View style={[styles.progressFill, progressStyle, { backgroundColor: colors.primary }]} />
                </View>
              </Pressable>
              <View style={styles.timeRow}>
                <Text style={[styles.timeText, { color: colors.subText }]}>{formatTime(playbackPosition)}</Text>
                <Text style={[styles.timeText, { color: colors.subText }]}>{formatTime(playbackDuration)}</Text>
              </View>
            </View>

            {/* Main Controls */}
            <View style={styles.mainControls}>
              <TouchableOpacity onPress={toggleShuffle} style={styles.secondaryBtn}>
                <Shuffle size={24} color={isShuffled ? colors.primary : colors.text} opacity={isShuffled ? 1 : 0.6} />
              </TouchableOpacity>

              <TouchableOpacity onPress={prev} style={styles.primaryBtn}>
                <SkipBack size={32} color={colors.text} fill={colors.text} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={isPlaying ? pause : play}
                style={[styles.playBtn, { backgroundColor: colors.primary }]}
              >
                {isPlaying ? (
                  <Pause size={40} color="#FFFFFF" fill="#FFFFFF" />
                ) : (
                  <Play size={40} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 6 }} />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={next} style={styles.primaryBtn}>
                <SkipForward size={32} color={colors.text} fill={colors.text} />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleRepeat} style={styles.secondaryBtn}>
                <Repeat size={24} color={isRepeating ? colors.primary : colors.text} opacity={isRepeating ? 1 : 0.6} />
              </TouchableOpacity>
            </View>

            {/* Volume & Extras */}
            <View style={styles.extraControls}>
              <Volume2 size={20} color={colors.text} opacity={0.5} />
              <Pressable
                style={styles.volumeTrackContainer}
                onLayout={(e) => setVolWidth(e.nativeEvent.layout.width)}
                onPress={handleVolumeSeek}
              >
                <View style={[styles.volumeTrack, { backgroundColor: colors.border }]}>
                  <View style={[styles.volumeFill, { width: `${volume * 100}%`, backgroundColor: colors.primary }]} />
                </View>
              </Pressable>

              <TouchableOpacity
                onPress={() => currentTrack && toggleFavorite(currentTrack.id)}
                style={styles.secondaryBtn}
              >
                <Heart
                  size={24}
                  color={currentTrack && isFavorite(currentTrack.id) ? "#FF4444" : colors.text}
                  fill={currentTrack && isFavorite(currentTrack.id) ? "#FF4444" : "transparent"}
                  opacity={currentTrack && isFavorite(currentTrack.id) ? 1 : 0.5}
                />
              </TouchableOpacity>
            </View>
          </View>


        </View>
      </View>

      {/* Library Modal */}
      <Modal
        visible={isLibraryVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLibraryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Müzik Kitaplığı</Text>
              <TouchableOpacity onPress={() => setIsLibraryVisible(false)} style={styles.closeBtn}>
                <ChevronDown size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary + '20' }]}
              onPress={() => loadLocalMusic()}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={[styles.addBtnText, { color: colors.primary }]}>Cihazdan Şarkı Ekle</Text>
            </TouchableOpacity>

            <FlatList
              data={playlist}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isCurrent = currentTrack?.id === item.id;
                const isLocal = item.genre === 'Local';

                return (
                  <View style={[styles.trackItem, isCurrent && { backgroundColor: colors.primary + '10' }]}>
                    <TouchableOpacity
                      style={styles.trackInfo}
                      onPress={() => {
                        setCurrentTrack(item);
                        play();
                        setIsLibraryVisible(false);
                      }}
                    >
                      <View style={[styles.trackIcon, { backgroundColor: isCurrent ? colors.primary : colors.border }]}>
                        <Music size={16} color={isCurrent ? "#FFFFFF" : colors.subText} />
                      </View>
                      <View style={styles.trackDetails}>
                        <Text style={[styles.trackItemTitle, { color: isCurrent ? colors.primary : colors.text }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={[styles.trackItemArtist, { color: colors.subText }]} numberOfLines={1}>
                          {item.artist}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {isLocal && (
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            "Şarkıyı Kaldır",
                            `"${item.title}" şarkısını kitaplıktan kaldırmak istediğine emin misin?`,
                            [
                              { text: "Vazgeç", style: "cancel" },
                              {
                                text: "Kaldır",
                                style: "destructive",
                                onPress: () => removeLocalTrack(item.id)
                              }
                            ]
                          );
                        }}
                        style={styles.deleteBtn}
                      >
                        <Trash2 size={20} color="#FF4444" opacity={0.7} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={{ color: colors.subText }}>Kitaplığın boş.</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Lyrics Modal */}
      <Modal
        visible={isLyricsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLyricsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, height: height * 0.7 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Şarkı Sözleri</Text>
                <Text style={{ color: colors.subText, fontSize: 12 }}>{currentTrack?.title}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {currentTrack?.lyrics && (
                  <TouchableOpacity
                    onPress={handleDeleteLyrics}
                    style={styles.closeBtn}
                  >
                    <Trash2 size={20} color="#FF4444" opacity={0.6} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setIsLyricsVisible(false)} style={styles.closeBtn}>
                  <ChevronDown size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 20 }}
            >
              {currentTrack?.lyrics ? (
                <Text style={[styles.lyricsText, { color: colors.text }]}>
                  {currentTrack.lyrics.replace(/\\n/g, '\n')}
                </Text>
              ) : (
                <View style={styles.noLyricsContainer}>
                  <Languages size={48} color={colors.subText} opacity={0.3} />
                  <Text style={[styles.noLyricsText, { color: colors.subText }]}>
                    Şarkı sözleri henüz eklenmemiş.
                  </Text>
                  <Text style={[styles.noLyricsSub, { color: colors.subText }]}>
                    AI Chat'e gidip "bu şarkının sözlerini bul" diyebilirsin!
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={lyricsResetAlertVisible}
        title="Sözleri Sil"
        message="Bu şarkının sözlerini silmek istediğine emin misin?"
        type="danger"
        confirmText="Sil"
        cancelText="Vazgeç"
        onConfirm={confirmLyricsDelete}
        onCancel={() => setLyricsResetAlertVisible(false)}
      />

    </View>
  );
};

const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  artworkContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 30,
  },
  artworkWrapper: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  artworkGradient: {
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
  glassInfo: {
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lyricsToggle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  trackArtist: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  playerSection: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    marginTop: 40,
  },
  progressSection: {
    marginBottom: 30,
  },
  progressTrack: {
    height: 16,
    justifyContent: 'center',
    marginBottom: 4,
  },
  trackBackground: {
    height: 4,
    backgroundColor: "rgba(150, 150, 150, 0.2)",
    borderRadius: 2,
    width: '100%',
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    fontWeight: "600",
  },
  mainControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  primaryBtn: {
    padding: 10,
  },
  secondaryBtn: {
    padding: 10,
  },
  extraControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  volumeTrackContainer: {
    flex: 1,
    height: 16,
    justifyContent: 'center',
  },
  volumeTrack: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 1.5,
    width: '100%',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  addBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 40,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  trackInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackDetails: {
    flex: 1,
  },
  trackItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  trackItemArtist: {
    fontSize: 13,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  lyricsText: {
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 20,
    letterSpacing: 0.3,
  },
  noLyricsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  noLyricsText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  noLyricsSub: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  }
});
