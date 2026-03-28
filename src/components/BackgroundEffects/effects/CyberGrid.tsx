import React, { useEffect, useMemo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export const CyberGrid = React.memo(({ activeColor }: { activeColor: string }) => {
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
    for (let i = 0; i <= 30; i++) {
      const x = (gridWidth / 30) * i;
      p += `M${x} 0 L${x} ${gridHeight} `;
    }
    for (let i = 0; i <= 40; i++) {
      const y = i * 60;
      p += `M0 ${y} L${gridWidth} ${y} `;
    }
    return p;
  }, []);
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          {
            width: width * 4,
            height: height,
            position: 'absolute',
            bottom: -height * 0.2,
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
              { rotateX: '-65deg' },
              { translateY: -move.value },
            ],
            opacity: 0.4
          }))
        ]}
      >
        <Svg width={width * 4} height={height * 2}>
          <Path d={gridPath} stroke={activeColor} strokeWidth={3} />
        </Svg>
      </Animated.View>
    </View>
  );
});
