import { requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import logger from '../utils/logger';

// ─── Permission Helper (SRP) ───
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const { granted } = await requestRecordingPermissionsAsync();
    return granted;
  } catch (error) {
    logger.error(`Permission error: ${error}`, 'VoiceInput');
    return false;
  }
}

// ─── Audio Mode Helpers ───
export async function enableRecordingMode(): Promise<void> {
  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });
}

export async function disableRecordingMode(): Promise<void> {
  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
  });
}

// ─── Groq Whisper STT Service (SRP - Single Responsibility) ───
export interface ISpeechToTextService {
  transcribe(audioUri: string, language?: string): Promise<string>;
}

class GroqWhisperSTTService implements ISpeechToTextService {
  async transcribe(audioUri: string, language: string = 'en'): Promise<string> {
    try {
      // Get Groq API key
      const { useAIStore } = require('../store/aiStore');
      const { groqApiKey } = useAIStore.getState();

      if (!groqApiKey) {
        throw new Error('GROQ_KEY_REQUIRED');
      }

      // Verify file exists
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error('FILE_NOT_FOUND');
      }

      // Create FormData for Groq Whisper API
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('model', 'whisper-large-v3');
      formData.append('language', language.startsWith('tr') ? 'tr' : 'en');
      formData.append('response_format', 'text');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Groq API Error: ${response.status} ${errorText}`, 'STT');
        throw new Error(`API_ERROR_${response.status}`);
      }

      const transcription = await response.text();
      logger.info(`Transcription: ${transcription.trim()}`, 'STT');
      return transcription.trim();
    } catch (error) {
      logger.error(`Transcription error: ${error}`, 'STT');
      throw error;
    }
  }
}

// Singleton export
export const sttService: ISpeechToTextService = new GroqWhisperSTTService();
