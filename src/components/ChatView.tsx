import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  Trash2,
  Phone,
  MessageSquare,
  Clock,
  Youtube,
  Settings,
  Sparkles,
  Square,
  FileCode,
} from 'lucide-react';
import { ChatMessage, UserSettings, AndroidAction } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, mediaUrl?: string) => Promise<void>;
  onClearChat: () => void;
  onSpeakMessage: (text: string) => void;
  onExecuteAction: (action: AndroidAction) => void;
  isProcessing: boolean;
  onStopGeneration?: () => void;
  settings: UserSettings;
  isListening: boolean;
  onToggleMic: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  onSpeakMessage,
  onExecuteAction,
  isProcessing,
  onStopGeneration,
  settings,
  isListening,
  onToggleMic,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isProcessing) return;

    const text = inputText.trim();
    const media = selectedImage || undefined;
    setInputText('');
    setSelectedImage(null);

    await onSendMessage(text, media);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContentWithCode = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const firstLine = lines[0].trim();
        const hasLang = !firstLine.includes(' ') && firstLine.length > 0;
        const codeLang = hasLang ? firstLine : 'code';
        const codeBody = hasLang ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div key={index} className="my-2 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden text-xs font-mono">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-cyan-400">
              <span className="flex items-center gap-1">
                <FileCode size={12} />
                <span>{codeLang.toUpperCase()}</span>
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(codeBody)}
                className="text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Copy size={11} />
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-slate-300 whitespace-pre leading-relaxed">{codeBody}</pre>
          </div>
        );
      }

      // Regular text with bold / italics
      return (
        <span key={index} className="whitespace-pre-wrap leading-relaxed">
          {part}
        </span>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050711] overflow-hidden max-w-5xl mx-auto w-full">
      {/* Top Header */}
      <div className="p-3 md:p-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-900/30">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              Madhuri AI Chat
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                Gemini 3.8 Flash
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Multilingual Voice & Text Assistant with Android Device Control
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isProcessing && onStopGeneration && (
            <button
              onClick={onStopGeneration}
              className="px-2.5 py-1 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs flex items-center space-x-1"
            >
              <Square size={12} />
              <span>Stop</span>
            </button>
          )}

          <button
            onClick={onClearChat}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-xl transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900/80 border border-slate-800/80 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* User Attached Image */}
                {msg.mediaUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden max-h-60 border border-white/10">
                    <img src={msg.mediaUrl} alt="Attached" className="w-full object-cover" />
                  </div>
                )}

                {/* Body Content */}
                <div className="text-xs md:text-sm leading-relaxed">
                  {renderContentWithCode(msg.content)}
                </div>

                {/* Embedded Action Card if action was detected */}
                {msg.action && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 text-xs">
                      {msg.action.type === 'MAKE_CALL' && <Phone size={15} className="text-emerald-400 flex-shrink-0" />}
                      {msg.action.type === 'SEND_WHATSAPP' && <MessageSquare size={15} className="text-green-400 flex-shrink-0" />}
                      {msg.action.type === 'SET_ALARM' && <Clock size={15} className="text-amber-400 flex-shrink-0" />}
                      {msg.action.type === 'SEARCH_YOUTUBE' && <Youtube size={15} className="text-red-400 flex-shrink-0" />}
                      <div>
                        <div className="font-semibold text-cyan-300">Action: {msg.action.type}</div>
                        <div className="text-[11px] text-slate-400">
                          {msg.action.contactName && `Call: ${msg.action.contactName} (${msg.action.phoneNumber})`}
                          {msg.action.recipient && `WhatsApp: ${msg.action.recipient}`}
                          {msg.action.time && `Alarm: ${msg.action.time}`}
                          {msg.action.query && `Search: ${msg.action.query}`}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => msg.action && onExecuteAction(msg.action)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs whitespace-nowrap shadow-md shadow-cyan-950/40"
                    >
                      Execute on Phone
                    </button>
                  </div>
                )}

                {/* Message Footer Toolbar */}
                <div className="mt-2.5 pt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                  {!isUser && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSpeakMessage(msg.content)}
                        className="hover:text-cyan-400 transition-colors"
                        title="Read aloud"
                      >
                        <Volume2 size={13} />
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-cyan-400 transition-colors"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl rounded-tl-none p-4 max-w-[70%] flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              <div className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-bounce" />
              <span className="text-xs text-slate-400">Madhuri AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-4 py-1.5 flex gap-2 overflow-x-auto text-[11px] bg-slate-950/40">
        {[
          'मॉम को फोन मिलाओ',
          'YouTube पर अरिजीत सिंह के गाने चलाओ',
          'कल सुबह 7 बजे का अलार्म लगाओ',
          'Create a Kotlin Android ViewModel',
          'Bhojpuri me ek badhiya gaana batawa',
          'Explain Firebase Firestore security rules',
        ].map((chip) => (
          <button
            key={chip}
            onClick={() => onSendMessage(chip)}
            className="px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 whitespace-nowrap transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 md:p-4 bg-slate-950/80 border-t border-slate-800">
        {selectedImage && (
          <div className="relative inline-block mb-2 rounded-xl overflow-hidden border border-cyan-400/40">
            <img src={selectedImage} alt="Upload preview" className="w-20 h-20 object-cover" />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {/* Image Attach Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Attach image or screenshot for AI understanding"
          >
            <ImageIcon size={18} />
          </button>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={onToggleMic}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-900/40 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isListening ? 'Stop recording voice' : 'Speak voice note'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : 'Message Madhuri AI in Hindi, English, Bhojpuri, or any language...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedImage) || isProcessing}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-950/40 transition-all active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
