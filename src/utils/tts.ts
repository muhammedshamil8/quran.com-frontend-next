/* eslint-disable no-param-reassign */
/**
 * Text-to-Speech (TTS) Utility using Web Speech API (window.speechSynthesis)
 */

const LOCALE_TO_BCP47_MAP: Record<string, string> = {
  en: 'en-US',
  ml: 'ml-IN',
  ar: 'ar-SA',
  ur: 'ur-PK',
  bn: 'bn-IN',
  id: 'id-ID',
  tr: 'tr-TR',
  fr: 'fr-FR',
  es: 'es-ES',
  ru: 'ru-RU',
  it: 'it-IT',
  nl: 'nl-NL',
  pt: 'pt-PT',
  sq: 'sq-AL',
  th: 'th-TH',
  zh: 'zh-CN',
  ms: 'ms-MY',
  sw: 'sw-KE',
  vi: 'vi-VN',
  de: 'de-DE',
  fa: 'fa-IR',
};

export const isSpeechSynthesisSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  'SpeechSynthesisUtterance' in window;

export const getBcp47LangTag = (locale: string): string => {
  if (!locale) return 'en-US';
  const cleanLocale = locale.toLowerCase().split('-')[0];
  return LOCALE_TO_BCP47_MAP[cleanLocale] || locale;
};

export const getVoiceForLanguage = (langTag: string): SpeechSynthesisVoice | null => {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  const primaryLang = langTag.split('-')[0];

  return (
    voices.find((voice) => voice.lang === langTag) ||
    voices.find((voice) => voice.lang.startsWith(primaryLang)) ||
    null
  );
};

export interface SpeakOptions {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
  onBoundary?: (event: SpeechSynthesisEvent) => void;
}

const configureUtteranceHandlers = (
  utterance: SpeechSynthesisUtterance,
  options: SpeakOptions,
): void => {
  if (options.onEnd) {
    utterance.onend = () => options.onEnd?.();
  }
  if (options.onError) {
    utterance.onerror = (e) => options.onError?.(e);
  }
  if (options.onBoundary) {
    utterance.onboundary = (e) => options.onBoundary?.(e);
  }
};

const createUtterance = (options: SpeakOptions): SpeechSynthesisUtterance => {
  const { text, lang = 'en', rate = 1.0, pitch = 1.0, volume = 1.0 } = options;
  const UtteranceClass = window.SpeechSynthesisUtterance;
  const utterance = new UtteranceClass(text);
  const langTag = getBcp47LangTag(lang);

  utterance.lang = langTag;
  utterance.rate = Math.max(0.5, Math.min(rate, 2.0));
  utterance.pitch = Math.max(0.5, Math.min(pitch, 2.0));
  utterance.volume = Math.max(0, Math.min(volume, 1.0));

  const voice = getVoiceForLanguage(langTag);
  if (voice) {
    utterance.voice = voice;
  }

  configureUtteranceHandlers(utterance, options);
  return utterance;
};

export const speakTranslationText = (options: SpeakOptions): SpeechSynthesisUtterance | null => {
  if (!isSpeechSynthesisSupported() || !options.text) {
    options.onEnd?.();
    return null;
  }

  cancelSpeech();
  const utterance = createUtterance(options);
  window.speechSynthesis.speak(utterance);
  return utterance;
};

export const cancelSpeech = (): void => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};

export const pauseSpeech = (): void => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.pause();
  }
};

export const resumeSpeech = (): void => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.resume();
  }
};
