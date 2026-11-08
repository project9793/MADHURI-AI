import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  MessageSquare,
  Clock,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Bluetooth,
  Youtube,
  Camera,
  Compass,
  Settings,
  X,
  Check,
  AlertTriangle,
  Play,
  Share2,
  ExternalLink,
  Search,
  Bell,
  Mic,
  Maximize2,
} from 'lucide-react';
import { AndroidAction, PhoneSimulatorState } from '../types';

interface PhoneControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionQueue: AndroidAction | null;
  onActionComplete: () => void;
  phoneState: PhoneSimulatorState;
  onUpdatePhoneState: (state: PhoneSimulatorState) => void;
}

export const PhoneControlModal: React.FC<PhoneControlModalProps> = ({
  isOpen,
  onClose,
  actionQueue,
  onActionComplete,
  phoneState,
  onUpdatePhoneState,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'dialer' | 'whatsapp' | 'alarms' | 'youtube' | 'camera' | 'settings'>('overview');
  
  // Dialer state
  const [dialNumber, setDialNumber] = useState('');
  const [callDuration, setCallDuration] = useState(0);

  // WhatsApp state
  const [waRecipient, setWaRecipient] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [waSentSuccess, setWaSentSuccess] = useState(false);

  // Alarm state
  const [alarmTime, setAlarmTime] = useState('07:30');
  const [alarmLabel, setAlarmLabel] = useState('Morning Wakeup');

  // YouTube search query
  const [ytQuery, setYtQuery] = useState('Arijit Singh Best Songs 2026');

  // Camera stream
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Handle incoming action queue automatically
  useEffect(() => {
    if (!actionQueue) return;

    if (actionQueue.type === 'MAKE_CALL') {
      setActiveTab('dialer');
      setDialNumber(actionQueue.phoneNumber || '+91 98765 43210');
    } else if (actionQueue.type === 'SEND_WHATSAPP') {
      setActiveTab('whatsapp');
      setWaRecipient(actionQueue.recipient || 'Maa');
      setWaMessage(actionQueue.message || 'नमस्ते, मैं माधुरी AI द्वारा भेजा गया संदेश हूँ।');
    } else if (actionQueue.type === 'SET_ALARM') {
      setActiveTab('alarms');
      if (actionQueue.time) setAlarmTime(actionQueue.time);
      if (actionQueue.label) setAlarmLabel(actionQueue.label);
    } else if (actionQueue.type === 'SEARCH_YOUTUBE') {
      setActiveTab('youtube');
      if (actionQueue.query) setYtQuery(decodeURIComponent(actionQueue.query));
    } else if (actionQueue.type === 'OPEN_APP') {
      const app = (actionQueue.appName || '').toLowerCase();
      if (app.includes('youtube')) setActiveTab('youtube');
      else if (app.includes('camera')) setActiveTab('camera');
      else if (app.includes('whatsapp')) setActiveTab('whatsapp');
      else if (app.includes('settings')) setActiveTab('settings');
      else setActiveTab('overview');
    } else if (actionQueue.type === 'ADJUST_VOLUME') {
      const newVol = actionQueue.level !== undefined ? actionQueue.level : Math.min(100, phoneState.volume + 15);
      onUpdatePhoneState({ ...phoneState, volume: newVol });
    } else if (actionQueue.type === 'TOGGLE_WIFI') {
      onUpdatePhoneState({ ...phoneState, wifiEnabled: actionQueue.enable ?? !phoneState.wifiEnabled });
    } else if (actionQueue.type === 'TOGGLE_BLUETOOTH') {
      onUpdatePhoneState({ ...phoneState, bluetoothEnabled: actionQueue.enable ?? !phoneState.bluetoothEnabled });
    }
  }, [actionQueue]);

  // Call timer simulation
  useEffect(() => {
    let timer: any;
    if (phoneState.activeCall && phoneState.activeCall.status === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [phoneState.activeCall]);

  const handleStartCall = (name: string, number: string) => {
    onUpdatePhoneState({
      ...phoneState,
      activeCall: {
        contactName: name || 'Contact',
        phoneNumber: number || dialNumber || '+91 98765 43210',
        status: 'ringing',
        durationSeconds: 0,
      },
    });

    // Ring for 2.5 seconds, then connect automatically
    setTimeout(() => {
      onUpdatePhoneState({
        ...phoneState,
        activeCall: {
          contactName: name || 'Contact',
          phoneNumber: number || dialNumber || '+91 98765 43210',
          status: 'connected',
          durationSeconds: 0,
        },
      });
    }, 2500);
  };

  const handleEndCall = () => {
    onUpdatePhoneState({
      ...phoneState,
      activeCall: null,
    });
    setCallDuration(0);
  };

  const handleSendWhatsApp = () => {
    setWaSentSuccess(true);
    setTimeout(() => {
      setWaSentSuccess(false);
      onActionComplete();
    }, 2500);
  };

  const handleAddAlarm = () => {
    const newAlarm = {
      id: `alarm-${Date.now()}`,
      time: alarmTime,
      label: alarmLabel,
      enabled: true,
    };
    onUpdatePhoneState({
      ...phoneState,
      alarms: [newAlarm, ...phoneState.alarms],
    });
    onActionComplete();
  };

  const toggleAlarm = (id: string) => {
    onUpdatePhoneState({
      ...phoneState,
      alarms: phoneState.alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    });
  };

  const toggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e) {
        alert('Camera access denied or unavailable. Simulating camera mode.');
        setCameraActive(true);
      }
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setCapturedPhoto(canvas.toDataURL('image/jpeg'));
      }
    } else {
      setCapturedPhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col md:flex-row bg-[#080d1e] border border-cyan-500/20 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left Side: Mobile Phone Simulator Frame */}
        <div className="w-full md:w-96 flex-shrink-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black p-4 flex flex-col border-b md:border-b-0 md:border-r border-slate-800">
          
          {/* Phone Bezel Top: Speaker & Camera punch-hole */}
          <div className="flex items-center justify-between px-3 py-1 mb-3 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">10:04</span>
            <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div className="flex items-center space-x-1.5">
              {phoneState.wifiEnabled ? <Wifi size={13} className="text-cyan-400" /> : <WifiOff size={13} className="text-slate-600" />}
              {phoneState.bluetoothEnabled && <Bluetooth size={13} className="text-indigo-400" />}
              <span className="text-[10px] bg-slate-800 px-1 rounded text-cyan-400 font-mono">5G</span>
              <span className="text-[10px]">89%</span>
            </div>
          </div>

          {/* Phone Display Area */}
          <div className="relative flex-1 bg-gradient-to-b from-[#0d1527] to-[#060a14] rounded-2xl border border-slate-800/80 p-3 overflow-y-auto min-h-[380px] flex flex-col justify-between">
            
            {/* If Active Call is ongoing */}
            {phoneState.activeCall ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-gradient-to-b from-slate-900/90 to-purple-950/80 rounded-xl border border-purple-500/30 animate-pulse-slow">
                <div className="w-20 h-20 rounded-full bg-purple-600/30 border-2 border-purple-400 flex items-center justify-center mb-4">
                  <PhoneCall size={36} className="text-purple-300 animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{phoneState.activeCall.contactName}</h3>
                <p className="text-sm font-mono text-cyan-400 mb-2">{phoneState.activeCall.phoneNumber}</p>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 mb-6">
                  {phoneState.activeCall.status === 'ringing'
                    ? '📞 Ringing...'
                    : `In Call: ${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`}
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleEndCall}
                    className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg shadow-red-900/40 text-white transition-transform active:scale-95"
                  >
                    <PhoneOff size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Simulator Home Quick Status */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-slate-300">Android 15 Virtual Bridge</span>
                  </div>
                  <span className="text-cyan-400 font-mono">Madhuri AI OS</span>
                </div>

                {/* Device Quick Toggles Bar */}
                <div className="grid grid-cols-4 gap-2 my-3">
                  <button
                    onClick={() => onUpdatePhoneState({ ...phoneState, wifiEnabled: !phoneState.wifiEnabled })}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center text-xs transition-all ${
                      phoneState.wifiEnabled ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800/40 text-slate-500'
                    }`}
                  >
                    {phoneState.wifiEnabled ? <Wifi size={16} /> : <WifiOff size={16} />}
                    <span className="text-[10px] mt-1">Wi-Fi</span>
                  </button>

                  <button
                    onClick={() => onUpdatePhoneState({ ...phoneState, bluetoothEnabled: !phoneState.bluetoothEnabled })}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center text-xs transition-all ${
                      phoneState.bluetoothEnabled ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800/40 text-slate-500'
                    }`}
                  >
                    <Bluetooth size={16} />
                    <span className="text-[10px] mt-1">Bluetooth</span>
                  </button>

                  <button
                    onClick={() => {
                      const newVol = phoneState.volume === 0 ? 70 : 0;
                      onUpdatePhoneState({ ...phoneState, volume: newVol });
                    }}
                    className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex flex-col items-center justify-center text-xs"
                  >
                    {phoneState.volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    <span className="text-[10px] mt-1">{phoneState.volume}%</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('alarms')}
                    className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex flex-col items-center justify-center text-xs"
                  >
                    <Clock size={16} />
                    <span className="text-[10px] mt-1">{phoneState.alarms.filter((a) => a.enabled).length} Alarms</span>
                  </button>
                </div>

                {/* Volume Level Slider */}
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 mb-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5"><Volume2 size={13} className="text-cyan-400" /> Media Volume</span>
                    <span className="font-mono text-cyan-300">{phoneState.volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={phoneState.volume}
                    onChange={(e) => onUpdatePhoneState({ ...phoneState, volume: parseInt(e.target.value, 10) })}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Simulated App Grid */}
                <div className="grid grid-cols-4 gap-2.5 my-2">
                  <button
                    onClick={() => setActiveTab('dialer')}
                    className="flex flex-col items-center p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-transform active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white mb-1 shadow-md shadow-emerald-950">
                      <Phone size={18} />
                    </div>
                    <span className="text-[10px] text-slate-300">Phone</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('whatsapp')}
                    className="flex flex-col items-center p-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 transition-transform active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-1 shadow-md shadow-emerald-950">
                      <MessageSquare size={18} />
                    </div>
                    <span className="text-[10px] text-slate-300">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('youtube')}
                    className="flex flex-col items-center p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-transform active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white mb-1 shadow-md shadow-red-950">
                      <Youtube size={18} />
                    </div>
                    <span className="text-[10px] text-slate-300">YouTube</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('camera')}
                    className="flex flex-col items-center p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-transform active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white mb-1 shadow-md shadow-blue-950">
                      <Camera size={18} />
                    </div>
                    <span className="text-[10px] text-slate-300">Camera</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Android Navigation Bar Pill */}
            <div className="w-24 h-1 bg-slate-600 rounded-full mx-auto mt-3" />
          </div>
        </div>

        {/* Right Side: Interactive Action Workstation & Modals */}
        <div className="flex-1 flex flex-col bg-[#070b17] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Settings size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Android Device Action Engine</h2>
                <p className="text-xs text-slate-400">Controlled by Madhuri AI voice commands & direct interaction</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Action Queue Confirmation Banner if action is waiting */}
          {actionQueue && (
            <div className="m-4 p-3 rounded-2xl bg-gradient-to-r from-purple-900/40 via-cyan-900/40 to-slate-900/60 border border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 animate-bounce" />
                <div>
                  <div className="text-xs font-semibold text-cyan-300">Pending Voice Action: {actionQueue.type}</div>
                  <div className="text-xs text-slate-300">
                    {actionQueue.contactName && `Target: ${actionQueue.contactName} (${actionQueue.phoneNumber})`}
                    {actionQueue.recipient && `WhatsApp to: ${actionQueue.recipient}`}
                    {actionQueue.time && `Alarm: ${actionQueue.time} (${actionQueue.label})`}
                    {actionQueue.query && `YouTube Query: ${actionQueue.query}`}
                  </div>
                </div>
              </div>
              <button
                onClick={onActionComplete}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center space-x-1 shadow-md shadow-cyan-900/30"
              >
                <Check size={14} />
                <span>Confirm & Dismiss</span>
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-slate-800 px-4 space-x-2 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'overview' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('dialer')}
              className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center space-x-1 whitespace-nowrap ${
                activeTab === 'dialer' ? 'border-emerald-400 text-emerald-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Phone size={13} />
              <span>Dialer & Calls</span>
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center space-x-1 whitespace-nowrap ${
                activeTab === 'whatsapp' ? 'border-green-400 text-green-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare size={13} />
              <span>WhatsApp / SMS</span>
            </button>
            <button
              onClick={() => setActiveTab('alarms')}
              className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center space-x-1 whitespace-nowrap ${
                activeTab === 'alarms' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock size={13} />
              <span>Alarms & Timers</span>
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center space-x-1 whitespace-nowrap ${
                activeTab === 'youtube' ? 'border-red-400 text-red-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Youtube size={13} />
              <span>YouTube</span>
            </button>
            <button
              onClick={() => setActiveTab('camera')}
              className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center space-x-1 whitespace-nowrap ${
                activeTab === 'camera' ? 'border-blue-400 text-blue-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera size={13} />
              <span>Camera</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-4 flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800/80 border border-slate-700/60">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    Madhuri Android Intent Bridge Active
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Madhuri AI parses user voice and chat intents into native Android actions using standard Intent APIs.
                    Try saying:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
                      <Phone size={14} className="text-emerald-400 flex-shrink-0" />
                      <span>&ldquo;Call Mom on phone&rdquo;</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
                      <MessageSquare size={14} className="text-green-400 flex-shrink-0" />
                      <span>&ldquo;Send WhatsApp to Rahul: reach in 10 mins&rdquo;</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
                      <Clock size={14} className="text-amber-400 flex-shrink-0" />
                      <span>&ldquo;Set an alarm for 7:00 AM&rdquo;</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
                      <Youtube size={14} className="text-red-400 flex-shrink-0" />
                      <span>&ldquo;Open YouTube and search Arijit Singh&rdquo;</span>
                    </div>
                  </div>
                </div>

                {/* Device Status Cards */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-slate-400 mb-1">Simulated Android OS</div>
                    <div className="font-semibold text-slate-200">Android 15 (API Level 35)</div>
                    <div className="text-[10px] text-cyan-400 mt-1">Package: com.madhuri.ai</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-slate-400 mb-1">Active Audio Engine</div>
                    <div className="font-semibold text-slate-200">Android TextToSpeech + SpeechRecognizer</div>
                    <div className="text-[10px] text-emerald-400 mt-1">Status: READY</div>
                  </div>
                </div>
              </div>
            )}

            {/* Dialer View */}
            {activeTab === 'dialer' && (
              <div className="max-w-md mx-auto space-y-4">
                <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800 text-center">
                  <input
                    type="text"
                    value={dialNumber}
                    onChange={(e) => setDialNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-center text-2xl font-mono font-semibold bg-transparent border-none text-white focus:outline-none"
                  />
                  <div className="text-xs text-slate-400 mt-1">Enter phone number or select quick contact</div>
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => setDialNumber((prev) => prev + digit)}
                      className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-lg font-semibold text-white transition-transform active:scale-95"
                    >
                      {digit}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleStartCall('Direct Call', dialNumber || '+91 98765 43210')}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 text-sm"
                  >
                    <PhoneCall size={18} />
                    <span>Start Phone Call</span>
                  </button>
                  {dialNumber && (
                    <button
                      onClick={() => setDialNumber((prev) => prev.slice(0, -1))}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-sm"
                    >
                      DEL
                    </button>
                  )}
                </div>

                {/* Quick Contacts */}
                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-400 mb-2">Favorite Contacts:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { name: 'Maa (Mom)', num: '+91 98765 43210' },
                      { name: 'Office Team', num: '+91 98111 22334' },
                      { name: 'Emergency 112', num: '112' },
                      { name: 'Doctor Sharma', num: '+91 99887 76655' },
                    ].map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          setDialNumber(c.num);
                          handleStartCall(c.name, c.num);
                        }}
                        className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{c.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.num}</div>
                        </div>
                        <Phone size={13} className="text-emerald-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp View */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Recipient Name or Number:</label>
                    <input
                      type="text"
                      value={waRecipient}
                      onChange={(e) => setWaRecipient(e.target.value)}
                      placeholder="e.g. Maa, Rahul, +91 9876543210"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Message Content:</label>
                    <textarea
                      rows={3}
                      value={waMessage}
                      onChange={(e) => setWaMessage(e.target.value)}
                      placeholder="Type WhatsApp message..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-green-500 resize-none"
                    />
                  </div>

                  {waSentSuccess ? (
                    <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 text-xs flex items-center space-x-2">
                      <Check size={16} />
                      <span>WhatsApp message composed and simulated successfully!</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSendWhatsApp}
                        className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 font-semibold text-white flex items-center justify-center space-x-2 text-xs shadow-md shadow-green-950/40 transition-all active:scale-95"
                      >
                        <MessageSquare size={14} />
                        <span>Confirm & Send WhatsApp Message</span>
                      </button>
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1"
                        title="Open real WhatsApp Web"
                      >
                        <ExternalLink size={14} />
                        <span>Launch App</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Alarms View */}
            {activeTab === 'alarms' && (
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
                  <input
                    type="time"
                    value={alarmTime}
                    onChange={(e) => setAlarmTime(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-sm focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    value={alarmLabel}
                    onChange={(e) => setAlarmLabel(e.target.value)}
                    placeholder="Alarm label..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleAddAlarm}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-semibold text-slate-950 text-xs flex items-center space-x-1 shadow-md shadow-amber-950/40"
                  >
                    <Clock size={13} />
                    <span>Set Alarm</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400">Current Alarms on Device:</div>
                  {phoneState.alarms.map((alarm) => (
                    <div
                      key={alarm.id}
                      className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <Clock size={18} className={alarm.enabled ? 'text-amber-400' : 'text-slate-600'} />
                        <div>
                          <div className={`text-base font-mono font-bold ${alarm.enabled ? 'text-white' : 'text-slate-500'}`}>
                            {alarm.time}
                          </div>
                          <div className="text-xs text-slate-400">{alarm.label}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAlarm(alarm.id)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${
                          alarm.enabled ? 'bg-amber-500' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            alarm.enabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube View */}
            {activeTab === 'youtube' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={ytQuery}
                      onChange={(e) => setYtQuery(e.target.value)}
                      placeholder="Search songs, videos or podcasts..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 font-semibold text-white text-xs flex items-center space-x-1"
                  >
                    <ExternalLink size={13} />
                    <span>Launch YouTube</span>
                  </a>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-300 mb-2">Simulated Video Player:</div>
                  <div className="w-full h-44 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                      <div className="text-xs text-white font-medium truncate">{ytQuery}</div>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                      <Play size={24} className="ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Camera View */}
            {activeTab === 'camera' && (
              <div className="space-y-3 max-w-md mx-auto text-center">
                <div className="relative w-full h-60 rounded-2xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {!cameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/80">
                      <Camera size={40} className="text-blue-400 mb-2" />
                      <div className="text-xs text-slate-300">Camera preview inactive</div>
                    </div>
                  )}
                  {capturedPhoto && (
                    <div className="absolute bottom-2 right-2 w-14 h-14 rounded-lg overflow-hidden border border-white/50 shadow-lg">
                      <img src={capturedPhoto} alt="Snapshot" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={toggleCamera}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                  >
                    {cameraActive ? 'Turn Off Camera' : 'Activate Camera'}
                  </button>
                  {cameraActive && (
                    <button
                      onClick={captureSnapshot}
                      className="w-12 h-12 rounded-full bg-white hover:bg-slate-200 border-4 border-slate-700 flex items-center justify-center shadow-lg transition-transform active:scale-90"
                      title="Take Photo"
                    >
                      <div className="w-4 h-4 rounded-full bg-slate-900" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
