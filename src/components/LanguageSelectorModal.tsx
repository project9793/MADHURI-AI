import React, { useState } from 'react';
import { Globe, Search, Check, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { SupportedLanguage } from '../types';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#090e1f] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Select Language</h2>
              <p className="text-xs text-slate-400">Multi-language voice recognition and spoken responses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/60">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Hindi, Bhojpuri, Sanskrit, English..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="p-3 overflow-y-auto flex-1 space-y-1.5">
          {filtered.map((lang) => {
            const isSelected = selectedLanguage.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onSelectLanguage(lang);
                  onClose();
                }}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 font-semibold'
                    : 'bg-slate-900/40 hover:bg-slate-800/60 border border-transparent text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3 text-left">
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <div className="text-xs font-semibold text-white">{lang.name}</div>
                    <div className="text-[11px] text-slate-400">{lang.nativeName}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-slate-500">{lang.code}</span>
                  {isSelected && <Check size={16} className="text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
