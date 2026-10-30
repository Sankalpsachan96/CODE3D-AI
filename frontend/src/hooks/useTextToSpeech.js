import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Browser-native speech controller. Uses voices installed by the user's browser/OS:
 * no speech API key, server request, or provider quota is involved.
 */
export function useTextToSpeech() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState('');
  const generation = useRef(0);

  useEffect(() => {
    const available = typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance === 'function';
    setSupported(available);
    if (!available) return undefined;

    const synth = window.speechSynthesis;
    const refreshVoices = () => {
      const next = synth.getVoices();
      setVoices(next);
      setVoiceName((current) => current && next.some((voice) => voice.name === current)
        ? current
        : (next.find((voice) => voice.lang?.toLowerCase().startsWith('en'))?.name || next[0]?.name || ''));
    };
    refreshVoices();
    synth.addEventListener?.('voiceschanged', refreshVoices);
    return () => {
      generation.current += 1;
      synth.cancel();
      synth.removeEventListener?.('voiceschanged', refreshVoices);
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
    if (!message || !enabled || typeof window === 'undefined' ||
      !window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== 'function') {
      stop();
      return false;
    }
    const synth = window.speechSynthesis;
    const requestId = ++generation.current;
    synth.cancel();
    const utterance = new window.SpeechSynthesisUtterance(message);
    const language = options.lang || voiceLanguage;
    utterance.lang = language;
    utterance.rate = Math.max(0.7, Math.min(1.3, Number(options.rate ?? rate) || 1));
    const selectedVoice = voices.find((voice) => voice.name === (options.voiceName || voiceName));
    if (selectedVoice) utterance.voice = selectedVoice;
    else {
      const languageVoice = voices.find((voice) => voice.lang?.toLowerCase() === language.toLowerCase()) ||
        voices.find((voice) => voice.lang?.toLowerCase().startsWith(language.slice(0, 2).toLowerCase()));
      if (languageVoice) utterance.voice = languageVoice;
    }
    utterance.onstart = () => {
      if (generation.current === requestId) { setSpeaking(true); setPaused(false); }
    };
    utterance.onend = () => {
      if (generation.current === requestId) {
        setSpeaking(false);
        setPaused(false);
        options.onEnd?.();
      }
    };
    utterance.onerror = () => {
      if (generation.current === requestId) { setSpeaking(false); setPaused(false); }
    };
    synth.speak(utterance);
    return true;
  }, [enabled, rate, stop, voiceLanguage, voiceName, voices]);

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
    supported, enabled, speaking, paused, voiceLanguage, rate, voices, voiceName,
    setVoiceLanguage, setRate, setVoiceName, toggleEnabled, speak, pause, resume, stop,
  };
}
export default useTextToSpeech;
