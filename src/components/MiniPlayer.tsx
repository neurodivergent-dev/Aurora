import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { useMusicStore } from '../store/musicStore';
import { useTheme } from './ThemeProvider';
import { router, usePathname } from 'expo-router';

const { width } = Dimensions.get('window');

export const MiniPlayer: React.FC = () => {
  const { currentTrack, isPlaying, play, pause, next } = useMusicStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  React.useEffect(() => {
    // Otomatik lokal müzik taraması kaldırıldı (artık sadece 'Yenile' tuşuna tıklandığında).
  }, []);

  // Sadece ana sayfa (Kitaplık) ekranında göster
  const isHidden = pathname !== '/' || !currentTrack;

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
      {!isHidden && (
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
          <TouchableOpacity 
            style={styles.content} 
            activeOpacity={0.8}
            onPress={() => router.push('/music-player')}
          >
            <View style={[styles.artwork, { backgroundColor: colors.primary + '20', overflow: 'hidden' }]}>
              {currentTrack?.artwork ? (
                <Image 
                  source={{ uri: currentTrack.artwork }} 
                  style={styles.artworkImage}
                  resizeMode="cover"
                />
              ) : (
                <Music size={20} color={colors.primary} />
              )}
            </View>
            
            <View style={styles.info}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {currentTrack ? currentTrack.title : 'Müzik Çalar'}
              </Text>
              <Text style={[styles.artist, { color: colors.subText }]} numberOfLines={1}>
                {currentTrack ? currentTrack.artist : 'Listeyi görmek için tıklayın'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.controls}>
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
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  content: {
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
    gap: 8,
  },
  controlBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
