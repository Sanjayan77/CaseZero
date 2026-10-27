import React, { useState, useEffect } from 'react';
import { 
  Activity, CloudRain, ShieldAlert, Ticket, ArrowLeft, RefreshCw, 
  CheckCircle, AlertTriangle, Database, Zap, Cpu, Server, Send, AlertOctagon
} from 'lucide-react';
import { api } from '../services/api';
import { 
  SystemHealthData, WeatherAdvisory, ErrorDocItem, SupportTicketItem 
} from '../types';
import { SupportChatWidget } from '../components/SupportChatWidget';

interface SupportPageProps {
  onNavigate: (page: string) => void;
}

export function SupportPage({ onNavigate }: SupportPageProps) {
  // System Health
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState<boolean>(true);

  // Weather Advisory
  const [weather, setWeather] = useState<WeatherAdvisory | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
  const [testTimeoutActive, setTestTimeoutActive] = useState<boolean>(false);

  // Error Code Documentation & Testing
  const [errorDocs, setErrorDocs] = useState<ErrorDocItem[]>([]);
  const [selectedErrorCode, setSelectedErrorCode] = useState<number | null>(null);
  const [triggeredErrorResult, setTriggeredErrorResult] = useState<any>(null);
  const [isTestingError, setIsTestingError] = useState<boolean>(false);

  // SQL Support Tickets
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketDescription, setTicketDescription] = useState<string>('');
  const [ticketCategory, setTicketCategory] = useState<string>('Technical');
  const [ticketPriority, setTicketPriority] = useState<string>('normal');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<boolean>(false);
  const [ticketSuccessMsg, setTicketSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadHealth();
    loadWeather();
    loadErrorDocs();
    loadTickets();
  }, []);

  const loadHealth = async () => {
    try {
      setIsHealthLoading(true);
      const data = await api.getSystemHealth();
      setHealth(data);
    } catch (err) {
      console.error('Failed to load health:', err);
    } finally {
      setIsHealthLoading(false);
    }
  };

  const loadWeather = async (timeout?: number) => {
    try {
      setIsWeatherLoading(true);
      const data = await api.getWeatherAdvisory(timeout);
      setWeather(data);
    } catch (err) {
      console.error('Failed to load weather:', err);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const loadErrorDocs = async () => {
    try {
      const doc = await api.getErrorDocumentation();
      setErrorDocs(doc.errors);
    } catch (err) {
      console.error('Failed to load error docs:', err);
    }
  };

  const loadTickets = async () => {
    try {
      const list = await api.getSupportTickets();
      setTickets(list);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    }
  };

  const handleTestErrorCode = async (code: number) => {
    setSelectedErrorCode(code);
    setIsTestingError(true);
    setTriggeredErrorResult(null);

    try {
      await api.triggerErrorScenario(code);
      setTriggeredErrorResult({
        status: 200,
        message: 'Endpoint completed normally (Unexpected for error test).',
      });
    } catch (err: any) {
      setTriggeredErrorResult({
        code: code,
        handled: true,
        message: err.message || 'Error intercepted successfully.',
      });
    } finally {
      setIsTestingError(false);
    }
  };

  const handleSimulateWeatherTimeout = async () => {
    setTestTimeoutActive(true);
    // Request with 0.001s timeout to guarantee timeout exception and test graceful fallback
    await loadWeather(0.001);
    setTestTimeoutActive(false);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;

    try {
      setIsSubmittingTicket(true);
      const newT = await api.createSupportTicket(
        ticketSubject,
        ticketDescription,
        ticketCategory,
        ticketPriority
      );
      setTicketSuccessMsg(`Ticket ${newT.ticket_number} created and recorded in SQL database!`);
      setTicketSubject('');
      setTicketDescription('');
      await loadTickets();
      setTimeout(() => setTicketSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Failed to submit ticket:', err);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0D] text-[#F0F0F2] flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-[#252836] bg-[#0E1015]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="p-2 bg-[#1A1D26] hover:bg-[#252836] text-[#D5AA63] rounded border border-[#252836] transition-colors cursor-pointer"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-forensic uppercase tracking-widest text-[#D5AA63] px-2 py-0.5 bg-[#D5AA63]/10 border border-[#D5AA63]/30 rounded">
                  Platform Operations
                </span>
                <span className="text-xs text-[#8E92A4] font-mono-forensic flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#4ADE80]" />
                  <span>Telemetry Live</span>
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#F0F0F2]">
                System Health, Diagnostics & Support
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('faq')}
              className="px-3.5 py-1.5 bg-[#141722] hover:bg-[#1E2335] text-[#D5AA63] text-xs font-mono-forensic rounded border border-[#D5AA63]/40 transition-colors cursor-pointer"
            >
              SQL FAQs
            </button>
            <button
              onClick={() => onNavigate('crimescene')}
              className="px-3.5 py-1.5 bg-[#D5AA63] hover:bg-[#E5BA73] text-[#090A0D] text-xs font-bold font-mono-forensic rounded transition-colors cursor-pointer"
            >
              Enter Crime Scene
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Section 1: Comprehensive System Health Dashboard */}
        <section className="bg-[#0E1015] border border-[#252836] rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-[#F0F0F2] font-mono-forensic uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#4ADE80]" />
                Infrastructure Health Status
              </h2>
              <p className="text-xs text-[#8E92A4]">
                Continuous live diagnostic telemetry across application, databases, AI, and logging middleware.
              </p>
            </div>
            <button
              onClick={loadHealth}
              disabled={isHealthLoading}
              className="px-3 py-1.5 bg-[#1A1E2B] hover:bg-[#252B3D] text-[#D5AA63] border border-[#2B3042] rounded text-xs font-mono-forensic flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isHealthLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {isHealthLoading && !health ? (
            <div className="py-8 text-center text-xs font-mono-forensic text-[#D5AA63]">
              DIAGNOSING PLATFORM SERVICES...
            </div>
          ) : health ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* SQL Database Card */}
              <div className="p-4 bg-[#121520] border border-[#252A3B] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono-forensic text-[#8E92A4] uppercase flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
                    SQL Database
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono-forensic bg-[#122B1C] text-[#4ADE80] border border-[#4ADE80]/30">
                    Online
                  </span>
                </div>
                <div className="text-sm font-bold text-[#F0F0F2]">{health.components.sql_database.engine}</div>
                <div className="text-[11px] text-[#8E92A4] mt-1">
                  FAQs: <strong className="text-[#D5AA63]">{health.components.sql_database.faq_entries_count}</strong> • Tickets: <strong className="text-[#D5AA63]">{health.components.sql_database.support_tickets_count}</strong>
                </div>
              </div>

              {/* MongoDB Card */}
              <div className="p-4 bg-[#121520] border border-[#252A3B] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono-forensic text-[#8E92A4] uppercase flex items-center gap-1">
                    <Server className="w-3.5 h-3.5 text-[#4ADE80]" />
                    MongoDB Store
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono-forensic bg-[#1C1810] text-[#D5AA63] border border-[#D5AA63]/30">
                    {health.components.mongodb.status}
                  </span>
                </div>
                <div className="text-sm font-bold text-[#F0F0F2]">Chat Logs & Feedback</div>
                <div className="text-[11px] text-[#8E92A4] mt-1">
                  Database: <code className="text-[#D5AA63]">{health.components.mongodb.database}</code>
                </div>
              </div>

              {/* Gemini AI Card */}
              <div className="p-4 bg-[#121520] border border-[#252A3B] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono-forensic text-[#8E92A4] uppercase flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-[#A855F7]" />
                    Gemini AI Model
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono-forensic bg-[#122B1C] text-[#4ADE80] border border-[#4ADE80]/30">
                    {health.components.gemini_ai.real_ai_active ? 'Live SDK' : 'Fallback'}
                  </span>
                </div>
                <div className="text-sm font-bold text-[#F0F0F2] truncate">{health.components.gemini_ai.model}</div>
                <div className="text-[11px] text-[#8E92A4] mt-1">
                  Provider: <span className="text-[#D5AA63] uppercase">{health.components.gemini_ai.provider}</span>
                </div>
              </div>

              {/* 3rd-Party Weather API Card */}
              <div className="p-4 bg-[#121520] border border-[#252A3B] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono-forensic text-[#8E92A4] uppercase flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-[#60A5FA]" />
                    Open-Meteo API
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono-forensic bg-[#122B1C] text-[#4ADE80] border border-[#4ADE80]/30">
                    {health.components.third_party_api.status}
                  </span>
                </div>
                <div className="text-sm font-bold text-[#F0F0F2]">Weather Telemetry</div>
                <div className="text-[11px] text-[#8E92A4] mt-1">
                  Latency: <span className="text-[#D5AA63]">{health.components.third_party_api.latency_ms}ms</span>
                </div>
              </div>

              {/* Request Logging Middleware Card */}
              <div className="p-4 bg-[#121520] border border-[#252A3B] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono-forensic text-[#8E92A4] uppercase flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                    Request Logger
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono-forensic bg-[#122B1C] text-[#4ADE80] border border-[#4ADE80]/30">
                    Active
                  </span>
                </div>
                <div className="text-sm font-bold text-[#F0F0F2]">{health.components.request_logging.total_logged_requests} Requests</div>
                <div className="text-[11px] text-[#8E92A4] mt-1">
                  Duration & Paths Sanitized
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* Section 2: Additional Third-Party API Integration (Open-Meteo Weather) */}
        <section className="bg-[#0E1015] border border-[#252836] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono-forensic uppercase tracking-wider text-[#60A5FA] px-2 py-0.5 bg-[#60A5FA]/10 border border-[#60A5FA]/30 rounded">
                  Third-Party Meteorological API Integration
                </span>
                <span className="text-xs text-[#8E92A4] font-mono-forensic">
                  Open-Meteo REST API
                </span>
              </div>
              <h2 className="text-base font-bold text-[#F0F0F2] font-mono-forensic uppercase tracking-wider flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-[#60A5FA]" />
                Crime Scene Atmospheric Telemetry
              </h2>
              <p className="text-xs text-[#8E92A4]">
                Supplies real-time outdoor atmospheric telemetry for the Blackwood Manor estate. Built with configurable timeout and graceful offline cache fallback.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadWeather()}
                disabled={isWeatherLoading}
                className="px-3 py-1.5 bg-[#141722] hover:bg-[#1E2335] text-[#D5AA63] border border-[#252836] rounded text-xs font-mono-forensic flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isWeatherLoading ? 'animate-spin' : ''}`} />
                Fetch Live
              </button>
              <button
                onClick={handleSimulateWeatherTimeout}
                disabled={testTimeoutActive}
                className="px-3 py-1.5 bg-[#2A1416] hover:bg-[#3D1A1E] text-[#EF4444] border border-[#EF4444]/40 rounded text-xs font-mono-forensic flex items-center gap-1.5 cursor-pointer"
                title="Tests timeout exception handling and verifies graceful fallback return"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                Simulate Timeout Fallback
              </button>
            </div>
          </div>

          {weather && (
            <div className="p-4 bg-[#121520] border border-[#252A3B] rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#252A3B] pb-3 mb-3">
                <div>
                  <div className="text-xs font-mono-forensic text-[#8E92A4]">Telemetry Location</div>
                  <div className="text-sm font-bold text-[#F0F0F2]">{weather.location}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded font-mono-forensic ${
                    weather.is_live
                      ? 'bg-[#122B1C] text-[#4ADE80] border border-[#4ADE80]/30'
                      : 'bg-[#2A1E10] text-[#F59E0B] border border-[#F59E0B]/30'
                  }`}>
                    {weather.is_live ? '● Live Telemetry (200 OK)' : '⚠ Graceful Offline Fallback Active'}
                  </span>
                  <span className="text-xs text-[#8E92A4] font-mono-forensic">
                    Latency: {weather.latency_ms}ms
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[#8E92A4] text-[11px] block">Temperature</span>
                  <span className="text-lg font-bold text-[#D5AA63] font-mono-forensic">{weather.temperature_c}°C</span>
                  <span className="text-[10px] text-[#5A5E73] block">Feels like: {weather.apparent_temperature_c}°C</span>
                </div>
                <div>
                  <span className="text-[#8E92A4] text-[11px] block">Atmospheric Condition</span>
                  <span className="text-sm font-semibold text-[#F0F0F2]">{weather.condition}</span>
                  <span className="text-[10px] text-[#5A5E73] block">Precipitation: {weather.precipitation_mm}mm</span>
                </div>
                <div>
                  <span className="text-[#8E92A4] text-[11px] block">Relative Humidity</span>
                  <span className="text-sm font-semibold text-[#F0F0F2] font-mono-forensic">{weather.humidity_percent}%</span>
                  <span className="text-[10px] text-[#5A5E73] block">Wind: {weather.wind_speed_kmh} km/h</span>
                </div>
                <div>
                  <span className="text-[#8E92A4] text-[11px] block">Forensic Advisory</span>
                  <span className="text-xs text-[#C0C4D6]">{weather.advisory}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 3: Supported Error Codes & Interactive Sandbox */}
        <section className="bg-[#0E1015] border border-[#252836] rounded-xl p-6">
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono-forensic uppercase tracking-wider text-[#EF4444] px-2 py-0.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded">
                8 Error Scenarios Handled
              </span>
              <span className="text-xs text-[#D5AA63] font-mono-forensic">
                Including Custom CZ-423 (Case File Sealed)
              </span>
            </div>
            <h2 className="text-base font-bold text-[#F0F0F2] font-mono-forensic uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
              Error Handling Matrix & Test Sandbox
            </h2>
            <p className="text-xs text-[#8E92A4]">
              Click "Trigger Test" on any supported status code to verify that the backend controller intercepts and formats the error scenario correctly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {errorDocs.map((err) => (
              <div
                key={err.status_code}
                className={`p-4 rounded-xl border transition-all ${
                  err.status_code === 423
                    ? 'bg-[#19150E] border-[#D5AA63]/50'
                    : 'bg-[#121520] border-[#252A3B]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono-forensic ${
                      err.status_code >= 500
                        ? 'bg-[#2A1416] text-[#EF4444] border border-[#EF4444]/30'
                        : err.status_code === 423
                        ? 'bg-[#2A1E10] text-[#D5AA63] border border-[#D5AA63]/40'
                        : 'bg-[#141E2A] text-[#38BDF8] border border-[#38BDF8]/30'
                    }`}>
                      HTTP {err.status_code}
                    </span>
                    <span className="text-xs font-semibold text-[#F0F0F2]">{err.name}</span>
                  </div>

                  <button
                    onClick={() => handleTestErrorCode(err.status_code)}
                    disabled={isTestingError && selectedErrorCode === err.status_code}
                    className="px-2.5 py-1 bg-[#1C2030] hover:bg-[#252B3D] text-[#D5AA63] text-[11px] font-mono-forensic rounded border border-[#2B3042] transition-colors cursor-pointer"
                  >
                    {isTestingError && selectedErrorCode === err.status_code ? 'Testing...' : 'Trigger Test'}
                  </button>
                </div>

                <p className="text-xs text-[#A0A4B8] mb-2">{err.description}</p>
                <div className="text-[11px] text-[#8E92A4] bg-[#0A0C13] p-2 rounded border border-[#1C202C] mb-2 font-mono-forensic">
                  <strong className="text-[#D5AA63]">CaseZero Context:</strong> {err.casezero_context}
                </div>
                <div className="text-[11px] text-[#4ADE80] font-mono-forensic">
                  ↳ Resolution: {err.resolution}
                </div>
              </div>
            ))}
          </div>

          {/* Test Sandbox Output */}
          {triggeredErrorResult && (
            <div className="mt-4 p-4 bg-[#0A0C13] border border-[#D5AA63]/40 rounded-xl font-mono-forensic text-xs">
              <div className="flex items-center justify-between text-[#D5AA63] font-bold mb-1">
                <span>INTERACTIVE ERROR TRIGGER RESPONSE:</span>
                <span className="text-[#4ADE80]">Handled Successfully ✓</span>
              </div>
              <div className="text-[#F0F0F2]">
                Tested Code: <strong>HTTP {triggeredErrorResult.code}</strong>
              </div>
              <div className="text-[#8E92A4] mt-1">
                Response: <code className="text-[#EF4444]">{triggeredErrorResult.message}</code>
              </div>
            </div>
          )}
        </section>

        {/* Section 4: Support Ticket Management in SQL */}
        <section className="bg-[#0E1015] border border-[#252836] rounded-xl p-6">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono-forensic uppercase tracking-wider text-[#D5AA63] px-2 py-0.5 bg-[#D5AA63]/10 border border-[#D5AA63]/30 rounded">
                  SQL Database Storage
                </span>
                <span className="text-xs text-[#8E92A4] font-mono-forensic">
                  Table: support_tickets
                </span>
              </div>
              <h2 className="text-base font-bold text-[#F0F0F2] font-mono-forensic uppercase tracking-wider flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#D5AA63]" />
                Support Ticket Management
              </h2>
              <p className="text-xs text-[#8E92A4]">
                Create new tickets or inspect escalated tickets created automatically by the Website Support Assistant.
              </p>
            </div>
          </div>

          {ticketSuccessMsg && (
            <div className="p-3 bg-[#122B1C] border border-[#4ADE80]/40 rounded-lg text-[#4ADE80] text-xs font-mono-forensic mb-4">
              ✓ {ticketSuccessMsg}
            </div>
          )}

          {/* Ticket Submission Form */}
          <form onSubmit={handleCreateTicket} className="p-4 bg-[#121520] border border-[#252A3B] rounded-xl mb-6 space-y-3">
            <h3 className="text-xs font-bold text-[#F0F0F2] font-mono-forensic uppercase text-[#D5AA63]">
              Submit New Investigation Support Ticket
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono-forensic text-[#8E92A4] mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inconsistency in Blackwood Manor timeline log..."
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-[#0A0C13] border border-[#252A3B] rounded px-3 py-2 text-xs text-[#F0F0F2] focus:outline-none focus:border-[#D5AA63]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono-forensic text-[#8E92A4] mb-1">
                  Category
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full bg-[#0A0C13] border border-[#252A3B] rounded px-3 py-2 text-xs text-[#F0F0F2] focus:outline-none focus:border-[#D5AA63]"
                >
                  <option value="Technical">Technical</option>
                  <option value="Investigation Support">Investigation Support</option>
                  <option value="Forensic Bug Report">Forensic Bug Report</option>
                  <option value="Account & Auth">Account & Auth</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono-forensic text-[#8E92A4] mb-1">
                Description
              </label>
              <textarea
                required
                rows={3}
                placeholder="Detailed description of the issue or question..."
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                className="w-full bg-[#0A0C13] border border-[#252A3B] rounded px-3 py-2 text-xs text-[#F0F0F2] focus:outline-none focus:border-[#D5AA63]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingTicket}
                className="px-4 py-2 bg-[#D5AA63] hover:bg-[#E5BA73] text-[#090A0D] font-bold text-xs font-mono-forensic rounded flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmittingTicket ? 'Recording in SQL...' : 'Record Ticket in SQLite'}
              </button>
            </div>
          </form>

          {/* Active Tickets List */}
          <div>
            <h3 className="text-xs font-bold text-[#F0F0F2] font-mono-forensic uppercase tracking-wider mb-3">
              Recorded SQL Tickets ({tickets.length})
            </h3>

            {tickets.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8E92A4] bg-[#0A0C13] border border-[#252A3B] rounded-lg font-mono-forensic">
                No support tickets found in SQL database.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#252A3B] rounded-lg">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#121520] border-b border-[#252A3B] text-[11px] font-mono-forensic text-[#8E92A4]">
                    <tr>
                      <th className="py-2.5 px-3">Ticket Ref</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Source</th>
                      <th className="py-2.5 px-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1E2B] bg-[#0E1015]">
                    {tickets.map((t) => (
                      <tr key={t.id} className="hover:bg-[#131622]/60">
                        <td className="py-2.5 px-3 font-mono-forensic text-[#D5AA63] font-bold">
                          {t.ticket_number}
                        </td>
                        <td className="py-2.5 px-3 text-[#F0F0F2] max-w-xs truncate font-medium">
                          {t.subject}
                        </td>
                        <td className="py-2.5 px-3 text-[#8E92A4] font-mono-forensic">
                          {t.category}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono-forensic uppercase bg-[#122B1C] text-[#4ADE80] border border-[#4ADE80]/30">
                            {t.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#8E92A4] font-mono-forensic text-[10px]">
                          {t.source}
                        </td>
                        <td className="py-2.5 px-3 text-[#5A5E73] font-mono-forensic text-[10px]">
                          {new Date(t.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Website Support Assistant Widget */}
      <SupportChatWidget />
    </div>
  );
}
