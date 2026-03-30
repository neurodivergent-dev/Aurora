import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Pause, SkipForward, SkipBack, Music, Trash2, ListMusic, X, Plus, Check, Heart } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useMusicStore } from '../store/musicStore';
import { useTheme } from './ThemeProvider';
import { useTranslation } from 'react-i18next';
import { router, usePathname } from 'expo-router';
import { CustomAlert } from './CustomAlert';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    play,
    pause,
    next,
    prev,
    selectedTrackIds,
    clearSelection,
    removeLocalTracks,
    myPlaylists,
    updatePlaylist,
    toggleFavorite,
    isFavorite
  } = useMusicStore();

  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);

  // Sadece ana sayfa (Kitaplık) ekranında göster
  const isSelectionMode = selectedTrackIds.length > 0;
  const areAllSelectedFavorite = isSelectionMode && selectedTrackIds.every(id => isFavorite(id));
  const isHidden = pathname !== '/' || (!currentTrack && !isSelectionMode);

  if (isHidden) return null;

  const handleConfirmDelete = () => {
    removeLocalTracks(selectedTrackIds);
    clearSelection();
    setDeleteAlertVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    const playlist = myPlaylists.find(p => p.id === playlistId);
    if (playlist) {
      // Mevcut şarkıları koru, seçilenleri ekle (duplikasyon engelleme ile)
      const newTrackIds = [...new Set([...playlist.trackIds, ...selectedTrackIds])];
      updatePlaylist(playlistId, playlist.name, newTrackIds);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPlaylistModalVisible(false);
      clearSelection();
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: (insets.bottom || 15) + 65,
        zIndex: 100
      }}
      pointerEvents="box-none"
    >
      <Animated.View
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(300)}
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          }
        ]}
      >
        {!isSelectionMode ? (
          /* NORMAL MINI PLAYER MODE */
          <View style={styles.contentRow}>
            <TouchableOpacity
              style={styles.infoSection}
              activeOpacity={0.8}
              onPress={() => router.push('/music-player')}
            >
              <View style={[styles.artwork, { backgroundColor: colors.primary + '20' }]}>
                {currentTrack?.artwork ? (
                  <Image source={{ uri: currentTrack.artwork }} style={styles.artworkImage} resizeMode="cover" />
                ) : (
                  <Music size={20} color={colors.primary} />
                )}
              </View>

              <View style={styles.info}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                  {currentTrack?.title}
                </Text>
                <Text style={[styles.artist, { color: colors.subText }]} numberOfLines={1}>
                  {currentTrack?.artist || 'Aurora'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (currentTrack) {
                  toggleFavorite(currentTrack.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={styles.controlBtn}
              accessibilityRole="button"
              accessibilityLabel={currentTrack && isFavorite(currentTrack.id) ? t('a11y.favoriteActive') : t('a11y.favorite')}
            >
              <Heart
                size={22}
                color={currentTrack && isFavorite(currentTrack.id) ? "#FF4444" : colors.text}
                fill={currentTrack && isFavorite(currentTrack.id) ? "#FF4444" : "transparent"}
                opacity={currentTrack && isFavorite(currentTrack.id) ? 1 : 0.6}
              />
            </TouchableOpacity>

            <View style={styles.controls}>
              <TouchableOpacity onPress={prev} style={styles.controlBtn}>
                <SkipBack size={24} color={colors.text} fill={colors.text} />
              </TouchableOpacity>

              <TouchableOpacity onPress={isPlaying ? pause : play} style={styles.controlBtn}>
                {isPlaying ? (
                  <Pause size={24} color={colors.primary} fill={colors.primary} />
                ) : (
                  <Play size={24} color={colors.primary} fill={colors.primary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={next} style={styles.controlBtn}>
                <SkipForward size={24} color={colors.text} fill={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* SELECTION ACTION BAR MODE */
          <Animated.View entering={FadeIn} style={styles.contentRow}>
            <View style={styles.selectionLeft}>
              <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.countText}>{selectedTrackIds.length}</Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>{t('common.selected')}</Text>
            </View>

            <View style={styles.selectionRight}>
              <TouchableOpacity
                onPress={() => {
                  useMusicStore.getState().playSelectedTracks();
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
                style={styles.actionBtn}
              >
                <Play size={22} color={colors.primary} fill={colors.primary + '20'} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (myPlaylists.length > 0) {
                    setPlaylistModalVisible(true);
                  } else {
                    clearSelection();
                    router.push('/(tabs)/playlists');
                  }
                }}
                style={styles.actionBtn}
              >
                <ListMusic size={22} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (areAllSelectedFavorite) {
                    // Hepsi favoriyse, hepsini favoriden çıkar
                    selectedTrackIds.forEach(id => {
                      if (isFavorite(id)) toggleFavorite(id);
                    });
                  } else {
                    // En az biri favori değilse, eksik kalanları favori yap
                    selectedTrackIds.forEach(id => {
                      if (!isFavorite(id)) toggleFavorite(id);
                    });
                  }
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  clearSelection();
                }}
                style={styles.actionBtn}
              >
                <Heart 
                  size={22} 
                  color={areAllSelectedFavorite ? "#FF4444" : colors.text} 
                  fill={areAllSelectedFavorite ? "#FF4444" : "transparent"}
                  opacity={areAllSelectedFavorite ? 1 : 0.6}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDeleteAlertVisible(true)}
                style={styles.actionBtn}
              >
                <Trash2 size={22} color="#EF4444" />
              </TouchableOpacity>

              <View style={[styles.separator, { backgroundColor: colors.border }]} />

              <TouchableOpacity onPress={clearSelection} style={styles.closeBtn}>
                <X size={22} color={colors.subText} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </Animated.View>

      {/* Playlist Selection Modal */}
      <Modal
        visible={playlistModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPlaylistModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPlaylistModalVisible(false)}
        >
          <Animated.View
            entering={SlideInDown}
            exiting={SlideOutDown}
            style={styles.modalContentWrapper}
          >
            <BlurView
              intensity={isDarkMode ? 80 : 100}
              tint={isDarkMode ? 'dark' : 'light'}
              style={[styles.playlistModal, { backgroundColor: isDarkMode ? 'rgba(25, 25, 28, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('home.playlists')}</Text>
                <TouchableOpacity onPress={() => setPlaylistModalVisible(false)}>
                  <X size={24} color={colors.subText} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.playlistList} showsVerticalScrollIndicator={false}>
                {myPlaylists.map((playlist) => (
                  <TouchableOpacity
                    key={playlist.id}
                    style={[styles.playlistItem, { borderBottomColor: colors.border + '30' }]}
                    onPress={() => handleAddToPlaylist(playlist.id)}
                  >
                    <View style={[styles.playlistIcon, { backgroundColor: colors.primary + '20' }]}>
                      <ListMusic size={20} color={colors.primary} />
                    </View>
                    <View style={styles.playlistInfo}>
                      <Text style={[styles.playlistName, { color: colors.text }]}>{playlist.name}</Text>
                      <Text style={[styles.playlistCount, { color: colors.subText }]}>{playlist.trackIds.length} {t('home.library')}</Text>
                    </View>
                    <Plus size={20} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.createListBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setPlaylistModalVisible(false);
                  clearSelection();
                  router.push('/(tabs)/playlists');
                }}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.createListBtnText}>{t('home.addLocalMusic')}</Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <CustomAlert
        visible={deleteAlertVisible}
        title={t('home.deleteTrackTitle')}
        message={t('home.deleteTrackConfirm')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteAlertVisible(false)}
        type="danger"
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  infoSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  artist: {
    fontSize: 12,
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* Selection Styles */
  selectionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  selectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 20,
    marginHorizontal: 8,
    opacity: 0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContentWrapper: {
    padding: 16,
    paddingBottom: 40,
  },
  playlistModal: {
    borderRadius: 24,
    padding: 20,
    maxHeight: 400,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  playlistList: {
    marginBottom: 20,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  playlistIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '700',
  },
  playlistCount: {
    fontSize: 12,
    opacity: 0.6,
  },
  createListBtn: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createListBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
