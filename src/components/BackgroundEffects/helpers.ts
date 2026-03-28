import { Dimensions } from 'react-native';
import { Point3D } from './types';

const { width, height } = Dimensions.get('window');

export const rotateX = (p: Point3D, theta: number) => {
  'worklet';
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
};

export const rotateY = (p: Point3D, theta: number) => {
  'worklet';
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return { x: p.x * cos + p.z * sin, y: p.y, z: -p.x * sin + p.z * cos };
};

export const rotateZ = (p: Point3D, theta: number) => {
  'worklet';
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z };
};

export const project = (p: Point3D, size: number) => {
  'worklet';
  const fov = 300;
  const distance = 2.5;
  const scale = fov / (fov + p.z + distance);
  return { x: p.x * scale * size + width / 2, y: p.y * scale * size + height / 2, z: p.z };
};
