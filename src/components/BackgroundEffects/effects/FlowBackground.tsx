import React, { useEffect } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { FlowLineProps } from '../types';
import { useTheme } from '../../ThemeProvider';

const { width, height } = Dimensions.get('window');

const FlowLine = React.memo(({ color, index }: FlowLineProps) => {
  const t = useSharedValue(0); useEffect(() => { t.value = withRepeat(withTiming(Math.PI * 2, { duration: 10000 + index * 2000, easing: Easing.linear }), -1, false); }, []);
  const AnimatedPath = Animated.createAnimatedComponent(Path);
  const animatedProps = useAnimatedProps(() => {
    const points = [];
    for (let i = 0; i <= 8; i++) points.push(`${i === 0 ? 'M' : 'L'} ${(width / 8) * i} ${(height / 2) + Math.sin(t.value + (i * 0.5) + (index * 0.8)) * (80 + index * 20)}`);
    return { d: points.join(' ') };
  });
  return <Svg style={StyleSheet.absoluteFill}><AnimatedPath animatedProps={animatedProps} stroke={color} strokeWidth={3} fill="none" opacity={0.4} /></Svg>;
});

export const FlowBackground = React.memo(({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  return <View style={StyleSheet.absoluteFill}>{[...Array(4)].map((_, i) => <FlowLine key={i} index={i} color={i % 2 === 0 ? activeColor : colors.secondary || activeColor} />)}</View>;
});
