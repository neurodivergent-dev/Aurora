import React, { useEffect, useMemo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { RadialGradient, Defs, Stop, Circle } from 'react-native-svg';
import { BokehOrbProps } from '../types';
import { useTheme } from '../../ThemeProvider';

const { width, height } = Dimensions.get('window');

const BokehOrb = React.memo(({ color, size, delay }: BokehOrbProps) => {
  const tx = useSharedValue(Math.random() * width); const ty = useSharedValue(Math.random() * height);
  const scale = useSharedValue(1); const opacity = useSharedValue(0.2);
  const gradId = useMemo(() => `bokeh-grad-${Math.random()}`, []);
  useEffect(() => {
    tx.value = withRepeat(withTiming(Math.random() * width, { duration: 15000 + Math.random() * 5000, easing: Easing.inOut(Easing.sin) }), -1, true);
    ty.value = withRepeat(withTiming(Math.random() * height, { duration: 15000 + Math.random() * 5000, easing: Easing.inOut(Easing.sin) }), -1, true);
    scale.value = withDelay(delay, withRepeat(withTiming(1.6, { duration: 10000, easing: Easing.inOut(Easing.sin) }), -1, true));
    opacity.value = withDelay(delay, withRepeat(withTiming(0.4, { duration: 8000, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [delay]);
  return (
    <Animated.View style={[{ position: 'absolute', width: size, height: size }, useAnimatedStyle(() => ({ transform: [{ translateX: tx.value - size / 2 }, { translateY: ty.value - size / 2 }, { scale: scale.value }], opacity: opacity.value }))]}>
      <Svg width={size} height={size}><Defs><RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%"><Stop offset="0%" stopColor={color} stopOpacity="1" /><Stop offset="100%" stopColor={color} stopOpacity="0" /></RadialGradient></Defs><Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradId})`} /></Svg>
    </Animated.View>
  );
});

export const DreamscapeBokehSystem = React.memo(({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  return (
    <View style={StyleSheet.absoluteFill}>
      <BokehOrb color={activeColor} size={width * 1.5} delay={0} />
      <BokehOrb color={colors.secondary || activeColor} size={width * 1.2} delay={2000} />
      <BokehOrb color={activeColor} size={width * 1.3} delay={4000} />
    </View>
  );
});
