import React, { useState } from 'react';
import { FileQuestion, ArrowLeft, Bot, Home, Search, ShieldAlert } from 'lucide-react';
import { SupportChatWidget } from '../components/SupportChatWidget';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
  attemptedPath?: string;
}

export function NotFoundPage({ onNavigate, attemptedPath = window.location.pathname }: NotFoundPageProps) {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [prefill, setPrefill] = useState<string>('');

  const handleAskAssistant = () => {
    setPrefill(`I encountered an HTTP 404 Not Found error trying to visit "${attemptedPath}". Can you explain why this case record is missing?`);
    setIsAssistantOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090A0D] text-[#F0F0F2] flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-[#252836] bg-[#0E1015]/90 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="p-2 bg-[#141722] hover:bg-[#1E2335] text-[#D5AA63] rounded border border-[#252836] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-forensic uppercase tracking-wider text-[#EF4444] px-2 py-0.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded">
                HTTP 404 Error
              </span>
              <span className="text-xs text-[#8E92A4] font-mono-forensic">
                Forensic File Missing
              </span>
            </div>
            <h1 className="text-base font-bold text-[#F0F0F2]">Case Record Not Found</h1>
          </div>
        </div>

        <button
          onClick={() => onNavigate('landing')}
          className="px-3.5 py-1.5 bg-[#141722] hover:bg-[#1E2335] text-[#D5AA63] text-xs font-mono-forensic rounded border border-[#252836] flex items-center gap-1.5 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          Home
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-[#0E1015] border border-[#2B3042] rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#EF4444]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 mx-auto mb-4 bg-[#2A1416] border border-[#EF4444]/30 rounded-2xl flex items-center justify-center text-[#EF4444]">
            <FileQuestion className="w-8 h-8" />
          </div>

          <div className="inline-block px-3 py-1 bg-[#2A1416] text-[#EF4444] font-mono-forensic text-xs font-bold rounded mb-3 border border-[#EF4444]/30">
            HTTP 404 — NOT FOUND
          </div>

          <h2 className="text-2xl font-bold text-[#F0F0F2] mb-3 font-mono-forensic">
            Forensic Dossier Unregistered
          </h2>

          <p className="text-xs sm:text-sm text-[#8E92A4] leading-relaxed mb-4">
            The requested crime scene URL or evidence dossier could not be located in CaseZero records.
            The file may have been reclassified, sealed under judicial court order, or never existed in Blackwood Manor.
          </p>

          <div className="p-3 bg-[#0A0C13] border border-[#252836] rounded-lg text-left text-xs font-mono-forensic text-[#8E92A4] mb-6">
            <div>Requested Path: <code className="text-[#D5AA63]">{attemptedPath}</code></div>
            <div className="text-[11px] text-[#5A5E73] mt-1">Status: Unresolved investigation asset reference</div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleAskAssistant}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#D5AA63] hover:bg-[#E5BA73] text-[#090A0D] font-bold text-xs font-mono-forensic rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-[#D5AA63]/20 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              Ask the Assistant
            </button>

            <button
              onClick={() => onNavigate('faq')}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#141722] hover:bg-[#1E2335] text-[#D5AA63] border border-[#252836] rounded-lg text-xs font-mono-forensic flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              Browse SQL FAQs
            </button>

            <button
              onClick={() => onNavigate('crimescene')}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#141722] hover:bg-[#1E2335] text-[#F0F0F2] border border-[#252836] rounded-lg text-xs font-mono-forensic flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#4ADE80]" />
              Return to Scene
            </button>
          </div>
        </div>
      </main>

      {/* Floating Website Support Assistant Widget */}
      <SupportChatWidget
        initialOpen={isAssistantOpen}
        prefillMessage={prefill}
      />
    </div>
  );
}
