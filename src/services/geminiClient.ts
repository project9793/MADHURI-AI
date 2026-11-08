import { AndroidAction, ChatMessage, MemoryItem, UserSettings } from '../types';

export interface ChatResponse {
  cleanText: string;
  rawText: string;
  action?: AndroidAction;
  model: string;
  error?: string;
  hindiError?: string;
}

export function extractActionFromText(text: string): { cleanText: string; action?: AndroidAction } {
  const actionRegex = /<<<ACTION:(.*?)>>>/s;
  const match = text.match(actionRegex);

  if (!match) {
    return { cleanText: text.trim() };
  }

  const rawJson = match[1].trim();
  const cleanText = text.replace(actionRegex, '').trim();

  try {
    const action = JSON.parse(rawJson) as AndroidAction;
    return { cleanText, action };
  } catch (e) {
    console.error('Failed to parse action JSON:', rawJson, e);
    return { cleanText };
  }
}

export async function sendChatMessage(params: {
  message: string;
  history: ChatMessage[];
  settings: UserSettings;
  memories: MemoryItem[];
}): Promise<ChatResponse> {
  const { message, history, settings, memories } = params;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        inputLanguage: settings.inputLanguage,
        responseLanguage: settings.responseLanguage,
        apiKey: settings.apiKey || undefined,
        memories: settings.memoryEnabled ? memories : [],
        personality: settings.personality,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    const rawReply = data.reply || '';
    const { cleanText, action } = extractActionFromText(rawReply);

    return {
      cleanText,
      rawText: rawReply,
      action,
      model: data.model || 'gemini-3.8-flash',
    };
  } catch (error: any) {
    console.error('sendChatMessage error:', error);
    return {
      cleanText: 'क्षमा करें, आपके अनुरोध को पूरा करने में एक त्रुटि हुई। कृपया नेटवर्क जांचें या पुनः प्रयास करें। (Sorry, an error occurred while processing your request. Please check connection and try again.)',
      rawText: '',
      model: 'error',
      error: error.message || 'Connection failure',
      hindiError: 'नेटवर्क कनेक्शन अनुपलब्ध है।',
    };
  }
}

export async function testGeminiApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch('/api/test-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    const data = await res.json();
    return {
      valid: data.valid ?? false,
      error: data.error,
    };
  } catch (e: any) {
    return { valid: false, error: e?.message || 'Network error' };
  }
}

export async function checkServerStatus(): Promise<{ hasServerKey: boolean; status: string; model: string }> {
  try {
    const res = await fetch('/api/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Status check failed:', e);
  }
  return { hasServerKey: false, status: 'offline', model: 'gemini-3.8-flash' };
}
