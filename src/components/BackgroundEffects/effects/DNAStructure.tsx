import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { PairNodeProps } from '../types';
import { styles } from '../styles';
import { useTheme } from '../../ThemeProvider';

const PairNode = React.memo(({ p, rotation, activeColor, secondaryColor }: PairNodeProps) => {
  const a1Style = useAnimatedStyle(() => {
    const r = 60;
    const x = Math.cos(p.phase + rotation.value) * r;
    const z = Math.sin(p.phase + rotation.value) * r;
    return {
      transform: [{ translateX: x }, { translateY: p.y }, { scale: interpolate(z, [-r, r], [0.6, 1.3]) }],
      opacity: interpolate(z, [-r, r], [0.3, 1]),
      backgroundColor: activeColor,
      width: 6,
      height: 6,
      borderRadius: 3,
      position: 'absolute'
    };
  });
  const a2Style = useAnimatedStyle(() => {
    const r = 60;
    const x = Math.cos(p.phase + rotation.value + Math.PI) * r;
    const z = Math.sin(p.phase + rotation.value + Math.PI) * r;
    return {
      transform: [{ translateX: x }, { translateY: p.y }, { scale: interpolate(z, [-r, r], [0.6, 1.3]) }],
      opacity: interpolate(z, [-r, r], [0.3, 1]),
      backgroundColor: secondaryColor,
      width: 6,
      height: 6,
      borderRadius: 3,
      position: 'absolute'
    };
  });
  return (
    <>
      <Animated.View style={a1Style} />
      <Animated.View style={a2Style} />
    </>
  );
});

export const DNAStructure = React.memo(({ activeColor }: { activeColor: string }) => {
  const rotation = useSharedValue(0);
  const { colors } = useTheme();
  useEffect(() => {
    rotation.value = withRepeat(withTiming(Math.PI * 2, { duration: 8000, easing: Easing.linear }), -1, false);
  }, []);
  const pairs = useMemo(() => [...Array(15)].map((_, i) => ({ id: i, phase: (i / 15) * Math.PI * 2, y: (i / 15) * 500 - 250 })), []);
  const secondaryColor = colors.secondary || activeColor;
  return (
    <View style={styles.vortexContainer}>
      {pairs.map(p => <PairNode key={p.id} p={p} rotation={rotation} activeColor={activeColor} secondaryColor={secondaryColor} />)}
    </View>
  );
});
