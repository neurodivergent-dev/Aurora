import React, { useEffect, useMemo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { LinearGradient, Defs, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../../ThemeProvider';

const { width, height } = Dimensions.get('window');

export const PrismBackground = React.memo(({ activeColor }: { activeColor: string }) => {
  const { colors } = useTheme(); const tx = useSharedValue(-width); const gradId = useMemo(() => `prism-${Math.random()}`, []);
  useEffect(() => { tx.value = withRepeat(withTiming(width * 1.5, { duration: 12000, easing: Easing.inOut(Easing.sin) }), -1, true); }, []);
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[{ position: 'absolute', top: -height * 0.5, height: height * 2, width: width * 0.8 }, useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { rotate: '35deg' }], opacity: 0.2 }))]}>
        <Svg width="100%" height="100%"><Defs><LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor={activeColor} stopOpacity="0" /><Stop offset="0.5" stopColor={activeColor} stopOpacity="0.8" /><Stop offset="1" stopColor={activeColor} stopOpacity="0" /></LinearGradient></Defs><Rect width="100%" height="100%" fill={`url(#${gradId})`} /></Svg>
      </Animated.View>
    </View>
  );
});
