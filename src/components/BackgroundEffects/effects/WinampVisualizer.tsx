import React, { useEffect, useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useMusicStore } from '../../../store/musicStore';
import { styles } from '../styles';

const WinampBar = React.memo(({ activeColor }: { activeColor: string }) => {
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
});

export const WinampVisualizer = React.memo(({ activeColor }: { activeColor: string }) => {
  const bars = useMemo(() => Array.from({ length: 32 }, (_, i) => i), []);
  return (
    <View style={styles.winampContainer}>
      <View style={styles.winampViz}>
        {bars.map(i => <WinampBar key={i} activeColor={activeColor} />)}
      </View>
    </View>
  );
});
