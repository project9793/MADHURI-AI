export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'interrupted' | 'error';

export interface SupportedLanguage {
  code: string; // e.g., 'hi-IN', 'en-US', 'bho-IN', 'sa-IN'
  name: string; // 'Hindi'
  nativeName: string; // 'हिन्दी'
  flag: string; // '🇮🇳'
  promptHint: string; // 'नमस्ते माधुरी, आज का मौसम कैसा है?'
}

export type AndroidActionType =
  | 'OPEN_APP'
  | 'MAKE_CALL'
  | 'SEND_WHATSAPP'
  | 'SEND_SMS'
  | 'SET_ALARM'
  | 'SET_REMINDER'
  | 'ADJUST_VOLUME'
  | 'TOGGLE_WIFI'
  | 'TOGGLE_BLUETOOTH'
  | 'SEARCH_YOUTUBE'
  | 'SEARCH_GOOGLE'
  | 'GENERATE_CODE';

export interface AndroidAction {
  type: AndroidActionType;
  appName?: string;
  packageName?: string;
  contactName?: string;
  phoneNumber?: string;
  recipient?: string;
  message?: string;
  time?: string;
  label?: string;
  title?: string;
  level?: number;
  mode?: 'up' | 'down' | 'set';
  enable?: boolean;
  query?: string;
  language?: string;
  requiresConfirmation?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  action?: AndroidAction;
  actionExecuted?: boolean;
  actionStatus?: 'pending' | 'confirmed' | 'cancelled' | 'executed';
  mediaUrl?: string;
  language?: string;
}

export interface MemoryItem {
  id: string;
  content: string;
  category: 'preference' | 'personal' | 'work' | 'favorite';
  createdAt: number;
}

export interface UserSettings {
  userName: string;
  inputLanguage: string;
  responseLanguage: string;
  voiceGender: 'female' | 'male';
  speechRate: number;
  speechPitch: number;
  autoListen: boolean; // Continuous conversational mode
  memoryEnabled: boolean;
  hapticFeedback: boolean;
  soundEffects: boolean;
  apiKey: string;
  personality: 'friendly' | 'professional' | 'concise' | 'humorous';
  theme: 'dark' | 'futuristic' | 'light';
}

export interface PhoneSimulatorState {
  volume: number; // 0-100
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  activeCall: {
    contactName: string;
    phoneNumber: string;
    status: 'ringing' | 'connected' | 'ended';
    durationSeconds: number;
  } | null;
  alarms: Array<{
    id: string;
    time: string;
    label: string;
    enabled: boolean;
  }>;
  recentApp: string | null;
}
