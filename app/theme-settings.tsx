import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useThemeStore } from "../src/store/themeStore";
import { THEMES } from "../src/constants/themes";
import { useTheme } from "../src/components/ThemeProvider";
import { CustomAlert } from "../src/components/CustomAlert";
import ThemedButton from "../src/components/ThemedButton";
import { ChevronLeft, Palette, Box, Sparkles, Waves, CircleOff, Atom, Hexagon, Star, ChevronDown, Activity, Wind, Grid3X3, Music, Volume2, Trees, CloudRain, Moon, Bell, Zap, Circle, Trash2 } from "lucide-react-native";
import Animated, { FadeIn, FadeOut, Layout, FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { BackgroundEffectType } from "../src/store/themeStore";

export default function ThemeSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDarkMode, themeId } = useTheme();
  const { setBackgroundEffect, backgroundEffect, setThemeId, customThemes, removeCustomTheme } = useThemeStore((state) => ({
    setThemeId: state.setThemeId,
    removeCustomTheme: state.removeCustomTheme,
    setBackgroundEffect: state.setBackgroundEffect,
    backgroundEffect: state.backgroundEffect,
    customThemes: state.customThemes,
  }));
  const { t } = useTranslation();

  // Combine default and custom themes
  const allThemes = [...THEMES, ...customThemes];

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Tema seçme işleyicisi
  const handleThemeSelect = (id: string) => {
    setThemeId(id);
  };

  // Custom theme silme işleyicisi
  const handleDeleteTheme = (id: string, name: string) => {
    if (customThemes.length === 1) {
      // Son tema, direkt sil
      removeCustomTheme(id);
    } else {
      // Custom alert göster
      setThemeToDelete({ id, name });
      setDeleteAlertVisible(true);
    }
  };

  const confirmDelete = () => {
    if (themeToDelete) {
      removeCustomTheme(themeToDelete.id);
      setDeleteAlertVisible(false);
      setThemeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteAlertVisible(false);
    setThemeToDelete(null);
  };

  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    themes: false,
    effects: false,
    preview: false
  });

  // Delete alert state
  const [deleteAlertVisible, setDeleteAlertVisible] = React.useState(false);
  const [themeToDelete, setThemeToDelete] = React.useState<{ id: string; name: string } | null>(null);

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const CollapsibleSection = ({
    id,
    title,
    icon: Icon,
    children,
    isOpen
  }: {
    id: string,
    title: string,
    icon: any,
    children: React.ReactNode,
    isOpen: boolean
  }) => (
    <View style={[styles.sectionWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(id)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Icon size={20} color={colors.primary} />
          </View>
          <Text style={[styles.sectionTitleText, { color: colors.text }]}>{title}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
          <ChevronDown size={20} color={colors.subText} />
        </Animated.View>
      </TouchableOpacity>

      {isOpen && (
        <Animated.View
          layout={Layout.springify()}
          style={styles.sectionContent}
        >
          {children}
        </Animated.View>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <CustomAlert
        visible={deleteAlertVisible}
        title={t('themeSettings.deleteTheme', 'Temayı Sil')}
        message={t('themeSettings.deleteConfirm', { name: themeToDelete?.name })}
        type="danger"
        confirmText={t('common.delete', 'Sil')}
        cancelText={t('common.cancel', 'İptal')}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary || colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, {
            paddingTop: insets.top + 12
          }]}
        >

          {/* Decorative background elements */}
          <View style={styles.headerDecorationCircle1} />
          <View style={styles.headerDecorationCircle2} />

          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color="#FFFFFF" />
            <Text
              style={[styles.backText, { color: "#FFFFFF" }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {t("settings.title", "Ayarlar")}
            </Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text
              style={[styles.headerTitle, { color: "#FFFFFF" }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {t("themeSettings.title", "Tema Ayarları")}
            </Text>
          </View>
          <View style={styles.rightPlaceholder} />
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentHeader}>
            <View style={[styles.mainIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Palette size={32} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {t("themeSettings.customization", "Tema Özelleştirme")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>
              {t(
                "themeSettings.customizeAppearance",
                "Uygulamanızın görünümünü özelleştirin"
              )}
            </Text>
          </View>

          <CollapsibleSection
            id="themes"
            title={t("themeSettings.themes", "Temalar")}
            icon={Palette}
            isOpen={openSections.themes}
          >
            <View style={styles.themesGrid}>
              {allThemes.map((theme) => {
                const isCustom = customThemes.some(t => t.id === theme.id);
                return (
                  <TouchableOpacity
                    key={theme.id}
                    style={[
                      styles.themeCard,
                      {
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderColor: themeId === theme.id ? theme.colors.primary : 'transparent',
                        borderWidth: themeId === theme.id ? 2 : 1,
                      },
                    ]}
                    onPress={() => handleThemeSelect(theme.id)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[theme.colors.primary + '10', theme.colors.secondary + '10']}
                      style={styles.themeCardGradient}
                    >
                      {/* Delete button - only for custom themes */}
                      {isCustom && (
                        <TouchableOpacity
                          style={[
                            styles.deleteButton,
                            { backgroundColor: isDarkMode ? 'rgba(255,50,50,0.2)' : 'rgba(255,50,50,0.1)' }
                          ]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteTheme(theme.id, theme.name);
                          }}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={14} color="#FF4444" />
                        </TouchableOpacity>
                      )}
                      
                      <View style={styles.themeColorRing}>
                        <View
                          style={[
                            styles.themePreview,
                            {
                              backgroundColor: theme.colors.primary,
                              shadowColor: theme.colors.primary,
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 6,
                            },
                          ]}
                        />
                      </View>
                      {/* Badge Handling */}
                      <Text
                        style={[
                          styles.themeCardTitle,
                          { color: colors.text },
                          themeId === theme.id && {
                            fontWeight: "700",
                            color: theme.colors.primary,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {t(`themeNames.${theme.id}`, theme.name)}
                      </Text>
                      <View style={styles.colorDotsContainer}>
                        <View style={[styles.colorDot, { backgroundColor: theme.colors.primary }]} />
                        <View style={[styles.colorDot, { backgroundColor: theme.colors.secondary }]} />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </CollapsibleSection>

          <CollapsibleSection
            id="effects"
            title={t("themeSettings.backgroundEffects", "Efektler")}
            icon={Box}
            isOpen={openSections.effects}
          >
            <View style={styles.effectsContainer}>
              {[
                { id: 'bokeh', name: t("themeSettings.effectBokeh", "Rüya Odaklaması"), icon: Circle },
                { id: 'quantum', name: t("themeSettings.effectQuantum", "Kuantum Tozu"), icon: Sparkles },
                { id: 'crystals', name: t("themeSettings.effectCrystals", "Atom Modeli"), icon: Atom },
                { id: 'tesseract', name: t("themeSettings.effectTesseract", "Tesseract"), icon: Hexagon },
                { id: 'aurora', name: t("themeSettings.effectAurora", "Aurora Işıkları"), icon: Star },
                { id: 'matrix', name: t("themeSettings.effectMatrix", "Matrix Akışı"), icon: Activity },
                { id: 'vortex', name: t("themeSettings.effectVortex", "Girdap Enerjisi"), icon: Wind },
                { id: 'grid', name: t("themeSettings.effectGrid", "Siber Izgara"), icon: Grid3X3 },
                { id: 'silk', name: t("themeSettings.effectSilk", "Sıvı İpek"), icon: Wind },
                { id: 'prism', name: t("themeSettings.effectPrism", "Prizma Işığı"), icon: Zap },
                { id: 'nebula', name: t("themeSettings.effectNebula", "Sıvı Nebula"), icon: CloudRain },
                { id: 'flow', name: t("themeSettings.effectFlow", "Siber Akış"), icon: Activity },
                { id: 'blackhole', name: t("themeSettings.effectBlackhole"), icon: Circle },
                { id: 'stardust', name: t("themeSettings.effectStardust"), icon: Sparkles },
                { id: 'neural', name: t("themeSettings.effectNeural"), icon: Zap },
                { id: 'dna', name: t("themeSettings.effectDna"), icon: Atom },
                { id: 'winamp', name: t("themeSettings.effectWinamp", "Winamp Viz"), icon: Music },
                { id: 'none', name: t("themeSettings.effectNone", "Yok"), icon: CircleOff },
              ].map((effect) => (
                <TouchableOpacity
                  key={effect.id}
                  style={[
                    styles.effectCard,
                    {
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderColor: backgroundEffect === effect.id ? colors.primary : 'transparent',
                      borderWidth: backgroundEffect === effect.id ? 2 : 1,
                    }
                  ]}
                  onPress={() => setBackgroundEffect(effect.id as BackgroundEffectType)}
                >
                  <View style={[
                    styles.effectIconContainer,
                    { backgroundColor: backgroundEffect === effect.id ? colors.primary + '20' : colors.subText + '10' }
                  ]}>
                    <effect.icon size={20} color={backgroundEffect === effect.id ? colors.primary : colors.subText} />
                  </View>
                  <Text style={[
                    styles.effectName,
                    { color: backgroundEffect === effect.id ? colors.text : colors.subText }
                  ]}>
                    {effect.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </CollapsibleSection>

          <CollapsibleSection
            id="preview"
            title={t("themeSettings.preview", "Önizleme")}
            icon={Sparkles}
            isOpen={openSections.preview}
          >
            <View style={[styles.previewCardContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }]}>
              <LinearGradient
                colors={[colors.primary + '10', colors.secondary + '10']}
                style={styles.previewCardGradient}
              >
                <View style={styles.previewCardHeader}>
                  <Text style={[styles.previewCardTitle, { color: colors.text }]}>
                    {t("themeSettings.sampleCard", "Örnek Kart")}
                  </Text>
                  <View style={[styles.previewBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.previewBadgeText}>New</Text>
                  </View>
                </View>
                <Text style={[styles.previewDescription, { color: colors.subText }]}>
                  {t(
                    "themeSettings.previewDescription",
                    "Bu bir tema önizlemesidir. Renklerin ve bileşenlerin nasıl göründüğünü kontrol edin."
                  )}
                </Text>

                <View style={styles.buttonPreviewContainer}>
                  <ThemedButton
                    title={t("themeSettings.primaryButton", "Birincil Buton")}
                    onPress={() => { }}
                    style={styles.previewButton}
                  />
                  <ThemedButton
                    title={t("themeSettings.secondaryButton", "İkincil Buton")}
                    onPress={() => { }}
                    variant="secondary"
                    style={styles.previewButton}
                  />
                  <ThemedButton
                    title={t("themeSettings.dangerButton", "Sil")}
                    onPress={() => { }}
                    variant="danger"
                    style={styles.previewButton}
                  />
                </View>
              </LinearGradient>
            </View>
          </CollapsibleSection>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 60,
    zIndex: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: 'center',
    zIndex: 10,
    paddingHorizontal: 4,
  },
  rightPlaceholder: {
    minWidth: 60,
  },
  backText: {
    fontSize: 15,
    marginLeft: 4,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentHeader: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  mainIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 16,
  },
  themesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  effectsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  effectCard: {
    width: '31%',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  effectIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  effectName: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  themeCard: {
    width: "48%",
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  themeCardGradient: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  themeColorRing: {
    padding: 4,
    borderRadius: 50,
    marginBottom: 12,
  },
  themePreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  specialBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  specialBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  themeCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  colorDotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  previewSection: {
    marginBottom: 40,
  },
  previewCardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  previewCardGradient: {
    padding: 24,
  },
  previewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewCardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  previewBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  previewDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonPreviewContainer: {
    gap: 16,
  },
  previewButton: {
    marginBottom: 0,
    width: '100%',
  },
  sectionWrapper: {
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
});
