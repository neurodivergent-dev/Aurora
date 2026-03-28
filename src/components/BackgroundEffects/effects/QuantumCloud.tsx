import React, { useEffect, useMemo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { QuantumParticleProps } from '../types';
import { styles } from '../styles';
import { useTheme } from '../../ThemeProvider';

const { width, height } = Dimensions.get('window');

const QuantumParticle = React.memo(({ cloudX, cloudY, index, color }: QuantumParticleProps) => {
  const angle = useMemo(() => Math.random() * Math.PI * 2, []); const dist = useMemo(() => 50 + Math.random() * 80, []);
  const size = useMemo(() => 2 + Math.random() * 1.5, []); const pulse = useSharedValue(0.2 + Math.random() * 0.4);
  useEffect(() => { pulse.value = withRepeat(withTiming(1, { duration: 1500 + Math.random() * 2500, easing: Easing.inOut(Easing.sin) }), -1, true); }, []);
  const animatedStyle = useAnimatedStyle(() => {
    const orbitSpeed = (Date.now() / 4000) + (index * 0.15);
    return { transform: [{ translateX: cloudX.value + Math.cos(angle + orbitSpeed) * dist }, { translateY: cloudY.value + Math.sin(angle + orbitSpeed) * dist }, { scale: pulse.value }], opacity: pulse.value * 0.8, backgroundColor: color };
  });
  return <Animated.View style={[styles.particle, { width: size, height: size, borderRadius: size / 2 }, animatedStyle]} />;
});

const QuantumCloud = React.memo(({ color }: { color: string }) => {
  const cloudX = useSharedValue(Math.random() * width); const cloudY = useSharedValue(Math.random() * height);
  useEffect(() => {
    cloudX.value = withRepeat(withTiming(Math.random() * width, { duration: 20000 + Math.random() * 10000, easing: Easing.inOut(Easing.sin) }), -1, true);
    cloudY.value = withRepeat(withTiming(Math.random() * height, { duration: 20000 + Math.random() * 10000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);
  return <>{[...Array(15)].map((_, i) => <QuantumParticle key={i} index={i} cloudX={cloudX} cloudY={cloudY} color={color} />)}</>;
});

export const QuantumDustSystem = React.memo(({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  return (
    <View style={StyleSheet.absoluteFill}>
      <QuantumCloud color={activeColor} />
      <QuantumCloud color={colors.secondary || activeColor} />
    </View>
  );
});
