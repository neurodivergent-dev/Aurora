import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { VortexRingProps } from '../types';
import { styles } from '../styles';
import { useTheme } from '../../ThemeProvider';

const VortexRing = React.memo(({ radius, color, speed, index }: VortexRingProps) => {
  const rotation = useSharedValue(0);
  useEffect(() => { rotation.value = withRepeat(withTiming(360, { duration: speed, easing: Easing.linear }), -1, false); }, [speed]);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }, useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }], opacity: 0.45 }))]}>
      <Svg width={radius * 2.2} height={radius * 2.2} viewBox={`0 0 ${radius * 2.2} ${radius * 2.2}`}><Circle cx={radius * 1.1} cy={radius * 1.1} r={radius} stroke={color} strokeWidth={4 + index * 1.5} fill="none" strokeDasharray={`${radius * 0.4} ${radius}`} /></Svg>
    </Animated.View>
  );
});

export const VortexSystem = React.memo(({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  return <View style={styles.vortexContainer}>{[...Array(6)].map((_, i) => <VortexRing key={i} index={i} radius={50 + (i * 40)} color={i % 2 === 0 ? activeColor : colors.secondary || activeColor} speed={10000 + (i * 2000)} />)}</View>;
});
