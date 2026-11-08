import React, { useState } from 'react';
import {
  Code2,
  Play,
  Copy,
  Check,
  Download,
  Sparkles,
  Smartphone,
  Globe,
  Database,
  Cpu,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { sendChatMessage } from '../services/geminiClient';
import { UserSettings } from '../types';

interface CodingStudioViewProps {
  settings: UserSettings;
}

const TEMPLATES = [
  {
    id: 'android-compose',
    title: 'Jetpack Compose Voice UI',
    type: 'kotlin',
    prompt: 'Write a complete Jetpack Compose Material 3 screen in Kotlin for an AI voice assistant with an animated pulsating microphone orb, conversation card, and voice wave bars.',
  },
  {
    id: 'web-landing',
    title: 'Madhuri AI Website Hero',
    type: 'html',
    prompt: 'Generate a complete, modern single-file HTML website with Tailwind CSS for Madhuri AI Voice Assistant with dark futuristic glassmorphism, floating badge, hero headline, and interactive voice preview card.',
  },
  {
    id: 'firebase-service',
    title: 'Firebase Auth & Firestore in Kotlin',
    type: 'kotlin',
    prompt: 'Provide a production-ready Kotlin FirebaseManager class for Android with Firebase Auth sign-in, Firestore users/{userId}/chats collection reads/writes, and proper coroutine error handling.',
  },
  {
    id: 'speech-service',
    title: 'Android SpeechRecognizer Service',
    type: 'kotlin',
    prompt: 'Create a robust Android SpeechRecognizer and TextToSpeech wrapper service in Kotlin with support for Hindi & English languages, silence detection, and audio volume callback.',
  },
];

export const CodingStudioView: React.FC<CodingStudioViewProps> = ({ settings }) => {
  const [prompt, setPrompt] = useState('Create a modern Android Jetpack Compose voice wave visualizer with Kotlin');
  const [language, setLanguage] = useState<'kotlin' | 'html' | 'javascript' | 'java'>('kotlin');
  const [codeOutput, setCodeOutput] = useState(`// Madhuri AI Coding Assistant - Ready to generate code!
// Click one of the templates above or describe your Android/Web task.

package com.madhuri.ai.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun MadhuriVoiceWave(
    isListening: Boolean,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "wave")
    val waveScale by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.3f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    Canvas(modifier = modifier.size(120.dp)) {
        drawCircle(
            color = if (isListening) Color(0xFF00E5FF) else Color(0xFF9333EA),
            radius = size.minDimension / 2 * if (isListening) waveScale else 1.0f
        )
    }
}`);
  const [explanation, setExplanation] = useState(
    'This Jetpack Compose component renders an organic pulsating voice wave that animates dynamically when listening.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (targetPrompt = prompt, targetLang = language) => {
    if (!targetPrompt.trim() || isGenerating) return;
    setIsGenerating(true);

    const fullPrompt = `You are the MADHURI AI Coding Assistant. Generate complete, production-ready, clean ${targetLang} code for:
${targetPrompt}

Rules:
1. Provide the complete code inside a standard markdown code block: \`\`\`${targetLang} ... \`\`\`
2. Include short explanations of architecture, dependencies and setup steps.
3. If HTML, make it self-contained with Tailwind CSS via CDN so it can run immediately.`;

    try {
      const res = await sendChatMessage({
        message: fullPrompt,
        history: [],
        settings,
        memories: [],
      });

      const reply = res.cleanText;
      const codeMatch = reply.match(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/);

      if (codeMatch && codeMatch[1]) {
        setCodeOutput(codeMatch[1].trim());
        const cleanedExp = reply.replace(/```[\s\S]*?```/g, '').trim();
        setExplanation(cleanedExp || 'Code generated successfully with production best practices.');
      } else {
        setCodeOutput(reply);
        setExplanation('Code generated.');
      }
    } catch (e: any) {
      setExplanation('Failed to generate code: ' + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = language === 'html' ? 'html' : language === 'kotlin' ? 'kt' : language === 'java' ? 'java' : 'js';
    const blob = new Blob([codeOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Madhuri_${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Code2 size={24} className="text-cyan-400" />
            AI Coding & Website Creator
          </h1>
          <p className="text-xs text-slate-400">
            Generate full Android Jetpack Compose code, HTML/CSS websites, Firebase architecture & Kotlin services
          </p>
        </div>

        {/* Templates pill bar */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => {
                setPrompt(tmpl.prompt);
                setLanguage(tmpl.type as any);
                handleGenerate(tmpl.prompt, tmpl.type as any);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 whitespace-nowrap transition-all"
            >
              {tmpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input Box */}
      <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-400 font-semibold focus:outline-none"
        >
          <option value="kotlin">Kotlin (Compose/Android)</option>
          <option value="html">HTML5 + Tailwind CSS</option>
          <option value="java">Java (Android Native)</option>
          <option value="javascript">React / JavaScript</option>
        </select>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what Android feature or website to create..."
          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />

        <button
          onClick={() => handleGenerate()}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-bold text-slate-950 text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-950/40 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Generate Code</span>
            </>
          )}
        </button>
      </div>

      {/* Editor & Preview Split Stage */}
      <div className="flex-1 flex flex-col bg-[#080c1a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Stage Toolbar */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'code' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
              }`}
            >
              Source Code ({language.toUpperCase()})
            </button>
            {language === 'html' && (
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center space-x-1 ${
                  activeTab === 'preview' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400'
                }`}
              >
                <Play size={12} />
                <span>Live Interactive Sandbox</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1"
            >
              <Download size={12} />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Stage Viewport */}
        <div className="flex-1 overflow-auto p-4 bg-[#050711]">
          {activeTab === 'code' ? (
            <div className="font-mono text-xs text-slate-300 leading-relaxed">
              <pre className="whitespace-pre">{codeOutput}</pre>
            </div>
          ) : (
            <div className="w-full h-full min-h-[400px] bg-white rounded-xl overflow-hidden shadow-inner">
              <iframe
                title="Madhuri Website Sandbox"
                srcDoc={codeOutput}
                className="w-full h-full min-h-[400px] border-none"
                sandbox="allow-scripts"
              />
            </div>
          )}
        </div>

        {/* Explanation Footer */}
        {explanation && (
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-300 leading-relaxed max-h-28 overflow-y-auto">
            <div className="font-semibold text-cyan-400 mb-0.5 flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>Madhuri Architecture & Installation Guide:</span>
            </div>
            <div>{explanation}</div>
          </div>
        )}
      </div>
    </div>
  );
};
