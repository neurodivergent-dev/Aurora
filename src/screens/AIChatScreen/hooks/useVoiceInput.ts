import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useAudioRecorder, RecordingPresets } from 'expo-audio';
import { requestMicrophonePermission, enableRecordingMode, disableRecordingMode, sttService } from '../../../services/VoiceInputService';

export const useVoiceInput = () => {
  const { t, i18n } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
    // Status listener for debugging
    console.log('[useVoiceInput] Recorder status:', JSON.stringify(status));
  });

  const startRecording = useCallback(async () => {
    try {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        Alert.alert(t('settings.ai.chat.micPermissionDenied'));
        return;
      }

      await enableRecordingMode();
      
      // Must prepare before recording
      await recorder.prepareToRecordAsync();
      recorder.record();
      
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('[useVoiceInput] Recording started');
    } catch (error: any) {
      console.error('[useVoiceInput] Start error:', error);
      setIsRecording(false);
    }
  }, [t, recorder]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      console.log('[useVoiceInput] Stopping recording...');
      setIsRecording(false);
      setIsProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await recorder.stop();
      await disableRecordingMode();

      // Get URI after stop
      const audioUri = recorder.uri;
      console.log('[useVoiceInput] Audio URI:', audioUri);
      
      if (!audioUri) {
        console.warn('[useVoiceInput] No audio URI after stop');
        setIsProcessing(false);
        return null;
      }

      // Transcribe using Groq Whisper
      const transcription = await sttService.transcribe(audioUri, i18n.language);
      setIsProcessing(false);

      if (transcription && transcription.trim().length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return transcription.trim();
      }

      return null;
    } catch (error: any) {
      setIsRecording(false);
      setIsProcessing(false);
      await disableRecordingMode().catch(() => {});
      console.error('[useVoiceInput] Stop error:', error);

      if (error.message === 'GROQ_KEY_REQUIRED') {
        Alert.alert(t('settings.ai.chat.groqKeyRequired'));
      } else {
        Alert.alert(t('settings.ai.chat.speechError'));
      }
      return null;
    }
  }, [i18n.language, t, recorder]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  };
};
