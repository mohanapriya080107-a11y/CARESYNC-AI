import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Mic, MicOff, Send, Sparkles } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const VoiceAssistant: React.FC = () => {
  const { handleSendMessage } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: 'CareSync Voice Assistant initialized. Tap the mic or type to command.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = { sender: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const aiResponse = await handleSendMessage(textToSend);
    const aiMsg: ChatMessage = { sender: 'ai', text: aiResponse, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
  };

  const toggleVoiceListen = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate speech-to-text input after 3 seconds
      setTimeout(() => {
        setIsListening(false);
        handleSend("Who is the highest-risk patient?");
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

  const quickPrompts = [
    "Who is the highest-risk patient?",
    "Why is patient P101 critical?",
    "What are the warnings in ICU?",
    "What is Robert Carter SpO2?"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Voice Assistant Center Column */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 flex-1 flex flex-col min-h-[450px]">
          <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-4">Voice Assistant Clinical Copilot</h2>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[350px]">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[80%] text-xs ${
                  m.sender === 'user'
                    ? 'bg-clinical-accent text-white rounded-tr-none'
                    : 'bg-slate-950/70 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block text-right">
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Waveform Visualization when listening */}
          {isListening && (
            <div className="flex items-center justify-center gap-1.5 py-4">
              <span className="w-1 bg-medical-accent h-6 rounded animate-pulse"></span>
              <span className="w-1 bg-medical-accent h-10 rounded animate-pulse delay-75"></span>
              <span className="w-1 bg-medical-accent h-14 rounded animate-pulse delay-100"></span>
              <span className="w-1 bg-medical-accent h-8 rounded animate-pulse delay-150"></span>
              <span className="w-1 bg-medical-accent h-4 rounded animate-pulse delay-200"></span>
            </div>
          )}

          {/* Text and Voice Inputs */}
          <div className="flex gap-3 items-center mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={toggleVoiceListen}
              className={`p-3 rounded-xl border transition-all ${
                isListening
                  ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse'
                  : 'bg-slate-950/60 border-clinical-border text-slate-400 hover:text-slate-200 hover:border-slate-500'
              }`}
              title={isListening ? "Stop listening" : "Start Voice Input"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              placeholder={isListening ? "Listening..." : "Ask clinical assistant..."}
              value={input}
              disabled={isListening}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              className="glass-input flex-1 py-2.5 text-xs"
            />
            <button
              onClick={() => handleSend(input)}
              className="bg-medical-primary hover:bg-blue-600 text-white font-medium p-2.5 rounded-xl transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested clinical actions column */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-clinical-accent" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Clinical Presets</h3>
          </div>
          <p className="text-[11px] text-slate-400 mb-4">Click to execute conversational queries directly.</p>
          <div className="flex flex-col gap-2.5">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="text-left text-xs bg-slate-950/60 hover:bg-slate-900 text-slate-300 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all font-medium"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
