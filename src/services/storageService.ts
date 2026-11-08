import { ChatMessage, MemoryItem, UserSettings, PhoneSimulatorState } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'madhuri_settings_v2',
  MESSAGES: 'madhuri_messages_v2',
  MEMORIES: 'madhuri_memories_v2',
  PHONE_STATE: 'madhuri_phone_state_v2',
};

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Siyaram',
  inputLanguage: 'auto',
  responseLanguage: 'auto',
  voiceGender: 'female',
  speechRate: 1.0,
  speechPitch: 1.05,
  autoListen: true, // Continuous voice conversation by default
  memoryEnabled: true,
  hapticFeedback: true,
  soundEffects: true,
  apiKey: '',
  personality: 'friendly',
  theme: 'futuristic',
};

const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    content: 'User prefers respectful and warm conversational replies (आप / नमस्ते).',
    category: 'preference',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'mem-2',
    content: 'User frequently works with Android Jetpack Compose, Kotlin, and modern Web applications.',
    category: 'work',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'mem-3',
    content: 'Enjoys morning alarms at 07:00 AM and listening to Arijit Singh on YouTube.',
    category: 'favorite',
    createdAt: Date.now() - 86400000,
  },
];

export const DEFAULT_PHONE_STATE: PhoneSimulatorState = {
  volume: 75,
  wifiEnabled: true,
  bluetoothEnabled: true,
  activeCall: null,
  alarms: [
    { id: 'alarm-1', time: '07:00 AM', label: 'Morning Awakening', enabled: true },
    { id: 'alarm-2', time: '09:30 AM', label: 'Daily Standup Call', enabled: false },
  ],
  recentApp: null,
};

export const storageService = {
  getSettings(): UserSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Error reading settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Error saving settings to localStorage', e);
    }
  },

  getMessages(): ChatMessage[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading messages from localStorage', e);
    }
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `नमस्ते! मैं माधुरी हूँ—आपकी व्यक्तिगत AI साथी। (Hello! I am Madhuri, your personal AI voice companion).
मैं आपकी आवाज़ सुन सकती हूँ, बहुभाषी बातचीत कर सकती हूँ, और फोन के काम (कॉल, व्हाट्सऐप, अलार्म, यू-ट्यूब, कोडिंग) संभाल सकती हूँ।
माइक्रोफोन पर टैप करें या 'मॉम को कॉल करो' या 'YouTube खोलो' बोलें!`,
        timestamp: Date.now(),
      },
    ];
  },

  saveMessages(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages.slice(-50)));
    } catch (e) {
      console.warn('Error saving messages', e);
    }
  },

  getMemories(): MemoryItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading memories', e);
    }
    return DEFAULT_MEMORIES;
  },

  saveMemories(memories: MemoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    } catch (e) {
      console.warn('Error saving memories', e);
    }
  },

  getPhoneState(): PhoneSimulatorState {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PHONE_STATE);
      if (saved) return { ...DEFAULT_PHONE_STATE, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Error reading phone state', e);
    }
    return DEFAULT_PHONE_STATE;
  },

  savePhoneState(state: PhoneSimulatorState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PHONE_STATE, JSON.stringify(state));
    } catch (e) {
      console.warn('Error saving phone state', e);
    }
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.MESSAGES);
      localStorage.removeItem(STORAGE_KEYS.MEMORIES);
      localStorage.removeItem(STORAGE_KEYS.PHONE_STATE);
    } catch (e) {
      console.warn('Error clearing data', e);
    }
  },
};
