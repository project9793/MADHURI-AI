import React, { useState, useEffect } from 'react';
import {
  Key,
  Globe,
  Mic,
  Brain,
  Shield,
  Palette,
  Smartphone,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  Info,
  Trash2,
  Sliders,
  Volume2,
} from 'lucide-react';
import { UserSettings } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { testGeminiApiKey, checkServerStatus } from '../services/geminiClient';
import { speechService } from '../services/speechService';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onOpenMemoryModal: () => void;
  onOpenAndroidExport: () => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenMemoryModal,
  onOpenAndroidExport,
  onResetAllData,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey || '');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState<{ valid?: boolean; message?: string } | null>(null);
  const [serverStatus, setServerStatus] = useState<{ hasServerKey: boolean; status: string; model: string }>({
    hasServerKey: false,
    status: 'checking',
    model: 'gemini-3.8-flash',
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    checkServerStatus().then(setServerStatus);
    setAvailableVoices(speechService.getAvailableVoices());
  }, []);

  const handleTestApiKey = async () => {
    setIsTestingKey(true);
    setKeyTestStatus(null);
    const result = await testGeminiApiKey(apiKeyInput);
    setIsTestingKey(false);
    if (result.valid) {
      setKeyTestStatus({ valid: true, message: 'API Key verified successfully with Gemini 3.8 Flash!' });
      onUpdateSettings({ ...settings, apiKey: apiKeyInput });
    } else {
      setKeyTestStatus({ valid: false, message: result.error || 'Invalid API Key or connection error.' });
    }
  };

  const handleSaveApiKey = () => {
    onUpdateSettings({ ...settings, apiKey: apiKeyInput.trim() });
    setKeyTestStatus({ valid: true, message: 'API Key saved.' });
  };

  const handleDeleteApiKey = () => {
    setApiKeyInput('');
    onUpdateSettings({ ...settings, apiKey: '' });
    setKeyTestStatus({ valid: true, message: 'Custom API Key removed. Server fallback will be used.' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <Sliders size={24} className="text-cyan-400" />
          Madhuri AI System Settings & Diagnostics
        </h1>
        <p className="text-xs text-slate-400">
          Configure Gemini AI, voice parameters, multi-language switching, and device permissions
        </p>
      </div>

      {/* 1. Gemini AI Configuration */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Key size={20} />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                Gemini AI Engine
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  gemini-3.8-flash
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Server-side proxy with secure secret management
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus.hasServerKey ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">
              {serverStatus.hasServerKey ? 'Default Server Key Active' : 'Custom Key Configured'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Custom Gemini API Key (Optional override):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy... (leave blank to use built-in environment key)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
            <div className="flex gap-2">
              <button
                onClick={handleTestApiKey}
                disabled={isTestingKey || !apiKeyInput}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-40"
              >
                {isTestingKey ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>Test Key</span>
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Save
              </button>
              {apiKeyInput && (
                <button
                  onClick={handleDeleteApiKey}
                  className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs"
                  title="Remove custom key"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {keyTestStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                keyTestStatus.valid
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/30 text-red-300'
              }`}
            >
              {keyTestStatus.valid ? <CheckCircle size={15} /> : <XCircle size={15} />}
              <span>{keyTestStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Multi-Language Settings */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Globe size={20} />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-white">Multi-Language Engine</h2>
            <p className="text-xs text-slate-400">
              Support for Hindi, Bhojpuri, Sanskrit, English, Urdu, and 20+ world languages
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">Input Voice Recognition Language:</label>
            <select
              value={settings.inputLanguage}
              onChange={(e) => onUpdateSettings({ ...settings, inputLanguage: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-400"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">Assistant Spoken Reply Language:</label>
            <select
              value={settings.responseLanguage}
              onChange={(e) => onUpdateSettings({ ...settings, responseLanguage: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-400"
            >
              <option value="auto">🌐 Automatic (Match User's Spoken Language)</option>
              {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Voice Synthesizer Dynamics */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Volume2 size={20} />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-white">Voice & Speech Synthesizer</h2>
            <p className="text-xs text-slate-400">Natural tone tuning, speed, and continuous auto-listening</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Speech Rate (Speed):</span>
              <span className="font-mono text-cyan-400">{settings.speechRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.1"
              value={settings.speechRate}
              onChange={(e) => onUpdateSettings({ ...settings, speechRate: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Speech Pitch:</span>
              <span className="font-mono text-pink-400">{settings.speechPitch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={settings.speechPitch}
              onChange={(e) => onUpdateSettings({ ...settings, speechPitch: parseFloat(e.target.value) })}
              className="w-full accent-pink-400"
            />
          </div>
        </div>

        {/* Continuous mode */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-slate-200">Continuous Conversational Mode</div>
            <div className="text-[11px] text-slate-400">Automatically listen for user voice after Madhuri speaks</div>
          </div>
          <button
            onClick={() => onUpdateSettings({ ...settings, autoListen: !settings.autoListen })}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              settings.autoListen ? 'bg-cyan-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.autoListen ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. Assistant Personality */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-white">Assistant Personality</h2>
            <p className="text-xs text-slate-400">Select Madhuri&apos;s conversational tone</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['friendly', 'professional', 'concise', 'humorous'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onUpdateSettings({ ...settings, personality: p })}
              className={`p-3 rounded-xl border text-center capitalize transition-all ${
                settings.personality === p
                  ? 'bg-purple-500/20 border-purple-400 text-purple-200 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Memory & Android Native Code Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <button
          onClick={onOpenMemoryModal}
          className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-left flex items-center space-x-3 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Brain size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-200">Open Memory Manager</div>
            <div className="text-[11px] text-slate-400">Manage user facts, preferences & Firebase rules</div>
          </div>
        </button>

        <button
          onClick={onOpenAndroidExport}
          className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left flex items-center space-x-3 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Smartphone size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-200">Android Studio Project Hub</div>
            <div className="text-[11px] text-slate-400">View & download Kotlin, Manifest & APK build guide</div>
          </div>
        </button>
      </div>

      {/* 6. Privacy & Danger Zone */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-red-500/20 space-y-3 text-xs">
        <div className="flex items-center space-x-2 text-red-400 font-semibold">
          <Shield size={16} />
          <span>Privacy & Data Isolation</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Madhuri AI respects user privacy. Voice audio is processed locally or via secure server-side Gemini 3.8 Flash
          proxy. Sensitive phone actions (dialing, messaging) require user confirmation.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all Madhuri AI messages, memories and settings?')) {
              onResetAllData();
            }
          }}
          className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-semibold border border-red-500/30 flex items-center space-x-1.5 transition-colors"
        >
          <Trash2 size={14} />
          <span>Reset All Applet Data & Cache</span>
        </button>
      </div>
    </div>
  );
};
