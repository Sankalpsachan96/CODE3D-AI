import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Browser-native TTS controller for execution-step narration.
 * No network/API key required. Call speak() when the selected trace step changes.
 * Cancels stale utterances so rapid step changes never queue old narration.
 */
export function useTextToSpeech() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const [rate, setRate] = useState(1);
  const [caption, setCaption] = useState('');
  const generation = useRef(0);

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance === 'function'
    );
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
    const synth = window.speechSynthesis;
    return () => {
      generation.current += 1;
      synth.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    generation.current += 1;
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }, []);

  const speak = useCallback((text, options = {}) => {
    const message = String(text ?? '').trim();
    setCaption(message);
    if (!message || !enabled || typeof window === 'undefined' || !window.speechSynthesis ||
        typeof window.SpeechSynthesisUtterance !== 'function') {
      stop();
      return false;
    }

    const synth = window.speechSynthesis;
    const requestId = ++generation.current;
    synth.cancel();
    const utterance = new window.SpeechSynthesisUtterance(message);
    utterance.lang = options.lang || voiceLanguage;
    utterance.rate = Math.max(0.7, Math.min(1.3, Number(options.rate ?? rate) || 1));
    utterance.onstart = () => {
      if (generation.current === requestId) { setSpeaking(true); setPaused(false); }
    };
    utterance.onend = () => {
      if (generation.current === requestId) { setSpeaking(false); setPaused(false); }
    };
    utterance.onerror = () => {
      if (generation.current === requestId) { setSpeaking(false); setPaused(false); }
    };
    synth.speak(utterance);
    return true;
  }, [enabled, rate, stop, voiceLanguage]);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabled((previous) => {
      if (previous && typeof window !== 'undefined' && window.speechSynthesis) {
        generation.current += 1;
        window.speechSynthesis.cancel();
        setSpeaking(false);
        setPaused(false);
      }
      return !previous;
    });
  }, []);

  return {
    supported, enabled, speaking, paused, voiceLanguage, rate, caption,
    setVoiceLanguage, setRate, setCaption, toggleEnabled, speak, pause, resume, stop,
  };
}

export default useTextToSpeech;
