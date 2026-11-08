import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  FileCode,
  Layers,
  Sparkles,
  BookOpen,
  Terminal,
  X,
  ExternalLink,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../data/androidProjectCode';

interface AndroidExportHubProps {
  isOpen: boolean;
  onClose: () => void;
}

const PHASES = [
  { id: 1, title: 'Android Setup & UI', status: 'Ready', desc: 'Material 3 & Jetpack Compose 3D Orb' },
  { id: 2, title: 'Firebase & Auth', status: 'Ready', desc: 'Firestore rules & users/{userId} schema' },
  { id: 3, title: 'Gemini 3.8 Flash AI', status: 'Ready', desc: 'Secure backend proxy & prompt engine' },
  { id: 4, title: 'Speech & TTS', status: 'Ready', desc: 'Android SpeechRecognizer & TextToSpeech' },
  { id: 5, title: 'Voice-to-Voice Loop', status: 'Ready', desc: 'Continuous listening & interrupt support' },
  { id: 6, title: 'Multi-Language Engine', status: 'Ready', desc: 'Hindi, Bhojpuri, Sanskrit, 20+ languages' },
  { id: 7, title: 'Android Action System', status: 'Ready', desc: 'Calls, SMS, WhatsApp, Alarms, YouTube' },
  { id: 8, title: 'Memory System', status: 'Ready', desc: 'Persistent context & preferences' },
  { id: 9, title: 'Testing & Hardening', status: 'Ready', desc: 'Permissions & background services' },
  { id: 10, title: 'Signed APK & Release', status: 'Ready', desc: 'Keystore signing & Play Store AAB' },
];

export const AndroidExportHub: React.FC<AndroidExportHubProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    // Trigger confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignored
    }

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);

    // Download combined bundle
    const combined = ANDROID_PROJECT_FILES.map(
      (f) => `// ==========================================\n// FILE: ${f.path}\n// ==========================================\n\n${f.content}`
    ).join('\n\n\n');

    const blob = new Blob([combined], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MADHURI_AI_FULL_ANDROID_PROJECT_BUNDLE.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-[#090d1c] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Smartphone size={22} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                Android Studio Native Source Code Hub
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Phases 1-10 Complete
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Full production Kotlin, Jetpack Compose, Manifest, Services & Gradle files for Madhuri AI
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportAll}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-950/50 transition-all active:scale-95"
            >
              <Download size={14} />
              <span>{downloadSuccess ? 'Downloaded!' : 'Export All Project Files'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Phase Progress Dashboard Bar */}
        <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="font-semibold text-slate-400 whitespace-nowrap">Development Lifecycle:</span>
          {PHASES.map((p) => (
            <div
              key={p.id}
              className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center space-x-1 whitespace-nowrap text-slate-300"
              title={`${p.title}: ${p.desc}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>P{p.id}: {p.title}</span>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-72 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col">
            <div className="p-3 border-b border-slate-800/80 text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
              <Layers size={14} className="text-cyan-400" />
              <span>Project Structure (app/)</span>
            </div>

            <div className="p-2 space-y-1 overflow-y-auto flex-1 text-xs">
              {ANDROID_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                const fileName = file.path.split('/').pop();
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center space-x-2 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <FileCode size={15} className={isSelected ? 'text-cyan-400' : 'text-slate-500'} />
                    <div className="truncate flex-1">
                      <div className="truncate font-mono">{fileName}</div>
                      <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-[#070b18] overflow-hidden">
            {/* Viewer Toolbar */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-900/40">
              <div className="flex items-center space-x-2 truncate">
                <span className="font-mono text-cyan-300 font-semibold">{selectedFile.path}</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">• {selectedFile.description}</span>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={handleDownloadFile}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-slate-300 bg-[#050712]">
              <pre className="whitespace-pre">{selectedFile.content}</pre>
            </div>
          </div>
        </div>

        {/* Footer Quick Instructions */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Terminal size={14} className="text-cyan-400" />
            <span>Ready to compile in Android Studio 2024.2+ (Hedgehog/Ladybug) with JDK 17</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
};
