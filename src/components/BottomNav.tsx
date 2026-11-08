import React from 'react';
import { Home, MessageSquare, Code2, Sliders, Smartphone } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'chat' | 'coding' | 'settings';
  onTabChange: (tab: 'home' | 'chat' | 'coding' | 'settings') => void;
  onOpenPhone: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onOpenPhone }) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050711]/95 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2 flex items-center justify-around">
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center p-1.5 transition-colors ${
          activeTab === 'home' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home size={18} />
        <span className="text-[10px] mt-0.5">Home</span>
      </button>

      <button
        onClick={() => onTabChange('chat')}
        className={`flex flex-col items-center p-1.5 transition-colors ${
          activeTab === 'chat' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <MessageSquare size={18} />
        <span className="text-[10px] mt-0.5">Chat</span>
      </button>

      {/* Center Phone Action Button */}
      <button
        onClick={onOpenPhone}
        className="flex flex-col items-center -mt-5 p-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 shadow-lg shadow-cyan-950/60 active:scale-95 transition-transform"
        title="Open Android Phone Simulator"
      >
        <Smartphone size={22} className="text-slate-950" />
      </button>

      <button
        onClick={() => onTabChange('coding')}
        className={`flex flex-col items-center p-1.5 transition-colors ${
          activeTab === 'coding' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Code2 size={18} />
        <span className="text-[10px] mt-0.5">Coding</span>
      </button>

      <button
        onClick={() => onTabChange('settings')}
        className={`flex flex-col items-center p-1.5 transition-colors ${
          activeTab === 'settings' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sliders size={18} />
        <span className="text-[10px] mt-0.5">Settings</span>
      </button>
    </div>
  );
};
