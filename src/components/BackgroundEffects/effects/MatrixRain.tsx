import React, { useEffect, useMemo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { LinearGradient, Defs, Stop, Rect } from 'react-native-svg';
import { MatrixColumnProps } from '../types';
import { styles } from '../styles';

const { width, height } = Dimensions.get('window');

const MatrixColumn = React.memo(({ x, delay, color }: MatrixColumnProps) => {
  const ty = useSharedValue(-height * 0.5); const gradId = useMemo(() => `matrix-grad-${Math.random()}`, []);
  useEffect(() => { ty.value = withDelay(delay, withRepeat(withTiming(height * 1.5, { duration: 5000, easing: Easing.linear }), -1, false)); }, [delay]);
  const colHeight = height * 0.4;
  return (
    <Animated.View style={[styles.matrixColumn, { left: x }, useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }], opacity: interpolate(ty.value, [-height * 0.5, height * 0.8, height * 1.5], [0, 1, 0]) }))]}>
      <Svg width={6} height={colHeight}><Defs><LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={color} stopOpacity="0" /><Stop offset="1" stopColor={color} stopOpacity="1" /></LinearGradient></Defs><Rect width={6} height={colHeight} fill={`url(#${gradId})`} rx={3} /></Svg>
    </Animated.View>
  );
});

export const MatrixRain = React.memo(({ activeColor }: { activeColor: string }) => {
  const columns = useMemo(() => [...Array(15)].map((_, i) => ({ id: i, x: (width / 15) * i, delay: Math.random() * 5000 })), []);
  return <View style={StyleSheet.absoluteFill}>{columns.map(col => <MatrixColumn key={col.id} x={col.x} delay={col.delay} color={activeColor} />)}</View>;
});
