import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
  Bot,
  MessageSquare,
  Send,
  X,
  Sparkles,
  ChevronDown,
  AlertCircle,
  FileText,
  Search,
  Scale
} from 'lucide-react';

interface AssistantDetectiveProps {
  investigationId: number;
  currentPage: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isRealAi?: boolean;
  isError?: boolean;
  timestamp: string;
}

export const AssistantDetective: React.FC<AssistantDetectiveProps> = ({
  investigationId,
  currentPage,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Greetings, Detective. I am your Assistant Detective partner for Case CZ-001. Ask me to summarise our discovered evidence, highlight case contradictions, or examine suspect alibis.',
      isRealAi: true,
      timestamp: 'Case Briefing Active',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick Action Chips
  const quickActions = [
    { label: '📋 Summarise evidence', query: 'Summarise the evidence.' },
    { label: '🔍 Strongest clues', query: 'What are our strongest clues?' },
    { label: '⚖️ Any contradictions?', query: 'What contradictions have we found?' },
    { label: '👥 Suspect alibis', query: 'Review the suspects and their alibis.' },
  ];

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Keep available across Evidence, Suspects, Interrogation, and Final Accusation (and crime scene/story)
  const allowedPages = ['evidence', 'suspects', 'interrogation', 'deduction', 'crimescene', 'story', 'review'];
  if (!allowedPages.includes(currentPage)) {
    return null;
  }

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      // Build lightweight chat history
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await api.chatWithAssistant(investigationId, text, history);

      const aiMsg: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: res.response,
        isRealAi: res.is_real_ai,
        isError: !res.is_real_ai,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content:
          err?.message ||
          'Assistant Detective is currently unable to reach the investigation server. Please check your network and verify backend is running.',
        isRealAi: false,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Compact Chat Panel */}
      {isOpen && (
        <div
          className="mb-3 w-80 sm:w-96 max-h-[520px] h-[500px] bg-[#101218] border border-[#2B303A] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          style={{ backdropFilter: 'blur(16px)' }}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#151922] border-b border-[#2B303A] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#D5AA63]/15 border border-[#D5AA63]/30 flex items-center justify-center text-[#D5AA63]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-serif-noir text-sm font-bold text-[#F0F0F2]">
                    Assistant Detective
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] font-mono-forensic text-[#9BA2AE]">
                  Case CZ-001 • Forensic AI Companion
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#656C7A] hover:text-[#F0F0F2] rounded-md transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="p-2 bg-[#0C0E12] border-b border-[#2B303A]/70 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
            {quickActions.map((qa, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qa.query)}
                disabled={loading}
                className="px-2 py-1 rounded bg-[#151922] hover:bg-[#1E2533] border border-[#2B303A] hover:border-[#D5AA63]/50 text-[10px] font-mono-forensic text-[#9BA2AE] hover:text-[#F0F0F2] whitespace-nowrap transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                {qa.label}
              </button>
            ))}
          </div>

          {/* Messages Transcript Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#090A0D]/60 text-xs">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-1 mb-1 px-1">
                    <span className="text-[9px] font-mono-forensic text-[#656C7A]">
                      {isUser ? 'You' : 'Assistant Detective'}
                    </span>
                    <span className="text-[9px] font-mono-forensic text-[#656C7A]">
                      • {m.timestamp}
                    </span>
                  </div>

                  <div
                    className={`max-w-[90%] rounded-xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-[#1E2533] text-[#F0F0F2] border border-[#D5AA63]/30 rounded-br-none'
                        : m.isError
                        ? 'bg-[#2A1518] text-[#F28B82] border border-[#F28B82]/30 rounded-bl-none'
                        : 'bg-[#151922] text-[#F0F0F2] border border-[#2B303A] rounded-bl-none'
                    }`}
                  >
                    {/* Render message with line breaks and markdown bullet points */}
                    <div className="space-y-1.5 whitespace-pre-wrap font-sans">
                      {m.content.split('\n').map((line, lIdx) => {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                          return (
                            <div key={lIdx} className="flex items-start space-x-1.5 pl-1 my-1">
                              <span className="text-[#D5AA63] text-[11px] font-bold leading-none mt-1">
                                •
                              </span>
                              <span className="flex-1 leading-relaxed">
                                {trimmed.substring(2)}
                              </span>
                            </div>
                          );
                        }
                        return <p key={lIdx}>{line}</p>;
                      })}
                    </div>

                    {!isUser && (
                      <div className="mt-1 pt-1 border-t border-[#2B303A]/50 flex items-center justify-between text-[9px] font-mono-forensic">
                        {m.isError ? (
                          <span className="text-amber-400 flex items-center space-x-1">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>Service Warning</span>
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center space-x-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Gemini AI Connected</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start space-x-2 p-2 text-xs font-mono-forensic text-[#D5AA63]">
                <Bot className="w-4 h-4 animate-spin text-[#D5AA63]" />
                <span>Assistant Detective is cross-referencing case files...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="p-2.5 bg-[#151922] border-t border-[#2B303A] flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask for an evidence summary, clues..."
              disabled={loading}
              className="flex-1 bg-[#101218] border border-[#2B303A] focus:border-[#D5AA63] rounded-lg px-3 py-1.5 text-xs text-[#F0F0F2] focus:outline-none placeholder-[#656C7A] font-sans"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2 rounded-lg bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] transition-colors cursor-pointer disabled:opacity-40 shrink-0"
              title="Send Message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Persistent Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3.5 py-2.5 rounded-full bg-[#151922] hover:bg-[#1E2533] border border-[#D5AA63]/50 text-[#D5AA63] shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_0_15px_rgba(213,170,99,0.35)] transition-all cursor-pointer group"
        title="Open Assistant Detective AI Companion"
      >
        <div className="w-6 h-6 rounded-full bg-[#D5AA63]/15 flex items-center justify-center text-[#D5AA63] border border-[#D5AA63]/40 group-hover:scale-105 transition-transform">
          <Bot className="w-3.5 h-3.5" />
        </div>
        <span className="font-mono-forensic text-xs font-bold tracking-wide text-[#F0F0F2] group-hover:text-[#D5AA63] transition-colors">
          Assistant Detective
        </span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-[#9BA2AE]" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        )}
      </button>
    </div>
  );
};
