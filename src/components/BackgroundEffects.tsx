import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  SharedValue
} from 'react-native-reanimated';
import { useTheme } from './ThemeProvider';
import { useThemeStore, BackgroundEffectType } from '../store/themeStore';
import Svg, { Path, RadialGradient, Defs, Stop, Circle, Rect, LinearGradient } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  particle: { position: 'absolute', width: 4, height: 4, borderRadius: 2 },
  auraOrb: { position: 'absolute' },
  saturnContainer: { ...StyleSheet.absoluteFillObject },
  saturnGroup: { width: width, alignItems: 'center', justifyContent: 'center', position: 'absolute' },
  ringsOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  planetCore: { zIndex: 10 },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  matrixColumn: { position: 'absolute', width: 6, alignItems: 'center' },
  vortexContainer: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  gridContainer: { position: 'absolute', left: -width * 0.5, right: -width * 0.5, bottom: 0, height: height * 0.5, overflow: 'hidden', alignItems: 'center' },
  gridInner: { width: width * 2, height: height * 1.5 },
  cubeWrapper: { position: 'absolute' },
  winampContainer: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  winampViz: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 2 },
  winampBar: { width: 4, backgroundColor: '#00FF00', shadowColor: '#00FF00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 },
  winampScopeContainer: { position: 'absolute', width: width, height: 100, bottom: height * 0.25 },
});

interface Point3D {
  x: number;
  y: number;
  z: number;
}

// --- 3D MATH HELPERS ---
const rotateX = (p: Point3D, theta: number) => {
  'worklet';
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
};

const rotateY = (p: Point3D, theta: number) => {
  'worklet';
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return { x: p.x * cos + p.z * sin, y: p.y, z: -p.x * sin + p.z * cos };
};

const rotateZ = (p: Point3D, theta: number) => {
  'worklet';
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z };
};

const project = (p: Point3D, size: number) => {
  'worklet';
  const fov = 300;
  const distance = 2.5;
  const scale = fov / (fov + p.z + distance);
  return { x: p.x * scale * size + width / 2, y: p.y * scale * size + height / 2, z: p.z };
};

// --- SUB-COMPONENTS ---

interface WireframeLineProps {
  idx1: number;
  idx2: number;
  vertices: Point3D[];
  angleX: SharedValue<number>;
  angleY: SharedValue<number>;
  angleZ: SharedValue<number>;
  color: string;
  size: number;
}

const WireframeLine = ({ idx1, idx2, vertices, angleX, angleY, angleZ, color, size }: WireframeLineProps) => {
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
};

const Tesseract4D = ({ activeColor }: { activeColor: string }) => {
  const angleX = useSharedValue(0); const angleY = useSharedValue(0); const angleZ = useSharedValue(0);
  useEffect(() => {
    angleX.value = withRepeat(withTiming(Math.PI * 2, { duration: 15000, easing: Easing.linear }), -1, false);
    angleY.value = withRepeat(withTiming(Math.PI * 2, { duration: 20000, easing: Easing.linear }), -1, false);
    angleZ.value = withRepeat(withTiming(Math.PI * 2, { duration: 25000, easing: Easing.linear }), -1, false);
  }, []);
  const vertices = useMemo(() => {
    const v = [];
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
};

interface AtomicOrbitProps {
  size: number;
  color: string;
  opacity: number;
  rx: string;
  ry: string;
  rotation: SharedValue<number>;
  pulse: SharedValue<number>;
  speedFactor?: number;
}

const AtomicOrbit = ({ size, color, opacity, rx, ry, rotation, pulse, speedFactor = 1 }: AtomicOrbitProps) => {
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
        {/* Orbit Path Glow */}
        <Circle cx={(size + 40) / 2} cy={(size + 40) / 2} r={r} stroke={color} strokeWidth={4} fill="none" opacity={0.1} />
        {/* Main Orbit Line */}
        <Circle cx={(size + 40) / 2} cy={(size + 40) / 2} r={r} stroke={color} strokeWidth={1} fill="none" opacity={0.4} />
        {/* Animated Electron Trail */}
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
};

const AtomicSystem = ({ activeColor }: { activeColor: string }) => {
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
};

interface BokehOrbProps {
  color: string;
  size: number;
  delay: number;
}

const BokehOrb = ({ color, size, delay }: BokehOrbProps) => {
  const tx = useSharedValue(Math.random() * width); const ty = useSharedValue(Math.random() * height);
  const scale = useSharedValue(1); const opacity = useSharedValue(0.2);
  const gradId = useMemo(() => `bokeh-grad-${Math.random()}`, []);
  useEffect(() => {
    tx.value = withRepeat(withTiming(Math.random() * width, { duration: 15000 + Math.random() * 5000, easing: Easing.inOut(Easing.sin) }), -1, true);
    ty.value = withRepeat(withTiming(Math.random() * height, { duration: 15000 + Math.random() * 5000, easing: Easing.inOut(Easing.sin) }), -1, true);
    scale.value = withDelay(delay, withRepeat(withTiming(1.6, { duration: 10000, easing: Easing.inOut(Easing.sin) }), -1, true));
    opacity.value = withDelay(delay, withRepeat(withTiming(0.4, { duration: 8000, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [delay]);
  return (
    <Animated.View style={[{ position: 'absolute', width: size, height: size }, useAnimatedStyle(() => ({ transform: [{ translateX: tx.value - size / 2 }, { translateY: ty.value - size / 2 }, { scale: scale.value }], opacity: opacity.value }))]}>
      <Svg width={size} height={size}><Defs><RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%"><Stop offset="0%" stopColor={color} stopOpacity="1" /><Stop offset="100%" stopColor={color} stopOpacity="0" /></RadialGradient></Defs><Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradId})`} /></Svg>
    </Animated.View>
  );
};

const DreamscapeBokehSystem = ({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  return (
    <View style={StyleSheet.absoluteFill}>
      <BokehOrb color={activeColor} size={width * 1.5} delay={0} />
      <BokehOrb color={colors.secondary || activeColor} size={width * 1.2} delay={2000} />
      <BokehOrb color={activeColor} size={width * 1.3} delay={4000} />
    </View>
  );
};

interface QuantumParticleProps {
  cloudX: SharedValue<number>;
  cloudY: SharedValue<number>;
  index: number;
  color: string;
}

const QuantumParticle = ({ cloudX, cloudY, index, color }: QuantumParticleProps) => {
  const angle = useMemo(() => Math.random() * Math.PI * 2, []); const dist = useMemo(() => 50 + Math.random() * 80, []);
  const size = useMemo(() => 2 + Math.random() * 1.5, []); const pulse = useSharedValue(0.2 + Math.random() * 0.4);
  useEffect(() => { pulse.value = withRepeat(withTiming(1, { duration: 1500 + Math.random() * 2500, easing: Easing.inOut(Easing.sin) }), -1, true); }, []);
  const animatedStyle = useAnimatedStyle(() => {
    const orbitSpeed = (Date.now() / 4000) + (index * 0.15);
    return { transform: [{ translateX: cloudX.value + Math.cos(angle + orbitSpeed) * dist }, { translateY: cloudY.value + Math.sin(angle + orbitSpeed) * dist }, { scale: pulse.value }], opacity: pulse.value * 0.8, backgroundColor: color };
  });
  return <Animated.View style={[styles.particle, { width: size, height: size, borderRadius: size / 2 }, animatedStyle]} />;
};

const QuantumCloud = ({ color }: { color: string }) => {
  const cloudX = useSharedValue(Math.random() * width); const cloudY = useSharedValue(Math.random() * height);
  useEffect(() => {
    cloudX.value = withRepeat(withTiming(Math.random() * width, { duration: 20000 + Math.random() * 10000, easing: Easing.inOut(Easing.sin) }), -1, true);
    cloudY.value = withRepeat(withTiming(Math.random() * height, { duration: 20000 + Math.random() * 10000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);
  return <>{[...Array(15)].map((_, i) => <QuantumParticle key={i} index={i} cloudX={cloudX} cloudY={cloudY} color={color} />)}</>;
};

const QuantumDustSystem = ({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  return (
    <View style={StyleSheet.absoluteFill}>
      <QuantumCloud color={activeColor} />
      <QuantumCloud color={colors.secondary || activeColor} />
    </View>
  );
};

const AuroraLight = ({ color }: { color: string }) => {
  const tx = useSharedValue(Math.random() * width); const ty = useSharedValue(Math.random() * height);
  const scale = useSharedValue(1); const opacity = useSharedValue(0.15);
  const gradId = useMemo(() => `aurora-${Math.random()}`, []);
  useEffect(() => {
    tx.value = withRepeat(withTiming(Math.random() * width, { duration: 20000, easing: Easing.inOut(Easing.sin) }), -1, true);
    ty.value = withRepeat(withTiming(Math.random() * height, { duration: 20000, easing: Easing.inOut(Easing.sin) }), -1, true);
    scale.value = withRepeat(withTiming(2, { duration: 15000, easing: Easing.inOut(Easing.sin) }), -1, true);
    opacity.value = withRepeat(withTiming(0.6, { duration: 10000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);
  const size = width * 1.5;
  return (
    <Animated.View style={[styles.auraOrb, { width: size, height: size }, useAnimatedStyle(() => ({ transform: [{ translateX: tx.value - size / 2 }, { translateY: ty.value - size / 2 }, { scale: scale.value }], opacity: opacity.value }))]}>
      <Svg width={size} height={size}><Defs><RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%"><Stop offset="0%" stopColor={color} stopOpacity="1" /><Stop offset="100%" stopColor={color} stopOpacity="0" /></RadialGradient></Defs><Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradId})`} /></Svg>
    </Animated.View>
  );
};

const AuroraEffect = ({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  return <View style={StyleSheet.absoluteFill}><AuroraLight color={activeColor} /><AuroraLight color={colors.secondary || activeColor} /></View>;
};

interface MatrixColumnProps {
  x: number;
  delay: number;
  color: string;
}

const MatrixColumn = ({ x, delay, color }: MatrixColumnProps) => {
  const ty = useSharedValue(-height * 0.5); const gradId = useMemo(() => `matrix-grad-${Math.random()}`, []);
  useEffect(() => { ty.value = withDelay(delay, withRepeat(withTiming(height * 1.5, { duration: 5000, easing: Easing.linear }), -1, false)); }, [delay]);
  const colHeight = height * 0.4;
  return (
    <Animated.View style={[styles.matrixColumn, { left: x }, useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }], opacity: interpolate(ty.value, [-height * 0.5, height * 0.8, height * 1.5], [0, 1, 0]) }))]}>
      <Svg width={6} height={colHeight}><Defs><LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={color} stopOpacity="0" /><Stop offset="1" stopColor={color} stopOpacity="1" /></LinearGradient></Defs><Rect width={6} height={colHeight} fill={`url(#${gradId})`} rx={3} /></Svg>
    </Animated.View>
  );
};

const MatrixRain = ({ activeColor }: { activeColor: string }) => {
  const columns = useMemo(() => [...Array(15)].map((_, i) => ({ id: i, x: (width / 15) * i, delay: Math.random() * 5000 })), []);
  return <View style={StyleSheet.absoluteFill}>{columns.map(col => <MatrixColumn key={col.id} x={col.x} delay={col.delay} color={activeColor} />)}</View>;
};

interface VortexRingProps {
  radius: number;
  color: string;
  speed: number;
  index: number;
}

const VortexRing = ({ radius, color, speed, index }: VortexRingProps) => {
  const rotation = useSharedValue(0);
  useEffect(() => { rotation.value = withRepeat(withTiming(360, { duration: speed, easing: Easing.linear }), -1, false); }, [speed]);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }, useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }], opacity: 0.45 }))]}>
      <Svg width={radius * 2.2} height={radius * 2.2} viewBox={`0 0 ${radius * 2.2} ${radius * 2.2}`}><Circle cx={radius * 1.1} cy={radius * 1.1} r={radius} stroke={color} strokeWidth={4 + index * 1.5} fill="none" strokeDasharray={`${radius * 0.4} ${radius}`} /></Svg>
    </Animated.View>
  );
};

const VortexSystem = ({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  return <View style={styles.vortexContainer}>{[...Array(6)].map((_, i) => <VortexRing key={i} index={i} radius={50 + (i * 40)} color={i % 2 === 0 ? activeColor : colors.secondary || activeColor} speed={10000 + (i * 2000)} />)}</View>;
};

const CyberGrid = ({ activeColor }: { activeColor: string }) => {
  const move = useSharedValue(0);
  useEffect(() => {
    move.value = withRepeat(
      withTiming(60, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const gridPath = useMemo(() => {
    let p = "";
    const gridWidth = width * 4;
    const gridHeight = height * 2;
    // Vertical lines (depth) - expanded density
    for (let i = 0; i <= 30; i++) {
      const x = (gridWidth / 30) * i;
      p += `M${x} 0 L${x} ${gridHeight} `;
    }
    // Horizontal lines (moving towards viewer) - expanded count
    for (let i = 0; i <= 40; i++) {
      const y = i * 60;
      p += `M0 ${y} L${gridWidth} ${y} `;
    }
    return p;
  }, []);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Floor Grid */}
      <Animated.View
        style={[
          {
            width: width * 4,
            height: height,
            position: 'absolute',
            bottom: -height * 0.2, // Move further down to show more perspective
            left: -width * 1.5,
          },
          useAnimatedStyle(() => ({
            transform: [
              { perspective: 800 },
              { rotateX: '65deg' },
              { translateY: move.value },
            ],
            opacity: 0.8
          }))
        ]}
      >
        <Svg width={width * 4} height={height * 2}>
          <Path d={gridPath} stroke={activeColor} strokeWidth={3} />
        </Svg>
      </Animated.View>

      {/* Ceiling Grid (Vertical Top) */}
      <Animated.View
        style={[
          {
            width: width * 4,
            height: height,
            position: 'absolute',
            top: -height * 0.2,
            left: -width * 1.5,
          },
          useAnimatedStyle(() => ({
            transform: [
              { perspective: 800 },
              { rotateX: '-65deg' }, // Inverted for ceiling effect
              { translateY: -move.value }, // Inverted for matching movement
            ],
            opacity: 0.4 // Subtler for the top
          }))
        ]}
      >
        <Svg width={width * 4} height={height * 2}>
          <Path d={gridPath} stroke={activeColor} strokeWidth={3} />
        </Svg>
      </Animated.View>
    </View>
  );
};

interface AuraOrbProps {
  delay?: number;
  initialX?: number;
  initialY?: number;
  size?: number;
  color?: string;
}

const AuraOrb = ({ delay = 0, initialX = 0, initialY = 0, size = 400, color = '#fff' }: AuraOrbProps) => {
  const scale = useSharedValue(1); const opacity = useSharedValue(0.15);
  const gradId = useMemo(() => `aura-${Math.random()}`, []);
  useEffect(() => {
    scale.value = withRepeat(withTiming(1.4, { duration: 10000 }), -1, true);
    opacity.value = withRepeat(withTiming(0.3, { duration: 8000 }), -1, true);
  }, []);
  return (
    <Animated.View style={[styles.auraOrb, { width: size, height: size, left: initialX, top: initialY }, useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }))]}>
      <Svg width={size} height={size}><Defs><RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%"><Stop offset="0%" stopColor={color} stopOpacity="1" /><Stop offset="100%" stopColor={color} stopOpacity="0" /></RadialGradient></Defs><Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradId})`} /></Svg>
    </Animated.View>
  );
};

interface SilkPathProps {
  color: string;
  delay: number;
  duration: number;
}

const SilkPath = ({ color, delay, duration }: SilkPathProps) => {
  const t = useSharedValue(0); useEffect(() => { t.value = withDelay(delay, withRepeat(withTiming(Math.PI * 2, { duration, easing: Easing.linear }), -1, false)); }, [delay, duration]);
  const AnimatedPath = Animated.createAnimatedComponent(Path);
  const animatedProps = useAnimatedProps(() => {
    const cp1x = width * 0.2 + Math.sin(t.value) * 100; const cp1y = height * 0.3 + Math.cos(t.value) * 150;
    const cp2x = width * 0.8 + Math.cos(t.value * 0.8) * 120; const cp2y = height * 0.7 + Math.sin(t.value * 0.8) * 150;
    return { d: `M -50 ${height * 0.2} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${width + 50} ${height * 0.8}` };
  });
  return <Svg style={StyleSheet.absoluteFill} pointerEvents="none"><AnimatedPath animatedProps={animatedProps} stroke={color} strokeWidth={50} strokeLinecap="round" fill="none" opacity={0.1} /></Svg>;
};

const SilkBackground = ({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  return <View style={StyleSheet.absoluteFill}><SilkPath color={activeColor} delay={0} duration={15000} /><SilkPath color={colors.secondary || activeColor} delay={2000} duration={18000} /></View>;
};

const PrismBackground = ({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme(); const tx = useSharedValue(-width); const gradId = useMemo(() => `prism-${Math.random()}`, []);
  useEffect(() => { tx.value = withRepeat(withTiming(width * 1.5, { duration: 12000, easing: Easing.inOut(Easing.sin) }), -1, true); }, []);
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[{ position: 'absolute', top: -height * 0.5, height: height * 2, width: width * 0.8 }, useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { rotate: '35deg' }], opacity: 0.2 }))]}>
        <Svg width="100%" height="100%"><Defs><LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor={activeColor} stopOpacity="0" /><Stop offset="0.5" stopColor={activeColor} stopOpacity="0.8" /><Stop offset="1" stopColor={activeColor} stopOpacity="0" /></LinearGradient></Defs><Rect width="100%" height="100%" fill={`url(#${gradId})`} /></Svg>
      </Animated.View>
    </View>
  );
};

interface NebulaOrbProps {
  color: string;
  duration: number;
  delay: number;
}

const NebulaOrb = ({ color, duration, delay }: NebulaOrbProps) => {
  const tx = useSharedValue(Math.random() * width); const ty = useSharedValue(Math.random() * height);
  const scale = useSharedValue(1); const opacity = useSharedValue(0.1); const gradId = useMemo(() => `nebula-${Math.random()}`, []);
  useEffect(() => {
    tx.value = withRepeat(withTiming(Math.random() * width, { duration }), -1, true);
    ty.value = withRepeat(withTiming(Math.random() * height, { duration: duration * 1.2 }), -1, true);
    scale.value = withDelay(delay, withRepeat(withTiming(2.5, { duration: duration * 0.8 }), -1, true));
    opacity.value = withDelay(delay, withRepeat(withTiming(0.6, { duration: duration * 0.6 }), -1, true));
  }, []);
  const size = width * 1.8;
  return (
    <Animated.View style={[{ position: 'absolute', width: size, height: size }, useAnimatedStyle(() => ({ transform: [{ translateX: tx.value - width }, { translateY: ty.value - height }, { scale: scale.value }], opacity: opacity.value }))]}>
      <Svg width={size} height={size}><Defs><RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%"><Stop offset="0%" stopColor={color} stopOpacity="1" /><Stop offset="100%" stopColor={color} stopOpacity="0" /></RadialGradient></Defs><Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradId})`} /></Svg>
    </Animated.View>
  );
};

const NebulaBackground = ({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  return <View style={StyleSheet.absoluteFill}><NebulaOrb color={activeColor} duration={25000} delay={0} /><NebulaOrb color={colors.secondary || activeColor} duration={30000} delay={2000} /></View>;
};

interface FlowLineProps {
  color: string;
  index: number;
}

const FlowLine = ({ color, index }: FlowLineProps) => {
  const t = useSharedValue(0); useEffect(() => { t.value = withRepeat(withTiming(Math.PI * 2, { duration: 10000 + index * 2000, easing: Easing.linear }), -1, false); }, []);
  const AnimatedPath = Animated.createAnimatedComponent(Path);
  const animatedProps = useAnimatedProps(() => {
    const points = [];
    for (let i = 0; i <= 8; i++) points.push(`${i === 0 ? 'M' : 'L'} ${(width / 8) * i} ${(height / 2) + Math.sin(t.value + (i * 0.5) + (index * 0.8)) * (80 + index * 20)}`);
    return { d: points.join(' ') };
  });
  return <Svg style={StyleSheet.absoluteFill}><AnimatedPath animatedProps={animatedProps} stroke={color} strokeWidth={3} fill="none" opacity={0.4} /></Svg>;
};

const FlowBackground = ({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme();
  return <View style={StyleSheet.absoluteFill}>{[...Array(4)].map((_, i) => <FlowLine key={i} index={i} color={i % 2 === 0 ? activeColor : colors.secondary || activeColor} />)}</View>;
};

const SaturnBackground = ({ activeColor }: { activeColor: string }) => {
  return <View style={StyleSheet.absoluteFill}><AtomicSystem activeColor={activeColor} /><Tesseract4D activeColor={activeColor} /></View>;
};


interface PNodeData {
  id: number;
  angle: number;
  dist: number;
}

interface PNodeProps {
  p: PNodeData;
  rotation: SharedValue<number>;
  activeColor: string;
}

const PNode = ({ p, rotation, activeColor }: PNodeProps) => {
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
};

const BlackHole = ({ activeColor }: { activeColor: string }) => {
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
};

interface SNodeData {
  id: number;
  x: number;
  y: number;
  z: number;
}

interface SNodeProps {
  s: SNodeData;
  activeColor: string;
}

const SNode = ({ s, activeColor }: SNodeProps) => {
  const sStyle = useAnimatedStyle(() => {
    const t = (Date.now() / 2000 + s.id) % 1;
    const z = s.z * (1 - t);
    const scale = interpolate(z, [0, 1000], [4, 0.1]);
    const opacity = interpolate(z, [0, 500, 1000], [0, 1, 0.2]);
    return {
      transform: [
        { translateX: s.x * (1000 / z) },
        { translateY: s.y * (1000 / z) },
        { scale }
      ],
      opacity,
      backgroundColor: activeColor,
      width: 2,
      height: 2,
      borderRadius: 1,
      position: 'absolute'
    };
  });
  return <Animated.View style={sStyle} />;
};

const Stardust = ({ activeColor }: { activeColor: string }) => {
  const stars = useMemo(() => [...Array(50)].map((_, i) => ({ id: i, x: Math.random() * width - width / 2, y: Math.random() * height - height / 2, z: Math.random() * 1000 })), []);
  return (
    <View style={styles.vortexContainer}>
      {stars.map(s => <SNode key={s.id} s={s} activeColor={activeColor} />)}
    </View>
  );
};

interface PairData {
  id: number;
  phase: number;
  y: number;
}

interface PairNodeProps {
  p: PairData;
  rotation: SharedValue<number>;
  activeColor: string;
  secondaryColor: string;
}

const PairNode = ({ p, rotation, activeColor, secondaryColor }: PairNodeProps) => {
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
    <React.Fragment>
      <Animated.View style={a1Style} />
      <Animated.View style={a2Style} />
    </React.Fragment>
  );
};

const DNAStructure = ({ activeColor }: { activeColor: string }) => {
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
};

interface NeuralPointData {
  id: number;
  x: SharedValue<number>;
  y: SharedValue<number>;
  vx: SharedValue<number>;
  vy: SharedValue<number>;
}

interface LineNodeProps {
  p: NeuralPointData;
  p2: NeuralPointData;
  activeColor: string;
  AnimatedPath: any; // Result of Animated.createAnimatedComponent(Path)
}

const LineNode = ({ p, p2, activeColor, AnimatedPath }: LineNodeProps) => {
  const lineProps = useAnimatedProps(() => {
    const d = Math.sqrt(Math.pow(p.x.value - p2.x.value, 2) + Math.pow(p.y.value - p2.y.value, 2));
    let opacity = 0;
    if (d < 150) opacity = interpolate(d, [0, 150], [0.4, 0]);
    return { d: `M ${p.x.value} ${p.y.value} L ${p2.x.value} ${p2.y.value}`, strokeOpacity: opacity };
  });
  return <AnimatedPath animatedProps={lineProps} stroke={activeColor} strokeWidth={1} />;
};

interface PointNodeProps {
  p: NeuralPointData;
  points: NeuralPointData[];
  activeColor: string;
  AnimatedPath: any;
}

const PointNode = ({ p, points, activeColor, AnimatedPath }: PointNodeProps) => {
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
          {points.filter((p2: NeuralPointData) => p2.id > p.id).map((p2: NeuralPointData) => (
            <LineNode key={p2.id} p={p} p2={p2} activeColor={activeColor} AnimatedPath={AnimatedPath} />
          ))}
        </Svg>
      </Animated.View>
    </Animated.View>
  );
};

const NeuralNetwork = ({ activeColor }: { activeColor: string }) => {
  const AnimatedPath = useMemo(() => Animated.createAnimatedComponent(Path), []);

  // Statically define shared values to guarantee Hook order
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
};

import { useMusicStore } from '../store/musicStore';

const WinampBar = ({ index, activeColor }: { index: number, activeColor: string }) => {
  const { isPlaying } = useMusicStore();
  const heightVal = useSharedValue(20);

  useEffect(() => {
    if (isPlaying) {
      heightVal.value = withRepeat(
        withTiming(20 + Math.random() * 80, {
          duration: 150 + Math.random() * 200,
          easing: Easing.inOut(Easing.sin)
        }),
        -1,
        true
      );
    } else {
      heightVal.value = withTiming(10, { duration: 1000 });
    }
  }, [isPlaying]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightVal.value,
    backgroundColor: activeColor,
    opacity: interpolate(heightVal.value, [10, 100], [0.2, 1]),
  }));

  return <Animated.View style={[styles.winampBar, animatedStyle]} />;
};

const WinampOscilloscope = ({ activeColor }: { activeColor: string }) => {
  const { isPlaying } = useMusicStore();
  const t = useSharedValue(0);
  const AnimatedPath = useMemo(() => Animated.createAnimatedComponent(Path), []);

  useEffect(() => {
    if (isPlaying) {
      t.value = withRepeat(withTiming(Math.PI * 2, { duration: 2000, easing: Easing.linear }), -1, false);
    } else {
      t.value = withTiming(t.value + 0.1, { duration: 1000 }); // Subtle drift or stop
    }
  }, [isPlaying]);

  const animatedProps = useAnimatedProps(() => {
    const points = [];
    const amplitude = isPlaying ? 30 : 2;
    const frequency = isPlaying ? 2 : 0.5;
    for (let i = 0; i <= 20; i++) {
      const x = (width / 20) * i;
      const y = 50 + Math.sin(t.value + (i * 0.5) * frequency) * amplitude;
      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return { d: points.join(' ') };
  });

  return (
    <View style={styles.winampScopeContainer}>
      <Svg width={width} height={100}>
        <AnimatedPath animatedProps={animatedProps} stroke={activeColor} strokeWidth={2} fill="none" />
      </Svg>
    </View>
  );
};

const WinampVisualizer = ({ activeColor }: { activeColor: string }) => {
  const bars = useMemo(() => Array.from({ length: 32 }, (_, i) => i), []);
  return (
    <View style={styles.winampContainer}>
      <View style={styles.winampViz}>
        {bars.map(i => <WinampBar key={i} index={i} activeColor={activeColor} />)}
      </View>
      <WinampOscilloscope activeColor={activeColor} />
    </View>
  );
};

// --- MAIN WRAPPER ---
interface BackgroundEffectsProps {
  customColor?: string | null;
  isLightMode?: boolean;
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ customColor, isLightMode }) => {
  const { colors } = useTheme();
  const { backgroundEffect } = useThemeStore();
  const activeColor = customColor || colors.primary;

  const [displayEffect, setDisplayEffect] = React.useState(backgroundEffect);

  useEffect(() => {
    if (backgroundEffect !== displayEffect) {
      setDisplayEffect(backgroundEffect);
    }
  }, [backgroundEffect]);

  const getEffectNode = (effect: BackgroundEffectType) => {
    const effects: Record<BackgroundEffectType, React.ReactNode> = {
      bokeh: <DreamscapeBokehSystem activeColor={activeColor} />,
      quantum: <QuantumDustSystem activeColor={activeColor} />,
      aurora: <AuroraEffect activeColor={activeColor} />,
      matrix: <MatrixRain activeColor={activeColor} />,
      vortex: <VortexSystem activeColor={activeColor} />,
      grid: <CyberGrid activeColor={activeColor} />,
      silk: <SilkBackground activeColor={activeColor} />,
      prism: <PrismBackground activeColor={activeColor} />,
      nebula: <NebulaBackground activeColor={activeColor} />,
      flow: <FlowBackground activeColor={activeColor} />,
      crystals: <AtomicSystem activeColor={activeColor} />,
      tesseract: <Tesseract4D activeColor={activeColor} />,
      blackhole: <BlackHole activeColor={activeColor} />,
      stardust: <Stardust activeColor={activeColor} />,
      neural: <NeuralNetwork activeColor={activeColor} />,
      dna: <DNAStructure activeColor={activeColor} />,
      winamp: <WinampVisualizer activeColor={activeColor} />,
      none: null,
    };
    return effects[effect] || <SaturnBackground activeColor={activeColor} />;
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {displayEffect !== 'none' && getEffectNode(displayEffect)}
      </View>

      {/* Dynamic darken overlay for light mode effects visibility */}
      {colors.background === '#F2F2F7' && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0, 0, 0, 0.03)' }
          ]}
          pointerEvents="none"
        />
      )}
    </View>
  );
};
