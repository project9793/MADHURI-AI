import React from 'react';
import {
  Mic,
  MicOff,
  Square,
  RotateCcw,
  Volume2,
  X,
  Radio,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Orb3D } from './Orb3D';
import { VoiceState, SupportedLanguage } from '../types';

interface LiveVoiceExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceState: VoiceState;
  audioLevel: number;
  userTranscript: string;
  assistantResponse: string;
  onToggleMic: () => void;
  onStopSpeaking: () => void;
  onRepeat: () => void;
  autoListen: boolean;
  onToggleAutoListen: () => void;
  currentLanguage: SupportedLanguage;
  onSelectLanguageClick: () => void;
}

export const LiveVoiceExperienceModal: React.FC<LiveVoiceExperienceModalProps> = ({
  isOpen,
  onClose,
  voiceState,
  audioLevel,
  userTranscript,
  assistantResponse,
  onToggleMic,
  onStopSpeaking,
  onRepeat,
  autoListen,
  onToggleAutoListen,
  currentLanguage,
  onSelectLanguageClick,
}) => {
  if (!isOpen) return null;

  const getStatusText = () => {
    switch (voiceState) {
      case 'listening':
        return 'Listening to you... Speak now';
      case 'processing':
        return 'Madhuri is thinking with Gemini 3.8 Flash...';
      case 'speaking':
        return 'Madhuri is speaking... (Tap orb to interrupt)';
      case 'interrupted':
        return 'Interrupted. Tap mic to speak again';
      case 'error':
        return 'Microphone or network issue';
      case 'idle':
      default:
        return 'Ready. Tap the Orb or Microphone to start talking';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 md:p-8 bg-[#04060f]/95 backdrop-blur-2xl text-white select-none">
      
      {/* Top Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              MADHURI LIVE VOICE
            </h1>
            <p className="text-[11px] text-slate-400">Continuous Human-Like Voice Companion</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language badge */}
          <button
            onClick={onSelectLanguageClick}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-xs transition-colors"
          >
            <Globe size={14} className="text-cyan-400" />
            <span>{currentLanguage.flag}</span>
            <span className="font-medium text-slate-200">{currentLanguage.name}</span>
          </button>

          {/* Hands-free mode toggle */}
          <button
            onClick={onToggleAutoListen}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
              autoListen
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-900/40'
                : 'bg-slate-900/80 border-slate-700 text-slate-400'
            }`}
            title="Auto-listen after speaking"
          >
            <Radio size={14} className={autoListen ? 'animate-pulse text-cyan-400' : ''} />
            <span>{autoListen ? 'Hands-Free On' : 'Hands-Free Off'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Center 3D Orb Stage */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 max-w-2xl w-full text-center relative">
        
        {/* Glow backdrop behind Orb */}
        <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-purple-600/20 via-cyan-500/20 to-pink-600/20 blur-3xl -z-10 pointer-events-none" />

        {/* 3D Orb Canvas */}
        <Orb3D
          state={voiceState}
          audioLevel={audioLevel}
          size={320}
          onClick={() => {
            if (voiceState === 'speaking') {
              onStopSpeaking();
            } else {
              onToggleMic();
            }
          }}
          className="my-2"
        />

        {/* Status Pill */}
        <div className="mt-4 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 shadow-lg flex items-center space-x-2 text-xs md:text-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              voiceState === 'listening'
                ? 'bg-cyan-400 animate-ping'
                : voiceState === 'speaking'
                ? 'bg-pink-400 animate-pulse'
                : voiceState === 'processing'
                ? 'bg-purple-400 animate-spin'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-slate-200 font-medium">{getStatusText()}</span>
        </div>

        {/* Subtitle Transcripts Box */}
        <div className="w-full mt-6 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 min-h-[90px] flex flex-col justify-center">
          {userTranscript ? (
            <div className="text-xs text-cyan-400 mb-1 flex items-center justify-center gap-1.5">
              <span>You said:</span>
              <span className="italic text-slate-200">&ldquo;{userTranscript}&rdquo;</span>
            </div>
          ) : null}

          {assistantResponse ? (
            <div className="text-sm md:text-base text-slate-100 font-medium leading-relaxed max-h-24 overflow-y-auto">
              {assistantResponse}
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic">
              Try asking: &ldquo;नमस्ते माधुरी, मॉम को फोन मिलाओ&rdquo; or &ldquo;How does Android Jetpack Compose work?&rdquo;
            </div>
          )}
        </div>
      </div>

      {/* Bottom Floating Control Dock */}
      <div className="w-full max-w-md flex items-center justify-center space-x-4 z-10 pb-2">
        
        {/* Repeat Button */}
        <button
          onClick={onRepeat}
          disabled={!assistantResponse}
          className="p-3.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Repeat last response"
        >
          <RotateCcw size={20} />
        </button>

        {/* Primary Mic Button */}
        <button
          onClick={onToggleMic}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 ${
            voiceState === 'listening'
              ? 'bg-cyan-400 text-slate-950 shadow-cyan-500/50 ring-4 ring-cyan-400/30'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/60'
          }`}
          title={voiceState === 'listening' ? 'Stop listening' : 'Start voice conversation'}
        >
          {voiceState === 'listening' ? <MicOff size={28} /> : <Mic size={28} />}
        </button>

        {/* Stop / Interrupt Button */}
        <button
          onClick={onStopSpeaking}
          disabled={voiceState !== 'speaking'}
          className="p-3.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Stop / Interrupt voice"
        >
          <Square size={20} />
        </button>
      </div>
    </div>
  );
};
