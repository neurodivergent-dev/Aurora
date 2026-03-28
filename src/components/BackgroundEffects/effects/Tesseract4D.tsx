import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { rotateX, rotateY, rotateZ, project } from '../helpers';
import { WireframeLineProps, Point3D } from '../types';

const { width, height } = Dimensions.get('window');

const WireframeLine = React.memo(({ idx1, idx2, vertices, angleX, angleY, angleZ, color, size }: WireframeLineProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const v1 = vertices[idx1];
    const v2 = vertices[idx2];
    let r1 = rotateX(v1, angleX.value); r1 = rotateY(r1, angleY.value); r1 = rotateZ(r1, angleZ.value);
    const p1 = project(r1, size);
    let r2 = rotateX(v2, angleX.value); r2 = rotateY(r2, angleY.value); r2 = rotateZ(r2, angleZ.value);
    const p2 = project(r2, size);
    const dx = p2.x - p1.x; const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const avgZ = (p1.z + p2.z) / 2;
    return {
      width: length, height: 2, backgroundColor: color, position: 'absolute',
      left: (p1.x + p2.x) / 2 - length / 2, top: (p1.y + p2.y) / 2 - 1,
      transform: [{ rotate: `${angle}rad` }],
      opacity: interpolate(avgZ, [-1.5, 1.5], [1, 0.4]),
    };
  });
  return <Animated.View style={animatedStyle} />;
});

export const Tesseract4D = React.memo(({ activeColor }: { activeColor: string }) => {
  const angleX = useSharedValue(0); const angleY = useSharedValue(0); const angleZ = useSharedValue(0);
  useEffect(() => {
    angleX.value = withRepeat(withTiming(Math.PI * 2, { duration: 15000, easing: Easing.linear }), -1, false);
    angleY.value = withRepeat(withTiming(Math.PI * 2, { duration: 20000, easing: Easing.linear }), -1, false);
    angleZ.value = withRepeat(withTiming(Math.PI * 2, { duration: 25000, easing: Easing.linear }), -1, false);
  }, []);
  const vertices = useMemo(() => {
    const v: Point3D[] = [];
    for (let i = 0; i < 8; i++) v.push({ x: (i & 1) ? 1 : -1, y: (i & 2) ? 1 : -1, z: (i & 4) ? 1 : -1 });
    for (let i = 0; i < 8; i++) v.push({ x: (i & 1) ? 0.5 : -0.5, y: (i & 2) ? 0.5 : -0.5, z: (i & 4) ? 0.5 : -0.5 });
    return v;
  }, []);
  const edges = useMemo(() => {
    const e = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [3, 7], [2, 6]];
    const res: [number, number][] = [];
    e.forEach(([i1, i2]) => res.push([i1, i2]));
    e.forEach(([i1, i2]) => res.push([i1 + 8, i2 + 8]));
    for (let i = 0; i < 8; i++) res.push([i, i + 8]);
    return res;
  }, []);
  return (
    <View style={StyleSheet.absoluteFill}>
      {edges.map((edge, i) => <WireframeLine key={i} idx1={edge[0]} idx2={edge[1]} vertices={vertices} angleX={angleX} angleY={angleY} angleZ={angleZ} color={activeColor} size={75} />)}
    </View>
  );
});
