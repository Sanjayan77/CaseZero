import React, { useState } from 'react';
import { AIStatus } from '../types';
import { api } from '../services/api';
import { Bot, CheckCircle, AlertCircle, RefreshCw, X, Cpu, Key } from 'lucide-react';

interface AIStatusIndicatorProps {
  status: AIStatus | null;
  onRefresh?: () => void;
  compact?: boolean;
}

export const AIStatusIndicator: React.FC<AIStatusIndicatorProps> = ({
  status,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<AIStatus | null>(null);

  const activeStatus = testResult || status;
  const isConnected = activeStatus?.status === 'connected' && activeStatus?.real_ai_active;

  const handleRunTest = async () => {
    setTesting(true);
    try {
      const res = await api.testAIConnection();
      setTestResult(res);
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      console.error('Test connection error:', err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      {/* Clean Player-Facing Trigger (No internal jargon like "Development Fallback" on the bar!) */}
      <button
        onClick={() => {
          setShowModal(true);
          setTestResult(null);
        }}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono-forensic border transition-all cursor-pointer ${
          isConnected
            ? 'text-[#65B8A7] bg-[#65B8A7]/10 border-[#65B8A7]/30 hover:bg-[#65B8A7]/20'
            : 'text-[#D5AA63] bg-[#151922] border-[#2B303A] hover:border-[#D5AA63]/50'
        }`}
        title="AI Diagnostics Console"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isConnected ? 'bg-[#65B8A7]' : 'bg-[#D5AA63] animate-pulse'
          }`}
        />
        <span className="font-medium tracking-wide">
          {isConnected ? 'AI Live' : 'AI Diagnostics'}
        </span>
      </button>

      {/* Diagnostics Modal: Technical diagnostics kept strictly inside modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090A0D]/85 backdrop-blur-md">
          <div className="bg-[#101218] border border-[#2B303A] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B303A] pb-3">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-[#D5AA63]" />
                <h3 className="font-serif-noir text-base font-bold text-[#F0F0F2]">
                  Gemini AI Diagnostics
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#656C7A] hover:text-[#F0F0F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Breakdown */}
            <div className="p-4 rounded-lg bg-[#151922] border border-[#2B303A] space-y-2.5 font-mono-forensic text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#656C7A]">CONNECTION STATUS:</span>
                <span
                  className={`px-2 py-0.5 rounded border text-[11px] font-bold ${
                    isConnected
                      ? 'text-[#65B8A7] bg-[#65B8A7]/10 border-[#65B8A7]/30'
                      : 'text-[#D5AA63] bg-[#D5AA63]/10 border-[#D5AA63]/30'
                  }`}
                >
                  {isConnected ? 'AI CONNECTED' : 'NOT CONNECTED'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#656C7A]">ACTIVE MODEL:</span>
                <span className="text-[#F0F0F2] font-semibold">
                  {activeStatus?.model || 'gemini-1.5-flash'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#656C7A]">REAL PROVIDER CALLS:</span>
                <span className={isConnected ? 'text-[#65B8A7] font-bold' : 'text-[#9BA2AE]'}>
                  {isConnected ? 'ACTIVE (Official google-genai SDK)' : 'INACTIVE'}
                </span>
              </div>
            </div>

            {/* Error or Configuration Guidance */}
            <div className="p-3.5 rounded-lg bg-[#090A0D] border border-[#2B303A] text-xs space-y-2">
              <div className="flex items-center space-x-1.5 text-[#D5AA63] font-semibold text-[11px] uppercase">
                <Key className="w-3.5 h-3.5" />
                <span>Configuration Instructions:</span>
              </div>
              <p className="text-[#9BA2AE] leading-relaxed text-[11px]">
                {activeStatus?.message ||
                  'Configure GEMINI_API_KEY in backend/.env to connect to Google Gemini AI.'}
              </p>
              {activeStatus?.help && (
                <p className="text-[10px] text-[#656C7A] font-mono-forensic">
                  {activeStatus.help}
                </p>
              )}
            </div>

            {/* Actions: Run Live Test Button & Close */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleRunTest}
                disabled={testing}
                className="px-4 py-2 bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] text-xs font-mono-forensic font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Testing Live Key...' : 'Test Connection'}</span>
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-[#1B202A] hover:bg-[#2B303A] border border-[#2B303A] text-xs font-mono-forensic text-[#F0F0F2] rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
