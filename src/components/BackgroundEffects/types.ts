import { ReactNode, ComponentType } from 'react';
import { SharedValue } from 'react-native-reanimated';
import { BackgroundEffectType } from '../../store/themeStore';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface WireframeLineProps {
  idx1: number;
  idx2: number;
  vertices: Point3D[];
  angleX: SharedValue<number>;
  angleY: SharedValue<number>;
  angleZ: SharedValue<number>;
  color: string;
  size: number;
}

export interface AtomicOrbitProps {
  size: number;
  color: string;
  opacity: number;
  rx: string;
  ry: string;
  rotation: SharedValue<number>;
  pulse: SharedValue<number>;
  speedFactor?: number;
}

export interface BokehOrbProps {
  color: string;
  size: number;
  delay: number;
}

export interface QuantumParticleProps {
  cloudX: SharedValue<number>;
  cloudY: SharedValue<number>;
  index: number;
  color: string;
}

export interface MatrixColumnProps {
  x: number;
  delay: number;
  color: string;
}

export interface VortexRingProps {
  radius: number;
  color: string;
  speed: number;
  index: number;
}

export interface AuraOrbProps {
  delay?: number;
  initialX?: number;
  initialY?: number;
  size?: number;
  color?: string;
}

export interface SilkPathProps {
  color: string;
  delay: number;
  duration: number;
}

export interface NebulaOrbProps {
  color: string;
  duration: number;
  delay: number;
}

export interface FlowLineProps {
  color: string;
  index: number;
}

export interface PNodeData {
  id: number;
  angle: number;
  dist: number;
}

export interface PNodeProps {
  p: PNodeData;
  rotation: SharedValue<number>;
  activeColor: string;
}

export interface SNodeData {
  id: number;
  x: number;
  y: number;
  z: number;
}

export interface SNodeProps {
  s: SNodeData;
  activeColor: string;
}

export interface PairData {
  id: number;
  phase: number;
  y: number;
}

export interface PairNodeProps {
  p: PairData;
  rotation: SharedValue<number>;
  activeColor: string;
  secondaryColor: string;
}

export interface NeuralPointData {
  id: number;
  x: SharedValue<number>;
  y: SharedValue<number>;
  vx: SharedValue<number>;
  vy: SharedValue<number>;
}

export interface LineNodeProps {
  p: NeuralPointData;
  p2: NeuralPointData;
  activeColor: string;
  AnimatedPath: ComponentType<any>;
}

export interface PointNodeProps {
  p: NeuralPointData;
  points: NeuralPointData[];
  activeColor: string;
  AnimatedPath: ComponentType<any>;
}

export interface BackgroundEffectsProps {
  customColor?: string | null;
  isLightMode?: boolean;
}
