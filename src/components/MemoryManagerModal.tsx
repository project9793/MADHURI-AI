import React, { useState } from 'react';
import {
  Brain,
  Search,
  Plus,
  Trash2,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  X,
  Sparkles,
  Database,
  Lock,
} from 'lucide-react';
import { MemoryItem, UserSettings } from '../types';

interface MemoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  onAddMemory: (content: string, category: MemoryItem['category']) => void;
  onDeleteMemory: (id: string) => void;
  onClearAll: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

export const MemoryManagerModal: React.FC<MemoryManagerModalProps> = ({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearAll,
  settings,
  onUpdateSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryItem['category']>('preference');
  const [activeTab, setActiveTab] = useState<'memories' | 'firebase'>('memories');

  if (!isOpen) return null;

  const filteredMemories = memories.filter((m) =>
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    onAddMemory(newContent.trim(), newCategory);
    setNewContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#090e1f] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-indigo-950/20 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Brain size={22} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                Madhuri Memory System
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                  v2.5
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Personal context & preferences remembered with your consent
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Memory Toggle Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-slate-300 font-medium">Memory Persistence:</span>
            <span className={settings.memoryEnabled ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
              {settings.memoryEnabled ? 'Enabled (Active in Prompts)' : 'Disabled'}
            </span>
          </div>

          <button
            onClick={() => onUpdateSettings({ ...settings, memoryEnabled: !settings.memoryEnabled })}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {settings.memoryEnabled ? (
              <>
                <ToggleRight size={18} className="text-emerald-400" />
                <span>Disable</span>
              </>
            ) : (
              <>
                <ToggleLeft size={18} className="text-slate-500" />
                <span>Enable</span>
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-4 text-xs">
          <button
            onClick={() => setActiveTab('memories')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'memories' ? 'border-purple-400 text-purple-300' : 'border-transparent text-slate-400'
            }`}
          >
            Stored Memory Notes ({memories.length})
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'firebase' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400'
            }`}
          >
            <Database size={13} />
            <span>Firebase Rules & Schema</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'memories' ? (
            <>
              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stored memory..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Add Memory Form */}
              <form onSubmit={handleAdd} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-400" />
                    Teach Madhuri a New Fact or Preference
                  </span>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-purple-300 focus:outline-none"
                  >
                    <option value="preference">Preference</option>
                    <option value="personal">Personal Fact</option>
                    <option value="work">Work / Coding</option>
                    <option value="favorite">Favorite</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="e.g. I live in Mumbai and love drinking masala chai in mornings..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-md shadow-purple-950"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Memory List */}
              <div className="space-y-2">
                {filteredMemories.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No memories found. Add one above or converse with Madhuri to build context!
                  </div>
                ) : (
                  filteredMemories.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start justify-between gap-3 group hover:border-purple-500/40 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="text-xs text-slate-200 leading-relaxed">{m.content}</div>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                          <span className="capitalize px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono">
                            {m.category}
                          </span>
                          <span>•</span>
                          <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteMemory(m.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete memory"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* Firebase Architecture Tab */
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-center gap-2">
                <Lock size={16} className="text-amber-400 flex-shrink-0" />
                <span>
                  All memory documents are stored under <code>users/{'{userId}'}/memory</code> with strict RBAC security
                  rules preventing cross-user leakage.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                <pre>{`// Firestore Data Model
users/{userId}/memory/{memoryId}
{
  "content": "User prefers Hindi responses in morning",
  "category": "preference",
  "createdAt": 1740000000000
}

// Security Rule
match /users/{userId}/memory/{memoryId} {
  allow read, write: if request.auth != null 
                     && request.auth.uid == userId;
}`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 md:p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete all personal memory data? This cannot be undone.')) {
                onClearAll();
              }
            }}
            className="text-red-400 hover:text-red-300 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} />
            <span>Clear All Personal Data</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
