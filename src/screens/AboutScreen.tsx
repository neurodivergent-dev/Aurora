import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Linking,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Github,
  Mail,
  Heart,
  Palette,
  Brain,
  Sparkles,
  Cloud,
  Zap,
  Play,
  Music2,
  Wind,
  Layers,
  Cpu,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import AuroraLogo from "../../components/LogoComponent";
import Constants from "expo-constants";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Svg, Circle, Path } from "react-native-svg";

const ProductHuntIcon = ({ size = 20, color }: { size?: number, color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M10 8H13.5C14.8807 8 16 9.11929 16 10.5C16 11.8807 14.8807 13 13.5 13H10V8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 13V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M10 8V13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
  </Svg>
);

export const AboutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();

  const handleBack = () => {
    router.back();
  };

  const handleOpenGithub = () => {
    Linking.openURL("https://github.com/neurodivergent-dev");
  };

  const handleSendEmail = () => {
    Linking.openURL("mailto:melihcandemir@protonmail.com");
  };

  const handleOpenPlayStore = () => {
    Linking.openURL("https://play.google.com/store/apps/dev?id=5145471264212833611&hl=en");
  };

  const handleOpenProductHunt = () => {
    Linking.openURL("https://www.producthunt.com/@melihcandemir");
  };

  // Advanced Feature Card component with Reanimated
  const FeatureCard = ({ icon: Icon, label, color }: { icon: React.ElementType, label: string, color: string }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
      };
    });

    const handlePressIn = () => {
      scale.value = withSpring(0.92, { damping: 10, stiffness: 200 });
      opacity.value = withTiming(0.85, { duration: 100 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 150 });
    };

    return (
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Animated.View style={[
          styles.featureCard,
          {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : colors.card,
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : colors.border,
          },
          animatedStyle
        ]}>
          <LinearGradient
            colors={[
              'transparent',
              isDarkMode ? 'rgba(255,255,255,0.03)' : (color || colors.primary) + "08"
            ]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={[
            styles.iconContainer,
            {
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : (color || colors.primary) + '12',
              borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : (color || colors.primary) + '20'
            }
          ]}>
            <Icon size={22} color={color || colors.primary} strokeWidth={2.2} />
          </View>
          <Text
            style={[styles.featureLabel, { color: colors.text }]}
            numberOfLines={2}
          >
            {label}
          </Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary || colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, {
          paddingTop: insets.top + (Platform.OS === 'ios' ? 12 : 24)
        }]}
      >
        {/* Decorative background elements */}
        <View style={styles.headerDecorationCircle1} />
        <View style={styles.headerDecorationCircle2} />

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t("about.back", { defaultValue: "Settings" })}
        >
          <ChevronLeft size={24} color="#FFFFFF" style={styles.headerIconShadow} />
          <Text
            style={[styles.backText, { color: "#FFFFFF" }, styles.headerTextShadow]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {t("about.back", { defaultValue: "Settings" })}
          </Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, { color: "#FFFFFF" }, styles.headerTextShadow]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {t("about.title")}
          </Text>
        </View>
        <View style={styles.rightPlaceholder} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}
      >
        <View style={styles.logoContainer}>
          {/* App SVG Logo */}
          <View style={styles.logoWrapper} accessible={true} accessibilityRole="image" accessibilityLabel="Aurora Logo">
            <AuroraLogo size={100} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]} accessibilityRole="header">
            Aurora
          </Text>
          <View style={styles.versionBadge} accessible={true} accessibilityRole="text">
            <Text style={[styles.versionText, { color: colors.primary }]}>
              {t("about.version")}: v{Constants.expoConfig?.version || Constants.manifest2?.extra?.expoClient?.version || "1.0.0"}
            </Text>
          </View>
        </View>

        <LinearGradient
          colors={[
            colors.primary + '15',
            (colors.secondary || colors.primary) + '15',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.section, { borderWidth: 1, borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : colors.primary + '30', backgroundColor: colors.card }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header">
            {t("about.title")}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {t("about.description")}
          </Text>

          <View style={{ height: 32 }} />

          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
            {t("about.featuresTitle")}
          </Text>
          <View style={styles.featuresGrid}>
            <FeatureCard icon={Music2} label={t("about.features.musicExperience")} color={colors.primary} />
            <FeatureCard icon={Brain} label={t("about.features.agenticAI")} color={colors.success} />
            <FeatureCard icon={Palette} label={t("about.features.dynamicThemes")} color={colors.warning} />
            <FeatureCard icon={Layers} label={t("about.features.backgroundEffects")} color={colors.info} />
          </View>
        </LinearGradient>

        <View style={styles.connectContainer}>
          <Text style={[styles.sectionSubtitle, { color: colors.text, marginHorizontal: 20, marginBottom: 16 }]}>
            {t("about.connectTitle")}
          </Text>
          <View style={styles.actionChips}>
            <TouchableOpacity
              style={[styles.actionChip, { backgroundColor: colors.primary + '15' }]}
              onPress={handleOpenPlayStore}
              accessibilityRole="link"
              accessibilityLabel={t("a11y.playStore", { defaultValue: "Play Store" })}
            >
              <Play size={22} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionChip, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#f3f4f6' }]}
              onPress={handleOpenGithub}
              accessibilityRole="link"
              accessibilityLabel={t("a11y.github", { defaultValue: "GitHub" })}
            >
              <Github size={22} color={isDarkMode ? '#fff' : '#111827'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionChip, { backgroundColor: '#da552f15' }]}
              onPress={handleOpenProductHunt}
              accessibilityRole="link"
              accessibilityLabel={t("a11y.productHunt", { defaultValue: "Product Hunt" })}
            >
              <ProductHuntIcon size={22} color="#da552f" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionChip, { backgroundColor: colors.secondary + '15' }]}
              onPress={handleSendEmail}
              accessibilityRole="button"
              accessibilityLabel={t("a11y.email", { defaultValue: "Email" })}
            >
              <Mail size={22} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={[styles.footerDivider, { backgroundColor: colors.border, opacity: 0.3 }]} />

          <Text style={[styles.copyright, { color: colors.text, opacity: 0.7 }]}>
            {t("about.copyright")}
          </Text>

          <View style={styles.madeWithContainer} accessible={true} accessibilityRole="text" accessibilityLabel={`${t("about.madeWith")} love ${t("about.inTurkey")}`}>
            <Text style={[styles.madeLoveText, { color: colors.subText }]}>
              {t("about.madeWith")}
            </Text>
            <View style={styles.heartPulse}>
              <Heart size={14} color="#EF4444" fill="#EF4444" />
            </View>
            <Text style={[styles.madeLoveText, { color: colors.subText }]}>
              {t("about.inTurkey")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerDecorationCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
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
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerTextShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerIconShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    marginTop: 4,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  featureCard: {
    width: '48%',
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: -0.2,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  connectContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  actionChips: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  actionChip: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  footer: {
    alignItems: "center",
    marginTop: 8,
    paddingBottom: 40,
  },
  footerDivider: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: 24,
  },
  copyright: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  madeLoveText: {
    fontSize: 13,
    fontWeight: "500",
  },
  madeWithContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(150, 150, 150, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heartPulse: {
    marginHorizontal: 6,
  },
});
