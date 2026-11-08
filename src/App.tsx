import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HomeScreenView } from './components/HomeScreenView';
import { ChatView } from './components/ChatView';
import { CodingStudioView } from './components/CodingStudioView';
import { SettingsView } from './components/SettingsView';
import { PhoneControlModal } from './components/PhoneControlModal';
import { MemoryManagerModal } from './components/MemoryManagerModal';
import { AndroidExportHub } from './components/AndroidExportHub';
import { LiveVoiceExperienceModal } from './components/LiveVoiceExperienceModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { BottomNav } from './components/BottomNav';
import {
  ChatMessage,
  MemoryItem,
  UserSettings,
  PhoneSimulatorState,
  VoiceState,
  AndroidAction,
  SupportedLanguage,
} from './types';
import { storageService, DEFAULT_SETTINGS, DEFAULT_PHONE_STATE } from './services/storageService';
import { speechService } from './services/speechService';
import { sendChatMessage } from './services/geminiClient';
import { SUPPORTED_LANGUAGES } from './data/languages';

export default function App() {
  // Navigation & Modal state
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'coding' | 'settings'>('home');
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isAndroidExportOpen, setIsAndroidExportOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // Core Data
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [phoneState, setPhoneState] = useState<PhoneSimulatorState>(DEFAULT_PHONE_STATE);
  const [actionQueue, setActionQueue] = useState<AndroidAction | null>(null);

  // Voice Interaction state
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [assistantResponse, setAssistantResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Current selected language
  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === settings.inputLanguage) || SUPPORTED_LANGUAGES[0];

  // Initialize data on mount
  useEffect(() => {
    const loadedSettings = storageService.getSettings();
    const loadedMessages = storageService.getMessages();
    const loadedMemories = storageService.getMemories();
    const loadedPhone = storageService.getPhoneState();

    setSettings(loadedSettings);
    setMessages(loadedMessages);
    setMemories(loadedMemories);
    setPhoneState(loadedPhone);

    if (loadedMessages.length > 0) {
      const lastAssis = [...loadedMessages].reverse().find((m) => m.role === 'assistant');
      if (lastAssis) setAssistantResponse(lastAssis.content);
    }
  }, []);

  // Save changes
  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storageService.saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    storageService.saveMemories(memories);
  }, [memories]);

  useEffect(() => {
    storageService.savePhoneState(phoneState);
  }, [phoneState]);

  // Voice Recognition Control
  const handleToggleMic = () => {
    if (speechService.isListening() || voiceState === 'listening') {
      speechService.stopListening();
      setVoiceState('idle');
      setAudioLevel(0);
      return;
    }

    // Stop speaking if currently speaking
    if (speechService.isSpeaking()) {
      speechService.stopSpeaking();
    }

    setVoiceState('listening');
    setUserTranscript('');

    speechService.startListening(settings.inputLanguage, {
      onStart: () => {
        setVoiceState('listening');
      },
      onAudioLevel: (level) => {
        setAudioLevel(level);
      },
      onResult: (transcript, isFinal) => {
        setUserTranscript(transcript);
        if (isFinal && transcript.trim()) {
          speechService.stopListening();
          handleProcessMessage(transcript.trim());
        }
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
        setVoiceState('error');
        setAudioLevel(0);
        setTimeout(() => setVoiceState('idle'), 2000);
      },
      onEnd: () => {
        setAudioLevel(0);
        setVoiceState((prev) => (prev === 'listening' ? 'idle' : prev));
      },
    });
  };

  // Main processing pipeline: User utterance -> Gemini -> Spoken voice + Action
  const handleProcessMessage = async (text: string, mediaUrl?: string) => {
    if (!text && !mediaUrl) return;

    setIsProcessing(true);
    setVoiceState('processing');

    const newUserMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      mediaUrl,
    };

    setMessages((prev) => [...prev, newUserMsg]);

    try {
      const res = await sendChatMessage({
        message: text,
        history: [...messages, newUserMsg],
        settings,
        memories,
      });

      const cleanReply = res.cleanText;
      const detectedAction = res.action;

      const newAssistantMsg: ChatMessage = {
        id: `madhuri-${Date.now()}`,
        role: 'assistant',
        content: cleanReply,
        timestamp: Date.now(),
        action: detectedAction,
      };

      setMessages((prev) => [...prev, newAssistantMsg]);
      setAssistantResponse(cleanReply);

      // If action is detected, queue it and open phone simulator
      if (detectedAction) {
        setActionQueue(detectedAction);
        setIsPhoneModalOpen(true);
      }

      // Speak response aloud
      speechService.speak(cleanReply, {
        lang: settings.responseLanguage !== 'auto' ? settings.responseLanguage : settings.inputLanguage,
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        voiceGender: settings.voiceGender,
        onStart: () => {
          setVoiceState('speaking');
        },
        onEnd: () => {
          setVoiceState('idle');
          // If continuous auto-listen is active, automatically trigger listening
          if (settings.autoListen) {
            setTimeout(() => {
              handleToggleMic();
            }, 600);
          }
        },
        onError: () => {
          setVoiceState('idle');
        },
      });
    } catch (e: any) {
      console.error('Processing error:', e);
      setVoiceState('error');
      setTimeout(() => setVoiceState('idle'), 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
    setVoiceState('interrupted');
    setTimeout(() => setVoiceState('idle'), 1200);
  };

  const handleRepeat = () => {
    if (!assistantResponse) return;
    speechService.speak(assistantResponse, {
      lang: settings.responseLanguage !== 'auto' ? settings.responseLanguage : settings.inputLanguage,
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      voiceGender: settings.voiceGender,
      onStart: () => setVoiceState('speaking'),
      onEnd: () => setVoiceState('idle'),
    });
  };

  const handleClearChat = () => {
    if (confirm('Clear all conversation history with Madhuri?')) {
      const resetMsg: ChatMessage[] = [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: 'नमस्ते! मैं माधुरी AI हूँ। नया सत्र प्रारंभ हो गया है। आप क्या पूछना चाहते हैं?',
          timestamp: Date.now(),
        },
      ];
      setMessages(resetMsg);
      setAssistantResponse(resetMsg[0].content);
    }
  };

  const handleAddMemory = (content: string, category: MemoryItem['category']) => {
    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      content,
      category,
      createdAt: Date.now(),
    };
    setMemories((prev) => [newMem, ...prev]);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearAllData = () => {
    storageService.clearAllData();
    setSettings(DEFAULT_SETTINGS);
    setMessages(storageService.getMessages());
    setMemories([]);
    setPhoneState(DEFAULT_PHONE_STATE);
  };

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Universal Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageClick={() => setIsLanguageModalOpen(true)}
        onOpenPhone={() => setIsPhoneModalOpen(true)}
        onOpenMemory={() => setIsMemoryModalOpen(true)}
        onOpenAndroidExport={() => setIsAndroidExportOpen(true)}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
        activeNav={activeTab}
        onNavChange={setActiveTab}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col overflow-hidden pb-16 lg:pb-0">
        {activeTab === 'home' && (
          <HomeScreenView
            voiceState={voiceState}
            audioLevel={audioLevel}
            userTranscript={userTranscript}
            assistantResponse={assistantResponse}
            onToggleMic={handleToggleMic}
            onStopSpeaking={handleStopSpeaking}
            onRepeat={handleRepeat}
            onNavigate={setActiveTab}
            onOpenPhone={() => setIsPhoneModalOpen(true)}
            onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
            onOpenMemory={() => setIsMemoryModalOpen(true)}
            onOpenAndroidExport={() => setIsAndroidExportOpen(true)}
            currentLanguage={currentLanguage}
            settings={settings}
            onQuickPrompt={(prompt) => {
              setUserTranscript(prompt);
              handleProcessMessage(prompt);
            }}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            onSendMessage={(text, mediaUrl) => handleProcessMessage(text, mediaUrl)}
            onClearChat={handleClearChat}
            onSpeakMessage={(text) => {
              speechService.speak(text, {
                lang: settings.responseLanguage !== 'auto' ? settings.responseLanguage : settings.inputLanguage,
                rate: settings.speechRate,
                pitch: settings.speechPitch,
              });
            }}
            onExecuteAction={(action) => {
              setActionQueue(action);
              setIsPhoneModalOpen(true);
            }}
            isProcessing={isProcessing}
            onStopGeneration={handleStopSpeaking}
            settings={settings}
            isListening={voiceState === 'listening'}
            onToggleMic={handleToggleMic}
          />
        )}

        {activeTab === 'coding' && <CodingStudioView settings={settings} />}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            onOpenMemoryModal={() => setIsMemoryModalOpen(true)}
            onOpenAndroidExport={() => setIsAndroidExportOpen(true)}
            onResetAllData={handleClearAllData}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenPhone={() => setIsPhoneModalOpen(true)}
      />

      {/* Modals */}
      <PhoneControlModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        actionQueue={actionQueue}
        onActionComplete={() => setActionQueue(null)}
        phoneState={phoneState}
        onUpdatePhoneState={setPhoneState}
      />

      <MemoryManagerModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        memories={memories}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
        onClearAll={() => setMemories([])}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      <AndroidExportHub
        isOpen={isAndroidExportOpen}
        onClose={() => setIsAndroidExportOpen(false)}
      />

      <LiveVoiceExperienceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        voiceState={voiceState}
        audioLevel={audioLevel}
        userTranscript={userTranscript}
        assistantResponse={assistantResponse}
        onToggleMic={handleToggleMic}
        onStopSpeaking={handleStopSpeaking}
        onRepeat={handleRepeat}
        autoListen={settings.autoListen}
        onToggleAutoListen={() => setSettings({ ...settings, autoListen: !settings.autoListen })}
        currentLanguage={currentLanguage}
        onSelectLanguageClick={() => setIsLanguageModalOpen(true)}
      />

      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        selectedLanguage={currentLanguage}
        onSelectLanguage={(lang) => setSettings({ ...settings, inputLanguage: lang.code })}
      />
    </div>
  );
}
