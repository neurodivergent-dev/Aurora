import React, { useEffect } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { SilkPathProps } from '../types';
import { useTheme } from '../../ThemeProvider';

const { width, height } = Dimensions.get('window');

const SilkPath = React.memo(({ color, delay, duration }: SilkPathProps) => {
  const t = useSharedValue(0); useEffect(() => { t.value = withDelay(delay, withRepeat(withTiming(Math.PI * 2, { duration, easing: Easing.linear }), -1, false)); }, [delay, duration]);
  const AnimatedPath = Animated.createAnimatedComponent(Path);
  const animatedProps = useAnimatedProps(() => {
    const cp1x = width * 0.2 + Math.sin(t.value) * 100; const cp1y = height * 0.3 + Math.cos(t.value) * 150;
    const cp2x = width * 0.8 + Math.cos(t.value * 0.8) * 120; const cp2y = height * 0.7 + Math.sin(t.value * 0.8) * 150;
    return { d: `M -50 ${height * 0.2} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${width + 50} ${height * 0.8}` };
  });
  return <Svg style={StyleSheet.absoluteFill} pointerEvents="none"><AnimatedPath animatedProps={animatedProps} stroke={color} strokeWidth={50} strokeLinecap="round" fill="none" opacity={0.1} /></Svg>;
});

export const SilkBackground = React.memo(({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  return <View style={StyleSheet.absoluteFill}><SilkPath color={activeColor} delay={0} duration={15000} /><SilkPath color={colors.secondary || activeColor} delay={2000} duration={18000} /></View>;
});
