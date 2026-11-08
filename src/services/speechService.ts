// Web Speech API and Audio Analysis for Madhuri AI Voice Engine

export interface SpeechCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onAudioLevel?: (level: number) => void; // 0 to 1
}

class SpeechService {
  private recognition: any = null;
  private isListeningActive = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  public isSpeechSupported(): boolean {
    return Boolean(
      typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  public isTtsSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public async startListening(langCode: string, callbacks: SpeechCallbacks): Promise<boolean> {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        callbacks.onError?.('Speech recognition is not supported in this browser. Please use Chrome/Edge or type your message.');
        return false;
      }
    }

    try {
      this.stopListening();
      this.stopSpeaking();

      // Set recognition language (map 'auto' or Bhojpuri/Sanskrit to closest standard Android/Web speech language)
      let speechLang = 'hi-IN';
      if (langCode && langCode !== 'auto') {
        speechLang = langCode;
      }
      this.recognition.lang = speechLang;

      // Start audio level analyzer
      await this.startAudioAnalysis(callbacks.onAudioLevel);

      this.recognition.onstart = () => {
        this.isListeningActive = true;
        callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        callbacks.onResult?.(transcript, Boolean(finalTranscript));
      };

      this.recognition.onerror = (event: any) => {
        this.stopAudioAnalysis();
        this.isListeningActive = false;
        callbacks.onError?.(event.error || 'Speech error occurred');
      };

      this.recognition.onend = () => {
        this.stopAudioAnalysis();
        this.isListeningActive = false;
        callbacks.onEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (e: any) {
      console.warn('Recognition start exception:', e);
      this.stopAudioAnalysis();
      callbacks.onError?.(e.message || 'Could not start microphone');
      return false;
    }
  }

  public stopListening() {
    this.isListeningActive = false;
    this.stopAudioAnalysis();
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // Ignore already stopped
      }
    }
  }

  public isListening(): boolean {
    return this.isListeningActive;
  }

  private async startAudioAnalysis(onLevel?: (level: number) => void) {
    if (!onLevel || typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const checkLevel = () => {
        if (!this.analyser || !this.isListeningActive) return;
        this.analyser.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1.0, avg / 120); // Scale to 0.0 - 1.0
        onLevel(normalized);

        this.animFrameId = requestAnimationFrame(checkLevel);
      };

      checkLevel();
    } catch (e) {
      console.warn('Microphone stream access for visualizer skipped or denied:', e);
    }
  }

  private stopAudioAnalysis() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
  }

  // Text-To-Speech
  public speak(
    text: string,
    options: {
      lang?: string;
      rate?: number;
      pitch?: number;
      voiceGender?: 'female' | 'male';
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ): void {
    if (!this.isTtsSupported()) {
      options.onEnd?.();
      return;
    }

    this.stopSpeaking();

    // Clean any markdown formatting, symbols or code blocks for speech
    const spokenText = text
      .replace(/```[\s\S]*?```/g, 'Here is the generated code snippet.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~]/g, '')
      .replace(/<<<ACTION:[\s\S]*?>>>/g, '')
      .trim();

    if (!spokenText) {
      options.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.05;

    // Pick appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const targetLang = options.lang || 'hi-IN';

    // Find best matching voice
    let matchingVoice = voices.find((v) => v.lang === targetLang);
    if (!matchingVoice) {
      // Look for Hindi voice or Indian English
      matchingVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.includes('IN'));
    }
    if (!matchingVoice && targetLang.startsWith('en')) {
      matchingVoice = voices.find((v) => v.lang.startsWith('en'));
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      this.currentUtterance = utterance;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      options.onError?.(e);
      options.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.isTtsSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isTtsSupported()) return [];
    return window.speechSynthesis.getVoices();
  }
}

export const speechService = new SpeechService();
