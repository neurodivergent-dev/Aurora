import * as Speech from 'expo-speech';
import logger from '../utils/logger';

// ─── Interface ───
export interface ISpeechService {
  speak(text: string, language?: string): Promise<void>;
  stop(): void;
  isSpeaking(): Promise<boolean>;
}

// ─── Text Cleaner ───
const cleanForSpeech = (text: string): string => {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\(AURORA_COMMAND:[^)]*\)/g, '')
    .replace(/\[ACTION:[^\]]*\]/g, '')
    .replace(/\[IMAGE:[^\]]*\]/g, '')
    .replace(/[#*_~`]/g, '')
    .replace(/[^\x00-\x7F\u00C0-\u024F\u0100-\u017F\u011E\u011F\u0130\u0131\u015E\u015F\u00D6\u00F6\u00DC\u00FC\u00C7\u00E7]/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

// ─── Implementation ───
class SpeechServiceImpl implements ISpeechService {
  private _isSpeaking = false;

  async speak(text: string, language: string = 'en'): Promise<void> {
    const cleanText = cleanForSpeech(text);
    logger.info(`Speaking: ${cleanText.substring(0, 60)}...`, 'TTS');
    
    if (!cleanText || cleanText.length < 2) return;

    // Stop previous speech if any
    if (this._isSpeaking) {
      Speech.stop();
      this._isSpeaking = false;
      // Wait for stop to complete
      await new Promise(r => setTimeout(r, 300));
    }

    const lang = language.startsWith('tr') ? 'tr-TR' : 'en-US';
    this._isSpeaking = true;

    // Small delay to let audio system settle (fixes Android TTS race condition)
    await new Promise(r => setTimeout(r, 500));

    return new Promise((resolve) => {
      logger.info('Calling Speech.speak now...', 'TTS');
      Speech.speak(cleanText, {
        language: lang,
        pitch: 1.0,
        rate: 0.85,
        onDone: () => {
          logger.info('Done', 'TTS');
          this._isSpeaking = false;
          resolve();
        },
        onError: (err) => {
          logger.error(`Error: ${JSON.stringify(err)}`, 'TTS');
          this._isSpeaking = false;
          resolve();
        },
        onStopped: () => {
          logger.info('Stopped by external call', 'TTS');
          this._isSpeaking = false;
          resolve();
        },
      });
    });
  }

  stop(): void {
    if (this._isSpeaking) {
      Speech.stop();
      this._isSpeaking = false;
    }
  }

  async isSpeaking(): Promise<boolean> {
    return Speech.isSpeakingAsync();
  }
}

export const speechService: ISpeechService = new SpeechServiceImpl();
