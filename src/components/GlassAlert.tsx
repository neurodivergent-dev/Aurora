import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeProvider';
import { CheckCircle2, Info, AlertCircle, XCircle, Music } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  ZoomIn, 
  ZoomOut,
  Layout
} from 'react-native-reanimated';
import { useMusicStore } from '../store/musicStore';

const { width } = Dimensions.get('window');

export const GlassAlert: React.FC = () => {
  const { colors, isDarkMode } = useTheme();
  const { alertVisible, alertConfig, hideAlert } = useMusicStore();
  const { t } = useTranslation();

  if (!alertVisible || !alertConfig) return null;

  const { title, message, type = 'info' } = alertConfig;

  const getIcon = () => {
    const size = 32;
    switch (type) {
      case 'success':
        return <CheckCircle2 size={size} color={colors.primary} />;
      case 'error':
        return <XCircle size={size} color="#FF4B4B" />;
      case 'warning':
        return <AlertCircle size={size} color="#FFB800" />;
      case 'music':
        return <Music size={size} color={colors.primary} />;
      default:
        return <Info size={size} color={colors.primary} />;
    }
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View 
        entering={FadeIn.duration(300)} 
        exiting={FadeOut.duration(200)}
        style={StyleSheet.absoluteFill}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={[styles.backdrop, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)' }]} 
          onPress={hideAlert} 
        />
      </Animated.View>

      <Animated.View 
        layout={Layout.springify()}
        entering={ZoomIn.springify().damping(15)} 
        exiting={ZoomOut.duration(200)}
        style={styles.alertContainer}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 40 : 100}
          tint={isDarkMode ? 'dark' : 'light'}
          style={styles.blurWrapper}
        >
          <View style={[
            styles.content, 
            { 
              backgroundColor: isDarkMode ? 'rgba(25, 25, 25, 0.4)' : 'rgba(255, 255, 255, 0.4)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
              borderWidth: 1.5
            }
          ]}>
            <View style={[styles.iconWrapper, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }]}>
              {getIcon()}
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.message, { color: colors.subText }]}>{message}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }]} 
              onPress={hideAlert}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{t('common.ok', 'OK')}</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backdrop: {
    flex: 1,
  },
  alertContainer: {
    width: width * 0.85,
    maxWidth: 340,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 15,
  },
  blurWrapper: {
    borderRadius: 32,
  },
  content: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 32,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.9,
  },
  button: {
    width: '100%',
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
