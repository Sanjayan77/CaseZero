import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft, Bot, Home, RefreshCw, Ticket } from 'lucide-react';
import { SupportChatWidget } from '../components/SupportChatWidget';

interface ServerErrorPageProps {
  onNavigate: (page: string) => void;
  errorMessage?: string;
  errorTraceId?: string;
}

export function ServerErrorPage({ 
  onNavigate, 
  errorMessage = "An unexpected server-side exception occurred while processing the forensic query.",
  errorTraceId = "TRC-" + Math.random().toString(36).substring(2, 8).toUpperCase()
}: ServerErrorPageProps) {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [prefill, setPrefill] = useState<string>('');

  const handleAskAssistant = () => {
    setPrefill(`I received an HTTP 500 Internal Server Error (Trace: ${errorTraceId}): "${errorMessage}". How can I resolve this or file a bug ticket?`);
    setIsAssistantOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090A0D] text-[#F0F0F2] flex flex-col font-sans">
      {/* Top Header */}
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
                HTTP 500 Error
              </span>
              <span className="text-xs text-[#8E92A4] font-mono-forensic">
                Internal Forensic System Failure
              </span>
            </div>
            <h1 className="text-base font-bold text-[#F0F0F2]">Server Exception Intercepted</h1>
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
          {/* Subtle glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#EF4444]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 mx-auto mb-4 bg-[#2A1416] border border-[#EF4444]/30 rounded-2xl flex items-center justify-center text-[#EF4444]">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="inline-block px-3 py-1 bg-[#2A1416] text-[#EF4444] font-mono-forensic text-xs font-bold rounded mb-3 border border-[#EF4444]/30">
            HTTP 500 — INTERNAL SERVER ERROR
          </div>

          <h2 className="text-2xl font-bold text-[#F0F0F2] mb-3 font-mono-forensic">
            Investigation Engine Error
          </h2>

          <p className="text-xs sm:text-sm text-[#8E92A4] leading-relaxed mb-4">
            Our forensic engine encountered an unexpected internal exception while executing your request.
            Request logs have recorded the duration, endpoint, and trace ID for diagnostic inspection.
          </p>

          <div className="p-3 bg-[#0A0C13] border border-[#252836] rounded-lg text-left text-xs font-mono-forensic text-[#8E92A4] mb-6 space-y-1">
            <div>Trace ID: <code className="text-[#D5AA63]">{errorTraceId}</code></div>
            <div>Error Detail: <code className="text-[#EF4444]">{errorMessage}</code></div>
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
              onClick={() => onNavigate('support')}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#141722] hover:bg-[#1E2335] text-[#D5AA63] border border-[#252836] rounded-lg text-xs font-mono-forensic flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5" />
              File SQL Support Ticket
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#141722] hover:bg-[#1E2335] text-[#F0F0F2] border border-[#252836] rounded-lg text-xs font-mono-forensic flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Request
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
