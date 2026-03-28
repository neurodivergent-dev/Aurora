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
import { NebulaOrbProps } from '../types';
import { useTheme } from '../../ThemeProvider';

const { width, height } = Dimensions.get('window');

const NebulaOrb = React.memo(({ color, duration, delay }: NebulaOrbProps) => {
  const tx = useSharedValue(Math.random() * width); const ty = useSharedValue(Math.random() * height);
  const scale = useSharedValue(1); const opacity = useSharedValue(0.1); const gradId = useMemo(() => `nebula-${Math.random()}`, []);
  useEffect(() => {
    tx.value = withRepeat(withTiming(Math.random() * width, { duration }), -1, true);
    ty.value = withRepeat(withTiming(Math.random() * height, { duration: duration * 1.2 }), -1, true);
    scale.value = withDelay(delay, withRepeat(withTiming(2.5, { duration: duration * 0.8 }), -1, true));
    opacity.value = withDelay(delay, withRepeat(withTiming(0.6, { duration: duration * 0.6 }), -1, true));
  }, []);
  const size = width * 1.8;
  return (
    <Animated.View style={[{ position: 'absolute', width: size, height: size }, useAnimatedStyle(() => ({ transform: [{ translateX: tx.value - width }, { translateY: ty.value - height }, { scale: scale.value }], opacity: opacity.value }))]}>
      <Svg width={size} height={size}><Defs><RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%"><Stop offset="0%" stopColor={color} stopOpacity="1" /><Stop offset="100%" stopColor={color} stopOpacity="0" /></RadialGradient></Defs><Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradId})`} /></Svg>
    </Animated.View>
  );
});

export const NebulaBackground = React.memo(({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  return <View style={StyleSheet.absoluteFill}><NebulaOrb color={activeColor} duration={25000} delay={0} /><NebulaOrb color={colors.secondary || activeColor} duration={30000} delay={2000} /></View>;
});
