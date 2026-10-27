import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, Database, ArrowLeft, Bot, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { FAQItem } from '../types';
import { SupportChatWidget } from '../components/SupportChatWidget';

interface FAQPageProps {
  onNavigate: (page: string) => void;
}

export function FAQPage({ onNavigate }: FAQPageProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setIsLoading(true);
        const data = await api.getFAQs();
        setFaqs(data);
        setFilteredFaqs(data);
        if (data.length > 0) {
          setExpandedId(data[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load SQL FAQs:', err);
        setError('Unable to load FAQ entries from the SQL database.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  useEffect(() => {
    let result = faqs;
    if (selectedCategory !== 'All') {
      result = result.filter((f) => f.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      );
    }
    setFilteredFaqs(result);
  }, [selectedCategory, searchTerm, faqs]);

  const categories = ['All', ...Array.from(new Set(faqs.map((f) => f.category)))];

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
              title="Return to CaseZero Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-forensic uppercase tracking-widest text-[#D5AA63] px-2 py-0.5 bg-[#D5AA63]/10 border border-[#D5AA63]/30 rounded">
                  SQL Knowledge Base
                </span>
                <span className="text-xs text-[#8E92A4] flex items-center gap-1 font-mono-forensic">
                  <Database className="w-3 h-3 text-[#4ADE80]" />
                  <span>SQLite Verified</span>
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#F0F0F2]">
                Frequently Asked Questions
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('support')}
              className="px-3.5 py-1.5 bg-[#141722] hover:bg-[#1E2335] text-[#D5AA63] text-xs font-mono-forensic rounded border border-[#D5AA63]/40 transition-colors cursor-pointer"
            >
              System Health & Diagnostics
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

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Intro Banner */}
        <div className="mb-8 p-6 bg-[#0E1015] border border-[#252836] rounded-xl relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#D5AA63]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F0F0F2] mb-2 font-mono-forensic tracking-wide">
              Official Forensic Knowledge Base
            </h2>
            <p className="text-xs sm:text-sm text-[#8E92A4] leading-relaxed">
              Every entry below is queried dynamically in real time from the persistent SQL database.
              Our integrated Website Support Assistant uses this identical verified knowledge base to
              ground all AI responses with confirmed forensic accuracy.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8E92A4] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search across questions, forensic clues, or error codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#090A0D] border border-[#252836] rounded-lg text-xs text-[#F0F0F2] placeholder-[#5A5E73] focus:outline-none focus:border-[#D5AA63]"
              />
            </div>
            <div className="text-xs font-mono-forensic text-[#8E92A4] self-center">
              Found: <strong className="text-[#D5AA63]">{filteredFaqs.length}</strong> entries
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-forensic transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#D5AA63] text-[#090A0D] font-bold shadow-lg shadow-[#D5AA63]/20'
                    : 'bg-[#141722] text-[#8E92A4] hover:text-[#F0F0F2] border border-[#252836]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center text-xs font-mono-forensic text-[#D5AA63]">
            QUERYING SQL DATABASE (faq_entries TABLE)...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-[#2A1416] border border-[#EF4444]/40 rounded-lg text-[#EF4444] text-xs font-mono-forensic mb-6">
            {error}
          </div>
        )}

        {/* FAQ Accordion List */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8E92A4] bg-[#0E1015] border border-[#252836] rounded-lg font-mono-forensic">
                No matching FAQ entries found for "{searchTerm}". Try another search term or ask the Support Assistant.
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = expandedId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-[#252836] bg-[#0E1015] rounded-xl overflow-hidden transition-all duration-200 hover:border-[#383D52]"
                  >
                    <button
                      onClick={() => toggleExpand(faq.id)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#131620]/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="p-1.5 bg-[#D5AA63]/10 text-[#D5AA63] rounded border border-[#D5AA63]/30 mt-0.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono-forensic uppercase tracking-wider text-[#D5AA63] px-2 py-0.2 bg-[#D5AA63]/5 rounded border border-[#D5AA63]/20">
                              {faq.category}
                            </span>
                            <span className="text-[10px] text-[#5A5E73] font-mono-forensic">
                              SQL Record #{faq.id}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-[#F0F0F2]">
                            {faq.question}
                          </h3>
                        </div>
                      </div>

                      <div className="text-[#8E92A4] flex-shrink-0">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#D5AA63]" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-2 border-t border-[#1C202C] bg-[#0A0C12] text-xs text-[#C0C4D6] leading-relaxed">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#4ADE80] font-mono-forensic mb-2">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Confirmed SQL Knowledge Base Record</span>
                        </div>
                        <p className="whitespace-pre-line text-[13px]">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer Escalation Card */}
        <div className="mt-12 p-6 bg-[#121522] border border-[#2B3042] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#F0F0F2] font-mono-forensic flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#D5AA63]" />
              Still have an unresolved inquiry?
            </h4>
            <p className="text-xs text-[#8E92A4] mt-1">
              Ask our live Website Support Assistant in the bottom right corner or log an official support ticket.
            </p>
          </div>
          <button
            onClick={() => onNavigate('support')}
            className="px-4 py-2 bg-[#D5AA63] hover:bg-[#E5BA73] text-[#090A0D] font-bold text-xs font-mono-forensic rounded-lg transition-colors cursor-pointer"
          >
            Open Support Portal
          </button>
        </div>
      </main>

      {/* Floating Website Support Assistant Widget */}
      <SupportChatWidget />
    </div>
  );
}
