import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Ticket, Star, ShieldCheck, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { SupportChatResponse } from '../types';

interface SupportChatWidgetProps {
  initialOpen?: boolean;
  prefillMessage?: string;
  hasSherlockCompanion?: boolean;
}

interface ChatMsg {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  confirmedStatus?: string;
  ticket?: {
    ticket_id: number;
    ticket_number: string;
    subject: string;
    status: string;
  };
  isRealAI?: boolean;
  timestamp: string;
}

export function SupportChatWidget({
  initialOpen = false,
  prefillMessage,
  hasSherlockCompanion = false,
}: SupportChatWidgetProps) {

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [activeTab, setActiveTab] = useState<'chat' | 'feedback' | 'ticket'>('chat');
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: 'Welcome to CaseZero Support. I can answer inquiries about case gameplay, SQL FAQs, and system error codes (including custom CZ-423). If you encounter an issue I cannot resolve, I will automatically log a support ticket.',
      confirmedStatus: 'confirmed',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Feedback state
  const [rating, setRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Quick ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  useEffect(() => {
    if (prefillMessage) {
      setInputValue(prefillMessage);
      setIsOpen(true);
    }
  }, [prefillMessage]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMsg = {
      id: 'u_' + Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const res: SupportChatResponse = await api.chatWithSupportAssistant(
        text,
        history,
        sessionId
      );

      const assistantMsg: ChatMsg = {
        id: 'a_' + Date.now(),
        sender: 'assistant',
        content: res.answer,
        confirmedStatus: res.confirmed_status,
        ticket: res.ticket,
        isRealAI: res.is_real_ai,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMsg = {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        content: 'Support assistant is momentarily unreachable. Please check network connectivity or submit a ticket directly using the Ticket tab.',
        confirmedStatus: 'unconfirmed',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    try {
      await api.submitFeedback(rating, feedbackComment, 'widget_feedback', sessionId);
      setFeedbackSuccess(true);
      setFeedbackComment('');
      setTimeout(() => {
        setFeedbackSuccess(false);
        setActiveTab('chat');
      }, 2500);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleCreateManualTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;
    setIsSubmittingTicket(true);
    try {
      const t = await api.createSupportTicket(ticketSubject, ticketDescription, 'User Ticket', 'normal');
      setTicketSuccess(t.ticket_number);
      setTicketSubject('');
      setTicketDescription('');
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-5 right-4 sm:right-5 z-50 font-sans pointer-events-none flex flex-col items-end">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 bg-[#13161F] hover:bg-[#1A1E2B] text-[#D5AA63] border border-[#D5AA63]/40 rounded-full shadow-2xl hover:shadow-[#D5AA63]/25 hover:border-[#D5AA63] transition-all group cursor-pointer"
          title="CaseZero Website Support Assistant"
        >
          <div className="relative flex items-center justify-center">
            <span className="text-sm">🤖</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse border border-[#13161F]" />
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase font-mono-forensic text-[#F0F0F2] group-hover:text-[#D5AA63] transition-colors">
            Support Assistant
          </span>
        </button>
      )}

      {/* Expanded Support Window */}
      {isOpen && (
        <div className="pointer-events-auto w-[calc(100vw-2rem)] sm:w-[410px] max-w-[420px] max-h-[calc(100vh-5.5rem)] sm:max-h-[550px] h-[520px] bg-[#0E1017] border border-[#2B3042] rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md">

          {/* Header */}
          <div className="px-4 py-3 bg-[#131622] border-b border-[#2B3042] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#D5AA63]/10 border border-[#D5AA63]/30 rounded-lg text-sm flex items-center justify-center">
                <span>🤖</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-[#F0F0F2] uppercase tracking-wider font-mono-forensic">
                    CaseZero Support Assistant
                  </h3>
                  <span className="inline-block w-1.5 h-1.5 bg-[#4ADE80] rounded-full" />
                </div>
                <p className="text-[10px] text-[#8E92A4]">SQL FAQs • Error Codes • MongoDB Archive</p>
              </div>
            </div>


            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8E92A4] hover:text-[#F0F0F2] p-1 rounded hover:bg-[#1C2030] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center border-b border-[#2B3042] bg-[#0A0C13] text-[11px] font-mono-forensic">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'chat'
                  ? 'text-[#D5AA63] border-b-2 border-[#D5AA63] bg-[#131622]'
                  : 'text-[#8E92A4] hover:text-[#D5AA63]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Assistant
            </button>
            <button
              onClick={() => setActiveTab('ticket')}
              className={`flex-1 py-2 text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'ticket'
                  ? 'text-[#D5AA63] border-b-2 border-[#D5AA63] bg-[#131622]'
                  : 'text-[#8E92A4] hover:text-[#D5AA63]'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              File Ticket
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 py-2 text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'feedback'
                  ? 'text-[#D5AA63] border-b-2 border-[#D5AA63] bg-[#131622]'
                  : 'text-[#8E92A4] hover:text-[#D5AA63]'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              Feedback
            </button>
          </div>

          {/* Tab 1: Chat Content */}
          {activeTab === 'chat' && (
            <>
              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${
                          isUser
                            ? 'bg-[#1C2030] text-[#F0F0F2] border border-[#2B3042]'
                            : 'bg-[#121520] text-[#D0D4E4] border border-[#252A3B]'
                        }`}
                      >
                        {!isUser && m.confirmedStatus === 'confirmed' && (
                          <div className="flex items-center gap-1 text-[10px] text-[#4ADE80] font-mono-forensic mb-1.5">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Confirmed from SQL Knowledge Base</span>
                          </div>
                        )}

                        {!isUser && m.confirmedStatus === 'escalated' && (
                          <div className="flex items-center gap-1 text-[10px] text-[#FBBF24] font-mono-forensic mb-1.5">
                            <AlertCircle className="w-3 h-3" />
                            <span>Escalation Protocol Active</span>
                          </div>
                        )}

                        <div className="whitespace-pre-wrap leading-relaxed text-[12px]">
                          {m.content}
                        </div>

                        {/* Ticket Badge */}
                        {m.ticket && (
                          <div className="mt-2.5 p-2 bg-[#1C1810] border border-[#D5AA63]/40 rounded text-[11px] text-[#D5AA63] font-mono-forensic">
                            <div className="font-bold flex items-center gap-1">
                              <Ticket className="w-3 h-3" />
                              <span>SQL Ticket Ref: {m.ticket.ticket_number}</span>
                            </div>
                            <div className="text-[10px] text-[#8E92A4] mt-0.5">
                              Status: <span className="uppercase text-[#4ADE80]">{m.ticket.status}</span> • Persisted in SQLite
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[9px] text-[#6B7280] mt-1.5">
                          <span>{m.timestamp}</span>
                          {!isUser && m.isRealAI && (
                            <span className="flex items-center gap-0.5 text-[#D5AA63]/80">
                              <Sparkles className="w-2.5 h-2.5" />
                              Gemini Live
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-[#8E92A4] p-2 bg-[#121520] rounded border border-[#252A3B] w-fit">
                    <RefreshCw className="w-3 h-3 animate-spin text-[#D5AA63]" />
                    <span>Searching SQL FAQs & formulating response...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-3 py-1.5 bg-[#0A0C13] border-t border-[#252A3B] flex gap-1.5 overflow-x-auto text-[10px] font-mono-forensic">
                <button
                  onClick={() => handleSend('How does suspect interrogation work?')}
                  className="px-2 py-1 bg-[#151824] hover:bg-[#1E2335] text-[#D5AA63] rounded border border-[#2B3042] whitespace-nowrap cursor-pointer transition-colors"
                >
                  Interrogation Guide
                </button>
                <button
                  onClick={() => handleSend('What does error CZ-423 mean?')}
                  className="px-2 py-1 bg-[#151824] hover:bg-[#1E2335] text-[#D5AA63] rounded border border-[#2B3042] whitespace-nowrap cursor-pointer transition-colors"
                >
                  Error CZ-423
                </button>
                <button
                  onClick={() => handleSend('I need to file a support ticket for an issue.')}
                  className="px-2 py-1 bg-[#151824] hover:bg-[#1E2335] text-[#D5AA63] rounded border border-[#2B3042] whitespace-nowrap cursor-pointer transition-colors"
                >
                  File Ticket
                </button>
              </div>

              {/* Input Bar */}
              <div className="p-3 bg-[#131622] border-t border-[#2B3042] flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about CaseZero, FAQs, or errors..."
                  className="flex-1 bg-[#0A0C13] border border-[#2B3042] rounded-lg px-3 py-2 text-xs text-[#F0F0F2] placeholder-[#5A5E73] focus:outline-none focus:border-[#D5AA63]"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !inputValue.trim()}
                  className="p-2 bg-[#D5AA63] hover:bg-[#E5BA73] disabled:opacity-40 text-[#090A0D] rounded-lg font-bold transition-colors cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Tab 2: Manual Ticket Submission */}
          {activeTab === 'ticket' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-[#F0F0F2] font-mono-forensic text-xs uppercase text-[#D5AA63]">
                  Direct SQL Support Ticket
                </h4>
                <p className="text-[11px] text-[#8E92A4]">
                  Submits a persistent forensic ticket to the SQLite database.
                </p>
              </div>

              {ticketSuccess && (
                <div className="p-3 bg-[#122B1C] border border-[#4ADE80]/40 rounded text-[#4ADE80] text-xs font-mono-forensic">
                  ✓ Ticket successfully registered in SQL: <strong>{ticketSuccess}</strong>
                </div>
              )}

              <form onSubmit={handleCreateManualTicket} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono-forensic text-[#8E92A4] mb-1">
                    Subject / Issue Summary
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Issue connecting to AI server..."
                    className="w-full bg-[#0A0C13] border border-[#2B3042] rounded px-3 py-2 text-xs text-[#F0F0F2] focus:outline-none focus:border-[#D5AA63]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-forensic text-[#8E92A4] mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Provide details regarding the steps or case error..."
                    className="w-full bg-[#0A0C13] border border-[#2B3042] rounded px-3 py-2 text-xs text-[#F0F0F2] focus:outline-none focus:border-[#D5AA63]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="w-full py-2.5 bg-[#D5AA63] hover:bg-[#E5BA73] text-[#090A0D] font-bold rounded font-mono-forensic uppercase tracking-wider text-xs transition-colors cursor-pointer"
                >
                  {isSubmittingTicket ? 'Recording to SQL...' : 'Submit Support Ticket'}
                </button>
              </form>
            </div>
          )}

          {/* Tab 3: MongoDB Feedback */}
          {activeTab === 'feedback' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <h4 className="font-bold text-[#F0F0F2] font-mono-forensic text-xs uppercase text-[#D5AA63]">
                  Investigator Feedback
                </h4>
                <p className="text-[11px] text-[#8E92A4]">
                  Archived permanently in the MongoDB collection (`user_feedback`).
                </p>
              </div>

              {feedbackSuccess && (
                <div className="p-3 bg-[#122B1C] border border-[#4ADE80]/40 rounded text-[#4ADE80] text-xs font-mono-forensic">
                  ✓ Thank you! Feedback has been recorded in MongoDB.
                </div>
              )}

              <form onSubmit={handleSubmitFeedback} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono-forensic text-[#8E92A4] mb-1.5">
                    Experience Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-1.5 rounded transition-transform cursor-pointer ${
                          rating >= star ? 'text-[#F59E0B] scale-110' : 'text-[#4B5563]'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                    <span className="text-xs font-mono-forensic text-[#D5AA63] ml-2">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-forensic text-[#8E92A4] mb-1">
                    Comments or Observations
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Share your thoughts on AI suspect responsiveness, forensic accuracy, or support..."
                    className="w-full bg-[#0A0C13] border border-[#2B3042] rounded px-3 py-2 text-xs text-[#F0F0F2] focus:outline-none focus:border-[#D5AA63]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="w-full py-2.5 bg-[#D5AA63] hover:bg-[#E5BA73] text-[#090A0D] font-bold rounded font-mono-forensic uppercase tracking-wider text-xs transition-colors cursor-pointer"
                >
                  {isSubmittingFeedback ? 'Writing to MongoDB...' : 'Save Feedback to MongoDB'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
