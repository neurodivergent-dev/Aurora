import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { RadialGradient, Circle, Stop } from 'react-native-svg';
import { PNodeProps } from '../types';
import { styles } from '../styles';

const PNode = React.memo(({ p, rotation, activeColor }: PNodeProps) => {
  const pStyle = useAnimatedStyle(() => {
    const t = Date.now() / 2000;
    const d = p.dist * (1 - ((t + p.id) % 1));
    return {
      transform: [
        { translateX: Math.cos(p.angle + rotation.value / 50) * d },
        { translateY: Math.sin(p.angle + rotation.value / 50) * d },
        { scale: d / 100 }
      ],
      opacity: 1 - (d / 100),
      backgroundColor: activeColor,
      width: 4,
      height: 4,
      borderRadius: 2,
      position: 'absolute'
    };
  });
  return <Animated.View style={pStyle} />;
});

export const BlackHole = React.memo(({ activeColor }: { activeColor: string }) => {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);
  const particles = useMemo(() => [...Array(20)].map((_, i) => ({ id: i, angle: (i / 20) * Math.PI * 2, dist: 60 + Math.random() * 40 })), []);
  return (
    <View style={styles.vortexContainer}>
      <Animated.View style={[{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#000', shadowColor: activeColor, shadowOpacity: 1, shadowRadius: 30, elevation: 20 }, useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }))]}>
        <Svg width={100} height={100}><RadialGradient id="bh-grad" cx="50%" cy="50%" rx="50%" ry="50%"><Stop offset="0%" stopColor="#000" /><Stop offset="80%" stopColor="#000" /><Stop offset="100%" stopColor={activeColor} stopOpacity="0.5" /></RadialGradient><Circle cx="50" cy="50" r="50" fill="url(#bh-grad)" /></Svg>
      </Animated.View>
      {particles.map(p => <PNode key={p.id} p={p} rotation={rotation} activeColor={activeColor} />)}
    </View>
  );
});
