import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { speechService } from '../../../services/SpeechService';
import logger from '../../../utils/logger';

export const useSpeechOutput = () => {
  const { i18n } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const speakText = useCallback(async (text: string, messageId?: string) => {
    try {
      // If already speaking the same message, stop
      if (isSpeaking && speakingMessageId === messageId) {
        stopSpeaking();
        return;
      }

      setIsSpeaking(true);
      setSpeakingMessageId(messageId || null);
      
      await speechService.speak(text, i18n.language);
      
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    } catch (error) {
      logger.error(`Speak error: ${error}`, 'useSpeechOutput');
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
  }, [i18n.language, isSpeaking, speakingMessageId]);

  const stopSpeaking = useCallback(() => {
    speechService.stop();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, []);

  return {
    isSpeaking,
    speakingMessageId,
    speakText,
    stopSpeaking,
  };
};
