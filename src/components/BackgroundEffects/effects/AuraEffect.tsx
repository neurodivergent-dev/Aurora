import React, { useEffect, useMemo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { RadialGradient, Defs, Stop, Circle } from 'react-native-svg';
import { useTheme } from '../../ThemeProvider';
import { styles } from '../styles';

const { width, height } = Dimensions.get('window');

const AuraOrb = React.memo(({ delay = 0, initialX = 0, initialY = 0, size = 400, color = '#fff' }: any) => {
  const scale = useSharedValue(1); const opacity = useSharedValue(0.15);
  const gradId = useMemo(() => `aura-${Math.random()}`, []);
  useEffect(() => {
    scale.value = withRepeat(withTiming(1.4, { duration: 10000 }), -1, true);
    opacity.value = withRepeat(withTiming(0.3, { duration: 8000 }), -1, true);
  }, []);
  return (
    <Animated.View style={[styles.auraOrb, { width: size, height: size, left: initialX, top: initialY }, useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }))]}>
      <Svg width={size} height={size}><Defs><RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%"><Stop offset="0%" stopColor={color} stopOpacity="1" /><Stop offset="100%" stopColor={color} stopOpacity="0" /></RadialGradient></Defs><Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradId})`} /></Svg>
    </Animated.View>
  );
});

const AuroraLight = React.memo(({ color }: { color: string }) => {
  const tx = useSharedValue(Math.random() * width); const ty = useSharedValue(Math.random() * height);
  const scale = useSharedValue(1); const opacity = useSharedValue(0.15);
  const gradId = useMemo(() => `aurora-${Math.random()}`, []);
  useEffect(() => {
    tx.value = withRepeat(withTiming(Math.random() * width, { duration: 20000, easing: Easing.inOut(Easing.sin) }), -1, true);
    ty.value = withRepeat(withTiming(Math.random() * height, { duration: 20000, easing: Easing.inOut(Easing.sin) }), -1, true);
    scale.value = withRepeat(withTiming(2, { duration: 15000, easing: Easing.inOut(Easing.sin) }), -1, true);
    opacity.value = withRepeat(withTiming(0.6, { duration: 10000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);
  const size = width * 1.5;
  return (
    <Animated.View style={[styles.auraOrb, { width: size, height: size }, useAnimatedStyle(() => ({ transform: [{ translateX: tx.value - size / 2 }, { translateY: ty.value - size / 2 }, { scale: scale.value }], opacity: opacity.value }))]}>
      <Svg width={size} height={size}><Defs><RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%"><Stop offset="0%" stopColor={color} stopOpacity="1" /><Stop offset="100%" stopColor={color} stopOpacity="0" /></RadialGradient></Defs><Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradId})`} /></Svg>
    </Animated.View>
  );
});

export const AuroraEffect = React.memo(({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  return <View style={StyleSheet.absoluteFill}><AuroraLight color={activeColor} /><AuroraLight color={colors.secondary || activeColor} /></View>;
});
