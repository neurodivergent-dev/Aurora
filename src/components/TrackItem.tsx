import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Music, Pause } from 'lucide-react-native';
import Animated, { FadeInDown, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from './ThemeProvider';
import { Track } from '../store/musicStore';

interface TrackItemProps {
  item: Track;
  index: number;
  isSelected: boolean;
  isPlaying: boolean;
  isActionsSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export const TrackItem: React.FC<TrackItemProps> = ({
  item,
  index,
  isSelected,
  isPlaying,
  isActionsSelected,
  onPress,
  onLongPress,
}) => {
  const { colors } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(isActionsSelected ? 1.02 : 1) }
      ],
      backgroundColor: withSpring(
        isActionsSelected 
          ? colors.primary + '30' 
          : (isSelected ? colors.primary + '15' : 'transparent')
      ),
    };
  });

  return (
    <Animated.View 
      entering={FadeInDown.delay(200 + index * 50)}
      style={[styles.container, animatedStyle]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={300}
        activeOpacity={0.7}
      >
        <View style={[
          styles.trackIcon, 
          { 
            backgroundColor: colors.card, 
            borderColor: isActionsSelected ? colors.primary : colors.border, 
            borderWidth: 1 
          }
        ]}>
          {isSelected && isPlaying ? (
            <Pause size={20} color={colors.primary} fill={colors.primary} />
          ) : (
            <Music size={20} color={isSelected || isActionsSelected ? colors.primary : colors.text} />
          )}
        </View>

        <View style={styles.trackInfo}>
          <Text 
            style={[
              styles.trackTitle, 
              { color: isSelected || isActionsSelected ? colors.primary : colors.text }
            ]} 
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={[styles.trackArtist, { color: colors.subText }]} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        
        {isActionsSelected && (
          <View style={[styles.selectionDot, { backgroundColor: colors.primary }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  trackIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  trackInfo: {
    flex: 1,
    justifyContent: "center",
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 13,
  },
  selectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  }
});
