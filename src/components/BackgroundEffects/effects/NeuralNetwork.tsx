import React, { useEffect, useMemo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { LineNodeProps, PointNodeProps } from '../types';

const { width, height } = Dimensions.get('window');

const LineNode = React.memo(({ p, p2, activeColor, AnimatedPath }: LineNodeProps) => {
  const lineProps = useAnimatedProps(() => {
    const d = Math.sqrt(Math.pow(p.x.value - p2.x.value, 2) + Math.pow(p.y.value - p2.y.value, 2));
    let opacity = 0;
    if (d < 150) opacity = interpolate(d, [0, 150], [0.4, 0]);
    return { d: `M ${p.x.value} ${p.y.value} L ${p2.x.value} ${p2.y.value}`, strokeOpacity: opacity };
  });
  return <AnimatedPath animatedProps={lineProps} stroke={activeColor} strokeWidth={1} />;
});

const PointNode = React.memo(({ p, points, activeColor, AnimatedPath }: PointNodeProps) => {
  const pointStyle = useAnimatedStyle(() => ({
    left: p.x.value,
    top: p.y.value,
    opacity: 0.6
  }));

  const svgStyle = useAnimatedStyle(() => ({
    left: -p.x.value,
    top: -p.y.value,
  }));

  return (
    <Animated.View style={[{ width: 4, height: 4, borderRadius: 2, backgroundColor: activeColor, position: 'absolute' }, pointStyle]}>
      <Animated.View style={[{ position: 'absolute', width: width, height: height }, svgStyle]}>
        <Svg width={width} height={height}>
          {points.filter((p2) => p2.id > p.id).map((p2) => (
            <LineNode key={p2.id} p={p} p2={p2} activeColor={activeColor} AnimatedPath={AnimatedPath} />
          ))}
        </Svg>
      </Animated.View>
    </Animated.View>
  );
});

export const NeuralNetwork = React.memo(({ activeColor }: { activeColor: string }) => {
  const AnimatedPath = useMemo(() => Animated.createAnimatedComponent(Path), []);

  const s0x = useSharedValue(Math.random() * width); const s0y = useSharedValue(Math.random() * height);
  const s1x = useSharedValue(Math.random() * width); const s1y = useSharedValue(Math.random() * height);
  const s2x = useSharedValue(Math.random() * width); const s2y = useSharedValue(Math.random() * height);
  const s3x = useSharedValue(Math.random() * width); const s3y = useSharedValue(Math.random() * height);
  const s4x = useSharedValue(Math.random() * width); const s4y = useSharedValue(Math.random() * height);
  const s5x = useSharedValue(Math.random() * width); const s5y = useSharedValue(Math.random() * height);
  const s6x = useSharedValue(Math.random() * width); const s6y = useSharedValue(Math.random() * height);
  const s7x = useSharedValue(Math.random() * width); const s7y = useSharedValue(Math.random() * height);
  const s8x = useSharedValue(Math.random() * width); const s8y = useSharedValue(Math.random() * height);
  const s9x = useSharedValue(Math.random() * width); const s9y = useSharedValue(Math.random() * height);

  const v0x = useSharedValue(Math.random() * 2 - 1); const v0y = useSharedValue(Math.random() * 2 - 1);
  const v1x = useSharedValue(Math.random() * 2 - 1); const v1y = useSharedValue(Math.random() * 2 - 1);
  const v2x = useSharedValue(Math.random() * 2 - 1); const v2y = useSharedValue(Math.random() * 2 - 1);
  const v3x = useSharedValue(Math.random() * 2 - 1); const v3y = useSharedValue(Math.random() * 2 - 1);
  const v4x = useSharedValue(Math.random() * 2 - 1); const v4y = useSharedValue(Math.random() * 2 - 1);
  const v5x = useSharedValue(Math.random() * 2 - 1); const v5y = useSharedValue(Math.random() * 2 - 1);
  const v6x = useSharedValue(Math.random() * 2 - 1); const v6y = useSharedValue(Math.random() * 2 - 1);
  const v7x = useSharedValue(Math.random() * 2 - 1); const v7y = useSharedValue(Math.random() * 2 - 1);
  const v8x = useSharedValue(Math.random() * 2 - 1); const v8y = useSharedValue(Math.random() * 2 - 1);
  const v9x = useSharedValue(Math.random() * 2 - 1); const v9y = useSharedValue(Math.random() * 2 - 1);

  const points = useMemo(() => [
    { id: 0, x: s0x, y: s0y, vx: v0x, vy: v0y },
    { id: 1, x: s1x, y: s1y, vx: v1x, vy: v1y },
    { id: 2, x: s2x, y: s2y, vx: v2x, vy: v2y },
    { id: 3, x: s3x, y: s3y, vx: v3x, vy: v3y },
    { id: 4, x: s4x, y: s4y, vx: v4x, vy: v4y },
    { id: 5, x: s5x, y: s5y, vx: v5x, vy: v5y },
    { id: 6, x: s6x, y: s6y, vx: v6x, vy: v6y },
    { id: 7, x: s7x, y: s7y, vx: v7x, vy: v7y },
    { id: 8, x: s8x, y: s8y, vx: v8x, vy: v8y },
    { id: 9, x: s9x, y: s9y, vx: v9x, vy: v9y },
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      points.forEach(p => {
        let nx = p.x.value + p.vx.value; let ny = p.y.value + p.vy.value;
        if (nx < 0 || nx > width) p.vx.value *= -1; if (ny < 0 || ny > height) p.vy.value *= -1;
        p.x.value = nx; p.y.value = ny;
      });
    }, 32);
    return () => clearInterval(interval);
  }, [points]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {points.map(p => <PointNode key={p.id} p={p} points={points} activeColor={activeColor} AnimatedPath={AnimatedPath} />)}
    </View>
  );
});
