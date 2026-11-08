import React from 'react';
import {
  Sparkles,
  Smartphone,
  Brain,
  Globe,
  Radio,
  Sliders,
  Layers,
  Mic,
  Maximize2,
} from 'lucide-react';
import { SupportedLanguage } from '../types';

interface HeaderProps {
  currentLanguage: SupportedLanguage;
  onLanguageClick: () => void;
  onOpenPhone: () => void;
  onOpenMemory: () => void;
  onOpenAndroidExport: () => void;
  onOpenLiveVoice: () => void;
  activeNav: 'home' | 'chat' | 'coding' | 'settings';
  onNavChange: (nav: 'home' | 'chat' | 'coding' | 'settings') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageClick,
  onOpenPhone,
  onOpenMemory,
  onOpenAndroidExport,
  onOpenLiveVoice,
  activeNav,
  onNavChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#050711]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between">
      {/* Brand */}
      <div
        onClick={() => onNavChange('home')}
        className="flex items-center space-x-3 cursor-pointer select-none group"
      >
        <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-950/50 group-hover:scale-105 transition-transform">
          <Sparkles size={18} className="animate-pulse" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              MADHURI AI
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30">
              PRO v2.5
            </span>
          </div>
          <p className="hidden md:block text-[10px] text-slate-400 font-medium tracking-wide">
            Your Voice • Your World • Your Intelligent Companion
          </p>
        </div>
      </div>

      {/* Center Navigation Pills */}
      <div className="hidden lg:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => onNavChange('home')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
            activeNav === 'home'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Voice Home
        </button>
        <button
          onClick={() => onNavChange('chat')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
            activeNav === 'chat'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Chat
        </button>
        <button
          onClick={() => onNavChange('coding')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
            activeNav === 'coding'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Coding & Apps
        </button>
        <button
          onClick={() => onNavChange('settings')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
            activeNav === 'settings'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2">
        {/* Language Pill */}
        <button
          onClick={onLanguageClick}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
          title="Change language"
        >
          <Globe size={13} className="text-cyan-400" />
          <span>{currentLanguage.flag}</span>
          <span className="hidden sm:inline font-medium">{currentLanguage.name}</span>
        </button>

        {/* Memory Trigger */}
        <button
          onClick={onOpenMemory}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-purple-400 hover:text-purple-300 transition-colors"
          title="Personal Memory System"
        >
          <Brain size={16} />
        </button>

        {/* Android Phone Simulator Trigger */}
        <button
          onClick={onOpenPhone}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors"
          title="Open Android Phone Action Simulator"
        >
          <Smartphone size={15} />
          <span className="hidden sm:inline">Phone Control</span>
        </button>

        {/* Android Studio Export Hub */}
        <button
          onClick={onOpenAndroidExport}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-colors"
          title="Android Studio Kotlin & XML Source Code Hub"
        >
          <Layers size={15} />
          <span className="hidden sm:inline">Android Code</span>
        </button>

        {/* Live Voice Experience Modal Trigger */}
        <button
          onClick={onOpenLiveVoice}
          className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold shadow-md shadow-cyan-950/40 transition-transform active:scale-95"
          title="Open Fullscreen 3D Live Voice Experience"
        >
          <Mic size={16} />
        </button>
      </div>
    </header>
  );
};
