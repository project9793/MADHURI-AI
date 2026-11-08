import React from 'react';
import {
  Mic,
  MicOff,
  Square,
  RotateCcw,
  Sparkles,
  Phone,
  MessageSquare,
  Clock,
  Youtube,
  Code2,
  Globe,
  ImageIcon,
  Brain,
  Layers,
  Radio,
  Volume2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Orb3D } from './Orb3D';
import { VoiceState, SupportedLanguage, UserSettings } from '../types';

interface HomeScreenViewProps {
  voiceState: VoiceState;
  audioLevel: number;
  userTranscript: string;
  assistantResponse: string;
  onToggleMic: () => void;
  onStopSpeaking: () => void;
  onRepeat: () => void;
  onNavigate: (tab: 'home' | 'chat' | 'coding' | 'settings') => void;
  onOpenPhone: () => void;
  onOpenLiveVoice: () => void;
  onOpenMemory: () => void;
  onOpenAndroidExport: () => void;
  currentLanguage: SupportedLanguage;
  settings: UserSettings;
  onQuickPrompt: (prompt: string) => void;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  voiceState,
  audioLevel,
  userTranscript,
  assistantResponse,
  onToggleMic,
  onStopSpeaking,
  onRepeat,
  onNavigate,
  onOpenPhone,
  onOpenLiveVoice,
  onOpenMemory,
  onOpenAndroidExport,
  currentLanguage,
  settings,
  onQuickPrompt,
}) => {
  const getStatusLabel = () => {
    switch (voiceState) {
      case 'listening':
        return 'Listening to you... Speak now';
      case 'processing':
        return 'Thinking with Gemini 3.8 Flash...';
      case 'speaking':
        return 'Madhuri is speaking... (Click orb to interrupt)';
      case 'interrupted':
        return 'Interrupted. Tap mic to speak';
      case 'error':
        return 'Voice connection issue';
      case 'idle':
      default:
        return 'Tap the 3D Orb or Mic to talk';
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-6 max-w-6xl mx-auto w-full space-y-6">
      
      {/* Top Welcome Section */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/20 text-xs text-cyan-300 mb-1.5">
            <Sparkles size={12} className="text-cyan-400 animate-spin-slow" />
            <span>AI Voice-to-Voice Companion • Android Native Bridge</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Namaste, <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">{settings.userName}</span>!
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Madhuri AI is ready. What would you like to do today?
          </p>
        </div>

        {/* Quick Capabilities Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Voice Engine: Live</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Lang: {currentLanguage.nativeName}</span>
          </div>
        </div>
      </div>

      {/* Center 3D Orb Stage */}
      <div className="flex flex-col items-center justify-center my-2 relative w-full">
        {/* Ambient Halo */}
        <div className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-r from-purple-600/20 via-cyan-500/15 to-pink-600/20 blur-3xl -z-10 pointer-events-none" />

        <Orb3D
          state={voiceState}
          audioLevel={audioLevel}
          size={260}
          onClick={() => {
            if (voiceState === 'speaking') {
              onStopSpeaking();
            } else {
              onToggleMic();
            }
          }}
        />

        {/* Dynamic Status Pill */}
        <div className="mt-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-lg flex items-center space-x-2 text-xs">
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
          <span className="text-slate-200 font-medium">{getStatusLabel()}</span>
        </div>

        {/* Live Audio Transcript Subtitle */}
        {(userTranscript || assistantResponse) && (
          <div className="mt-4 max-w-xl w-full p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center animate-fade-in shadow-xl">
            {userTranscript && (
              <div className="text-xs text-cyan-400 mb-1 flex items-center justify-center gap-1.5">
                <span>You:</span>
                <span className="italic text-slate-200">&ldquo;{userTranscript}&rdquo;</span>
              </div>
            )}
            {assistantResponse && (
              <div className="text-xs md:text-sm text-slate-100 font-medium leading-relaxed max-h-20 overflow-y-auto">
                {assistantResponse}
              </div>
            )}
          </div>
        )}

        {/* Voice Controls Dock */}
        <div className="flex items-center space-x-3 mt-4">
          <button
            onClick={onRepeat}
            disabled={!assistantResponse}
            className="p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
            title="Repeat last response"
          >
            <RotateCcw size={17} />
          </button>

          <button
            onClick={onToggleMic}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
              voiceState === 'listening'
                ? 'bg-cyan-400 text-slate-950 shadow-cyan-400/40 ring-4 ring-cyan-400/20'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/50'
            }`}
            title={voiceState === 'listening' ? 'Stop listening' : 'Start voice conversation'}
          >
            {voiceState === 'listening' ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <button
            onClick={onStopSpeaking}
            disabled={voiceState !== 'speaking'}
            className="p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
            title="Stop speaking"
          >
            <Square size={17} />
          </button>

          <button
            onClick={onOpenLiveVoice}
            className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md"
            title="Open Immersive Fullscreen Mode"
          >
            <Radio size={14} className="text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Live Mode</span>
          </button>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="w-full flex items-center justify-center gap-2 overflow-x-auto text-[11px] py-1">
        {[
          { label: '📞 Call Mom', prompt: 'मॉम को फोन मिलाओ' },
          { label: '⏰ Alarm 7:00 AM', prompt: 'कल सुबह 7 बजे का अलार्म लगाओ' },
          { label: '🎵 YouTube Songs', prompt: 'YouTube पर अरिजीत सिंह के गाने चलाओ' },
          { label: '💬 Send WhatsApp', prompt: 'राहुल को व्हाट्सऐप पर मैसेज भेजो कि मैं 10 मिनट में आ रहा हूँ' },
          { label: '💻 Kotlin Jetpack Code', prompt: 'Android Jetpack Compose में Voice Visualizer का कोड लिखो' },
          { label: '🎭 Bhojpuri Joke', prompt: 'भोजपुरी में एगो नीक चुटकुला सुनावा' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => onQuickPrompt(item.prompt)}
            className="px-3 py-1.5 rounded-full bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 whitespace-nowrap transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Quick Action Cards Grid (6 cards required by prompt) */}
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Ask Madhuri */}
        <button
          onClick={onOpenLiveVoice}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-purple-950/40 border border-purple-500/20 hover:border-purple-500/50 flex flex-col items-center text-center group transition-all duration-300 hover:-translate-y-1 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2 group-hover:scale-110 transition-transform">
            <Mic size={20} />
          </div>
          <div className="font-bold text-xs text-white">Ask Madhuri</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Voice Companion</div>
        </button>

        {/* 2. AI Chat */}
        <button
          onClick={() => onNavigate('chat')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-indigo-950/40 border border-indigo-500/20 hover:border-indigo-500/50 flex flex-col items-center text-center group transition-all duration-300 hover:-translate-y-1 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
            <MessageSquare size={20} />
          </div>
          <div className="font-bold text-xs text-white">AI Chat</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Text & Voice Flow</div>
        </button>

        {/* 3. Phone Control */}
        <button
          onClick={onOpenPhone}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-cyan-950/40 border border-cyan-500/20 hover:border-cyan-500/50 flex flex-col items-center text-center group transition-all duration-300 hover:-translate-y-1 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
            <Phone size={20} />
          </div>
          <div className="font-bold text-xs text-white">Phone Control</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Calls, Apps & Alarms</div>
        </button>

        {/* 4. AI Coding */}
        <button
          onClick={() => onNavigate('coding')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-blue-950/40 border border-blue-500/20 hover:border-blue-500/50 flex flex-col items-center text-center group transition-all duration-300 hover:-translate-y-1 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-110 transition-transform">
            <Code2 size={20} />
          </div>
          <div className="font-bold text-xs text-white">AI Coding</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Kotlin & Java Apps</div>
        </button>

        {/* 5. Website Creator */}
        <button
          onClick={() => onNavigate('coding')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/50 flex flex-col items-center text-center group transition-all duration-300 hover:-translate-y-1 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
            <Globe size={20} />
          </div>
          <div className="font-bold text-xs text-white">Website Creator</div>
          <div className="text-[10px] text-slate-400 mt-0.5">HTML & Tailwind Live</div>
        </button>

        {/* 6. Image Understanding */}
        <button
          onClick={() => onNavigate('chat')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-pink-950/40 border border-pink-500/20 hover:border-pink-500/50 flex flex-col items-center text-center group transition-all duration-300 hover:-translate-y-1 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-2 group-hover:scale-110 transition-transform">
            <ImageIcon size={20} />
          </div>
          <div className="font-bold text-xs text-white">Image Analysis</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Multimodal Vision</div>
        </button>
      </div>
    </div>
  );
};
