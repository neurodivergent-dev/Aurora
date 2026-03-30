import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Headphones, Plus, Sparkles } from "lucide-react-native";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn, ZoomIn } from "react-native-reanimated";
import { useMusicStore } from "../store/musicStore";
import * as Haptics from "expo-haptics";
import { soundService } from "../services/SoundService";

const { width } = Dimensions.get("window");

export const EmptyState: React.FC = () => {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const { loadLocalMusic } = useMusicStore();

  const handleAddMusic = () => {
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    loadLocalMusic();
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeIn.duration(1000)}
        style={[
          styles.sexyCard, 
          { 
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            borderColor: colors.primary + '30'
          }
        ]}
      >
        <LinearGradient
          colors={[colors.primary + '10', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
        
        <Animated.View entering={ZoomIn.delay(300).duration(600)} style={styles.illustration}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
            <Headphones size={48} color={colors.primary} strokeWidth={1.5} />
            <Animated.View 
              entering={FadeIn.delay(800)}
              style={styles.sparklePos}
            >
              <Sparkles size={20} color={colors.primary} fill={colors.primary + '40'} />
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("playlist_screen.noSongsInLibrary")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>
            {t("playlist_screen.localFilesDesc")}
          </Text>
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(700).duration(600)}>
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={handleAddMusic}
            activeOpacity={0.8}
          >
            <Plus size={20} color="#FFF" strokeWidth={2.5} />
            <Text style={styles.addBtnText}>{t("home.addLocalMusic")}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  sexyCard: {
    width: '100%',
    padding: 40,
    borderRadius: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    overflow: 'hidden',
  },
  illustration: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sparklePos: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 22,
    gap: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
