import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface AINurseAssistantProps {
  onSendMessage: (message: string) => Promise<string>;
}

export const AINurseAssistant: React.FC<AINurseAssistantProps> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I am the CareSync AI Command Center Assistant. I have indexed all 100 patient streams, clinical alerts, and digital twin forecasts. How can I help you support your care team today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Who is the highest-risk patient?",
    "Why is patient P101 critical?",
    "Predict the next emergency.",
    "Show active alerts."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = { sender: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Call parenting handler
      const response = await onSendMessage(text);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: response, timestamp: new Date() }
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: "Error communicating with AI service. Running in Offline Core Sandbox.", timestamp: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-5 flex flex-col h-[380px]">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-clinical-accent" />
          <h2 className="text-lg font-bold font-sans tracking-wide">AI NURSE COPILOT</h2>
        </div>
        <div className="flex items-center gap-1 bg-clinical-accentGlow px-2 py-0.5 rounded border border-clinical-accent/30">
          <Sparkles className="w-3 h-3 text-clinical-accent" />
          <span className="text-[9px] uppercase font-extrabold text-clinical-accent">Gemini Core</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 flex-shrink-0 leading-relaxed">
        Query real-time analytics, vital breakdowns, or emergency predictions.
      </p>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto pr-1 mb-3 flex flex-col gap-2.5">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700/60 flex items-center justify-center flex-shrink-0 text-clinical-accent mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            
            <div
              className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-clinical-accent text-white rounded-tr-none shadow-glow-accent'
                  : 'bg-slate-900/80 border border-clinical-border text-slate-200 rounded-tl-none'
              }`}
            >
              {m.text}
            </div>
            
            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center flex-shrink-0 text-slate-300 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700/60 flex items-center justify-center text-clinical-accent animate-pulse mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-900/80 border border-clinical-border rounded-2xl rounded-tl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-clinical-accent rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-clinical-accent rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-clinical-accent rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      <div className="flex-shrink-0 flex flex-wrap gap-1.5 mb-3">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSubmit(qp)}
            disabled={loading}
            className="text-[10px] text-slate-300 hover:text-white bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 px-2.5 py-1 rounded-full transition-all duration-200 flex items-center gap-1"
          >
            <MessageSquare className="w-2.5 h-2.5 text-clinical-accent" />
            {qp}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(input);
        }}
        className="flex-shrink-0 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Copilot (e.g. 'Show critical alerts')..."
          disabled={loading}
          className="flex-1 glass-input py-2 px-3.5 text-xs rounded-xl"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="glass-btn-primary p-2.5 rounded-xl flex items-center justify-center flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
