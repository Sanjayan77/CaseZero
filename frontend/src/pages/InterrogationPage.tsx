import React, { useState, useEffect, useRef } from 'react';
import { Suspect, DiscoveredEvidence, Interview, InterviewMessage, AIStatus } from '../types';
import { api } from '../services/api';
import { SafeImage } from '../components/SafeImage';
import {
  MessageSquare,
  Send,
  HelpCircle,
  Clock,
  Shield,
  Briefcase,
  FileText,
  X,
  Sparkles
} from 'lucide-react';

interface InterrogationPageProps {
  investigationId: number;
  suspects: Suspect[];
  evidenceList: DiscoveredEvidence[];
  initialSuspectId: number | null;
  onEvidenceDiscovered: () => void;
  aiStatus: AIStatus | null;
}

export const InterrogationPage: React.FC<InterrogationPageProps> = ({
  investigationId,
  suspects,
  evidenceList,
  initialSuspectId,
  onEvidenceDiscovered,
}) => {
  const [selectedSuspectId, setSelectedSuspectId] = useState<number>(
    initialSuspectId || (suspects.length > 0 ? suspects[0].id : 1)
  );
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loadingInterview, setLoadingInterview] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [showEvidencePicker, setShowEvidencePicker] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSuspect = suspects.find((s) => s.id === selectedSuspectId) || suspects[0];

  // Load interview for current suspect
  useEffect(() => {
    if (!currentSuspect) return;
    setLoadingInterview(true);
    api.getInterview(investigationId, currentSuspect.id)
      .then((data) => {
        setInterview(data);
      })
      .catch((err) => {
        console.error('Failed to load suspect interview:', err);
      })
      .finally(() => setLoadingInterview(false));
  }, [investigationId, currentSuspect?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interview?.messages]);

  const handleSendMessage = async (text: string, referencedEvidenceCode?: string) => {
    if (!text.trim() || sending || !currentSuspect) return;
    setSending(true);
    try {
      const newMsg = await api.sendInterrogationMessage(
        investigationId,
        currentSuspect.id,
        text,
        referencedEvidenceCode
      );

      // Refresh interview state
      const updatedInterview = await api.getInterview(investigationId, currentSuspect.id);
      setInterview(updatedInterview);
      setCustomQuestion('');
      setShowEvidencePicker(false);
      onEvidenceDiscovered();
    } catch (err) {
      console.error('Failed to send interrogation message:', err);
    } finally {
      setSending(false);
    }
  };

  // Suggested questions specified in gameplay flow
  const suggestedQuestions = [
    {
      id: 'alibi',
      label: 'Ask about their alibi',
      question: `Where exactly were you between 8:20 and 8:40 PM when Adrian was poisoned?`,
    },
    {
      id: 'relationship',
      label: 'Ask about relationship with Adrian',
      question: `What was the true nature of your personal and business relationship with Adrian Vale?`,
    },
    {
      id: 'dinner',
      label: 'Ask about the dinner',
      question: `What took place during the dinner party before Adrian retired to his locked study?`,
    },
    {
      id: 'suspects',
      label: 'Ask whom they suspect',
      question: `Whom among tonight's guests had a compelling motive to see Adrian dead?`,
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#2B303A] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-forensic text-[#D5AA63] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D5AA63] animate-pulse"></span>
            <span>STEP 3 • SUSPECT INTERROGATION</span>
          </div>
          <h1 className="font-serif-noir text-2xl md:text-3xl font-bold text-[#F0F0F2]">
            Interrogation
          </h1>
          <p className="text-xs text-[#9BA2AE] mt-1">
            Select question buttons or confront suspects directly with physical evidence.
          </p>
        </div>
      </div>

      {/* Suspect Selector Ribbon */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {suspects.map((suspect) => {
          const isSelected = suspect.id === currentSuspect?.id;
          return (
            <button
              key={suspect.id}
              onClick={() => setSelectedSuspectId(suspect.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-mono-forensic transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#D5AA63] text-[#090A0D] font-bold shadow-[0_0_15px_rgba(213,170,99,0.3)]'
                  : 'bg-[#151922] text-[#9BA2AE] hover:text-[#F0F0F2] border border-[#2B303A]'
              }`}
            >
              <div className="w-5 h-5 rounded-full overflow-hidden bg-[#090A0D] shrink-0 border border-current">
                <SafeImage
                  src={suspect.portrait_image}
                  alt={suspect.name}
                  fallbackType="suspect"
                  className="w-full h-full object-cover filter grayscale"
                />
              </div>
              <span>{suspect.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interrogation Chamber Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Suspect Profile Card */}
        <div className="lg:col-span-4 bg-[#101218] border border-[#2B303A] rounded-xl p-5 space-y-4 shadow-xl">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#090A0D] border border-[#2B303A]">
            <SafeImage
              src={currentSuspect?.portrait_image}
              alt={currentSuspect?.name}
              fallbackType="suspect"
              fallbackTitle={currentSuspect?.name}
              className="w-full h-full object-cover object-top filter grayscale contrast-125 brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101218] via-transparent to-transparent opacity-80" />
            <span className="absolute bottom-2.5 left-2.5 text-[9px] font-mono-forensic bg-[#090A0D]/90 text-[#D5AA63] px-2 py-0.5 rounded border border-[#D5AA63]/30">
              {currentSuspect?.role}
            </span>
          </div>

          <div>
            <h2 className="font-serif-noir text-xl font-bold text-[#F0F0F2]">
              {currentSuspect?.name}
            </h2>
            <p className="text-[11px] font-mono-forensic text-[#9BA2AE]">
              {currentSuspect?.relationship_to_victim}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#151922] border border-[#2B303A] space-y-1">
            <span className="text-[9px] font-mono-forensic text-[#D5AA63] uppercase font-bold flex items-center space-x-1">
              <Clock className="w-2.5 h-2.5" />
              <span>DECLARED ALIBI:</span>
            </span>
            <p className="text-xs text-[#F0F0F2] font-mono-forensic leading-relaxed">
              {currentSuspect?.known_alibi}
            </p>
          </div>

          <p className="text-xs text-[#9BA2AE] leading-relaxed line-clamp-3">
            {currentSuspect?.public_bio}
          </p>
        </div>

        {/* Right: Dialogue Transcript and Question Console */}
        <div className="lg:col-span-8 bg-[#101218] border border-[#2B303A] rounded-xl flex flex-col h-[600px] shadow-xl overflow-hidden">
          {/* Transcript Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-[#090A0D]/50">
            {loadingInterview ? (
              <div className="text-center py-12 text-xs font-mono-forensic text-[#656C7A]">
                Opening interrogation log...
              </div>
            ) : interview?.messages && interview.messages.length > 0 ? (
              interview.messages.map((msg: InterviewMessage) => {
                const isPlayer = msg.sender === 'player';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isPlayer ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1 px-1">
                      <span className="text-[10px] font-mono-forensic text-[#656C7A]">
                        {isPlayer ? 'Detective' : currentSuspect.name}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                        isPlayer
                          ? 'bg-[#1E2533] text-[#F0F0F2] border border-[#D5AA63]/30 rounded-br-none'
                          : 'bg-[#151922] text-[#F0F0F2] border border-[#2B303A] rounded-bl-none'
                      }`}
                    >
                      {msg.referenced_evidence_code && (
                        <div className="mb-1 text-[10px] font-mono-forensic text-[#D5AA63] font-bold">
                          [CONFRONTED WITH EVIDENCE {msg.referenced_evidence_code}]
                        </div>
                      )}
                      <p>{msg.content}</p>
                      {!isPlayer && (
                        <div className="mt-1.5 pt-1 border-t border-[#2B303A]/50 flex items-center justify-between text-[10px] font-mono-forensic">
                          {msg.is_fallback ? (
                            <span className="text-amber-400/90 flex items-center space-x-1">
                              <span>⚠️ Local Fallback Engine</span>
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center space-x-1 font-semibold">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Gemini Live AI</span>
                            </span>
                          )}
                          {msg.emotion && (
                            <span className="text-[#656C7A] capitalize">
                              [{msg.emotion}]
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-xs font-mono-forensic text-[#656C7A]">
                No questions recorded. Select a suggested question below to begin.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Evidence Picker Drawer (if open) */}
          {showEvidencePicker && (
            <div className="p-3 bg-[#151922] border-t border-[#2B303A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-forensic text-[#D5AA63] font-bold">
                  SELECT EVIDENCE TO CONFRONT {currentSuspect.name.toUpperCase()}:
                </span>
                <button
                  onClick={() => setShowEvidencePicker(false)}
                  className="text-[#656C7A] hover:text-[#F0F0F2] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {evidenceList.length === 0 ? (
                <p className="text-xs text-[#9BA2AE]">No evidence discovered yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto">
                  {evidenceList.map((disc) => (
                    <button
                      key={disc.id}
                      onClick={() => {
                        const question = `How do you explain Exhibit ${disc.evidence.evidence_code}: ${disc.evidence.title}?`;
                        handleSendMessage(question, disc.evidence.evidence_code);
                      }}
                      className="p-2 rounded bg-[#101218] hover:bg-[#1B202A] border border-[#2B303A] hover:border-[#D5AA63] text-left transition-all cursor-pointer flex items-center space-x-2 truncate"
                    >
                      <div className="w-8 h-8 rounded bg-[#090A0D] overflow-hidden shrink-0 border border-[#2B303A]">
                        <SafeImage
                          src={disc.evidence.image_url}
                          alt={disc.evidence.title}
                          fallbackType="evidence"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <span className="text-[9px] font-mono-forensic text-[#D5AA63] block">
                          {disc.evidence.evidence_code}
                        </span>
                        <span className="text-[11px] font-semibold text-[#F0F0F2] truncate block">
                          {disc.evidence.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Controls: 5 Suggested Question Buttons */}
          <div className="p-4 bg-[#101218] border-t border-[#2B303A] space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {suggestedQuestions.map((sq) => (
                <button
                  key={sq.id}
                  onClick={() => handleSendMessage(sq.question)}
                  disabled={sending}
                  className="px-3 py-1.5 rounded-lg bg-[#151922] hover:bg-[#1B202A] border border-[#2B303A] hover:border-[#D5AA63]/50 text-xs text-[#F0F0F2] font-mono-forensic transition-all cursor-pointer disabled:opacity-50"
                >
                  {sq.label}
                </button>
              ))}

              {/* Confront with Evidence Button */}
              <button
                onClick={() => setShowEvidencePicker(!showEvidencePicker)}
                className="px-3 py-1.5 rounded-lg bg-[#D5AA63]/15 hover:bg-[#D5AA63]/25 border border-[#D5AA63]/40 text-xs text-[#D5AA63] font-mono-forensic font-semibold transition-all cursor-pointer flex items-center space-x-1"
              >
                <FileText className="w-3 h-3" />
                <span>Ask about discovered evidence</span>
              </button>
            </div>

            {/* Optional Free-Text Question Field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(customQuestion);
              }}
              className="flex items-center space-x-2 pt-1"
            >
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Or type custom question..."
                disabled={sending}
                className="flex-1 bg-[#151922] border border-[#2B303A] focus:border-[#D5AA63] rounded-lg px-3.5 py-2 text-xs text-[#F0F0F2] focus:outline-none font-sans"
              />
              <button
                type="submit"
                disabled={!customQuestion.trim() || sending}
                className="px-4 py-2 rounded-lg bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] text-xs font-mono-forensic font-bold uppercase transition-colors cursor-pointer disabled:opacity-40 shrink-0 flex items-center space-x-1"
              >
                <span>{sending ? 'Asking...' : 'Send'}</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
