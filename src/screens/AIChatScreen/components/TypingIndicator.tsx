import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withTiming, useSharedValue, withRepeat, withDelay } from 'react-native-reanimated';

const Dot = ({ backgroundColor, delay }: { backgroundColor: string, delay: number }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withDelay(delay, withTiming(1.5, { duration: 600 })),
      -1,
      true
    );
  }, [delay, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: withTiming(scale.value > 1.2 ? 1 : 0.5, { duration: 300 }),
  }));

  return <Animated.View style={[styles.typingDot, { backgroundColor }, animatedStyle]} />;
};

export const TypingIndicator = ({ colors, isDarkMode }: { colors: any, isDarkMode: boolean }) => {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={[
        styles.premiumTypingContainer,
        {
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          borderColor: colors.primary + '30'
        }
      ]}
    >
      <View style={styles.typingDotsRow}>
        <Dot backgroundColor={colors.primary} delay={0} />
        <Dot backgroundColor={colors.primary} delay={200} />
        <Dot backgroundColor={colors.primary} delay={400} />
      </View>
      <Text style={[styles.premiumTypingText, { color: colors.text }]}>
        {t('settings.ai.chat.typing')}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  premiumTypingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 20,
    marginBottom: 15,
    borderWidth: 1,
    gap: 12,
  },
  typingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  premiumTypingText: {
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
