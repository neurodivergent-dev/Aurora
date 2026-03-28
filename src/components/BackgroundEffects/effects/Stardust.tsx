import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { SNodeProps } from '../types';
import { styles } from '../styles';

const { width, height } = Dimensions.get('window');

const SNode = React.memo(({ s, activeColor }: SNodeProps) => {
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
});

export const Stardust = React.memo(({ activeColor }: { activeColor: string }) => {
  const stars = useMemo(() => [...Array(50)].map((_, i) => ({ id: i, x: Math.random() * width - width / 2, y: Math.random() * height - height / 2, z: Math.random() * 1000 })), []);
  return (
    <View style={styles.vortexContainer}>
      {stars.map(s => <SNode key={s.id} s={s} activeColor={activeColor} />)}
    </View>
  );
});
