import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  isSpeechSynthesisSupported,
  getBcp47LangTag,
  speakTranslationText,
  cancelSpeech,
  pauseSpeech,
  resumeSpeech,
} from './tts';

describe('tts utility - getBcp47LangTag', () => {
  it('maps short language codes to full BCP 47 tags', () => {
    expect(getBcp47LangTag('ml')).toBe('ml-IN');
    expect(getBcp47LangTag('en')).toBe('en-US');
    expect(getBcp47LangTag('ar')).toBe('ar-SA');
    expect(getBcp47LangTag('ur')).toBe('ur-PK');
    expect(getBcp47LangTag('id')).toBe('id-ID');
  });

  it('falls back to default en-US for unknown or empty codes', () => {
    expect(getBcp47LangTag('')).toBe('en-US');
  });
});

describe('tts utility - isSpeechSynthesisSupported', () => {
  it('returns false when window is undefined or lacks speechSynthesis', () => {
    expect(isSpeechSynthesisSupported()).toBe(false);
  });
});

class MockUtterance {
  text: string;

  lang: string = '';

  rate: number = 1;

  pitch: number = 1;

  volume: number = 1;

  onend: (() => void) | null = null;

  onerror: ((e: any) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

const speakMock = vi.fn();
const cancelMock = vi.fn();
const pauseMock = vi.fn();
const resumeMock = vi.fn();
const getVoicesMock = vi.fn().mockReturnValue([]);

const setupMockWindow = () => {
  vi.stubGlobal('window', {
    speechSynthesis: {
      speak: speakMock,
      cancel: cancelMock,
      pause: pauseMock,
      resume: resumeMock,
      getVoices: getVoicesMock,
    },
    SpeechSynthesisUtterance: MockUtterance,
  });
};

describe('tts utility - speakTranslationText', () => {
  beforeEach(setupMockWindow);
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('returns true when speechSynthesis is supported', () => {
    expect(isSpeechSynthesisSupported()).toBe(true);
  });

  it('speaks translation text correctly', () => {
    const utterance = speakTranslationText({
      text: 'സുവ്യക്തമായ ഗ്രന്ഥത്തിലെ വചനങ്ങളാണിവ',
      lang: 'ml',
    });

    expect(utterance).not.toBeNull();
    expect(utterance?.lang).toBe('ml-IN');
    expect(speakMock).toHaveBeenCalledOnce();
  });
});

describe('tts utility - playback controls', () => {
  beforeEach(setupMockWindow);
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('controls speech playback operations', () => {
    cancelSpeech();
    expect(cancelMock).toHaveBeenCalledOnce();

    pauseSpeech();
    expect(pauseMock).toHaveBeenCalledOnce();

    resumeSpeech();
    expect(resumeMock).toHaveBeenCalledOnce();
  });
});
