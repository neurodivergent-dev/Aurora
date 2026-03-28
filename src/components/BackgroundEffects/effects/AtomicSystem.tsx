import React, { useEffect, useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { RadialGradient, Defs, Stop, Circle } from 'react-native-svg';
import { styles } from '../styles';
import { AtomicOrbitProps } from '../types';
import { useTheme } from '../../ThemeProvider';

const { width, height } = Dimensions.get('window');

const AtomicOrbit = React.memo(({ size, color, opacity, rx, ry, rotation, pulse, speedFactor = 1 }: AtomicOrbitProps) => {
  const r = size / 2; const circ = 2 * Math.PI * r;
  const dashOffset = useSharedValue(0);
  useEffect(() => { dashOffset.value = withRepeat(withTiming(circ, { duration: 3000 / Math.abs(speedFactor), easing: Easing.linear }), -1, false); }, [circ, speedFactor]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateX: rx },
      { rotateY: ry },
      { rotateZ: `${rotation.value * speedFactor}deg` }
    ],
    opacity: (0.2 + (pulse.value * 0.3)) * opacity
  }));

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const animatedPathProps = useAnimatedProps(() => ({ strokeDashoffset: dashOffset.value }));

  return (
    <Animated.View style={[styles.ringsOverlay, animatedStyle]}>
      <Svg width={size + 40} height={size + 40} viewBox={`0 0 ${size + 40} ${size + 40}`}>
        <Defs>
          <RadialGradient id={`glow-${rx}-${ry}`} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={(size + 40) / 2} cy={(size + 40) / 2} r={r} stroke={color} strokeWidth={4} fill="none" opacity={0.1} />
        <Circle cx={(size + 40) / 2} cy={(size + 40) / 2} r={r} stroke={color} strokeWidth={1} fill="none" opacity={0.4} />
        <AnimatedCircle
          cx={(size + 40) / 2}
          cy={(size + 40) / 2}
          r={r}
          stroke={color}
          strokeWidth={3}
          fill="none"
          strokeDasharray={`${circ * 0.15} ${circ * 0.85}`}
          animatedProps={animatedPathProps}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
});

export const AtomicSystem = React.memo(({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  const nucleusGradId = useMemo(() => `nuc-${Math.random()}`, []);
  const rotation = useSharedValue(0); const pulse = useSharedValue(0.4);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 12000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const coreGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.8 + pulse.value * 0.4 }],
    opacity: 0.4 + pulse.value * 0.6,
  }));

  return (
    <View style={styles.saturnContainer}>
      <View style={[styles.saturnGroup, { top: height / 2 - 80 }]}>
        <AtomicOrbit size={width * 0.9} color={activeColor} opacity={1} rx="75deg" ry="10deg" rotation={rotation} pulse={pulse} speedFactor={1.4} />
        <AtomicOrbit size={width * 0.9} color={colors.secondary || '#FFF'} opacity={0.8} rx="75deg" ry="65deg" rotation={rotation} pulse={pulse} speedFactor={-1.1} />
        <AtomicOrbit size={width * 0.9} color={activeColor} opacity={0.9} rx="75deg" ry="125deg" rotation={rotation} pulse={pulse} speedFactor={1.9} />

        <Animated.View style={[styles.planetCore, coreGlowStyle]}>
          <Svg width={160} height={160} viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id={nucleusGradId} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={activeColor} stopOpacity="0.8" />
                <Stop offset="60%" stopColor={activeColor} stopOpacity="0.2" />
                <Stop offset="100%" stopColor={activeColor} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="50" cy="50" r="48" fill={`url(#${nucleusGradId})`} />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
});
