import React, { useState } from 'react';
import { DiscoveredEvidence } from '../types';
import { SafeImage } from '../components/SafeImage';
import { api } from '../services/api';
import { Search, X, ArrowRight, Eye, CheckCircle } from 'lucide-react';

interface EvidenceLabPageProps {
  investigationId: number;
  evidenceList: DiscoveredEvidence[];
  onEvidenceUpdated: () => void;
  onNavigate: (page: string) => void;
}

export const EvidenceLabPage: React.FC<EvidenceLabPageProps> = ({
  investigationId,
  evidenceList,
  onEvidenceUpdated,
  onNavigate,
}) => {
  const [activeModalEvidence, setActiveModalEvidence] = useState<DiscoveredEvidence | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEvidence = evidenceList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.evidence.title.toLowerCase().includes(q) ||
      item.evidence.evidence_code.toLowerCase().includes(q) ||
      item.evidence.short_description.toLowerCase().includes(q)
    );
  });

  const handleInspect = async (disc: DiscoveredEvidence) => {
    setActiveModalEvidence(disc);
    if (!disc.inspected) {
      try {
        const updated = await api.inspectEvidence(investigationId, disc.evidence_id);
        setActiveModalEvidence(updated);
        onEvidenceUpdated();
      } catch (err) {
        console.error('Failed to mark evidence inspected:', err);
      }
    }
  };

  // Plain-language derivation for inspection modal
  const getInspectionDetails = (disc: DiscoveredEvidence) => {
    const ev = disc.evidence;
    const full = ev.full_description || ev.short_description;
    return {
      whatWasFound: full.split('.')[0] + '.',
      whyItMayMatter:
        ev.significance === 'decisive'
          ? 'Decisive proof that establishes suspect opportunity or physical mechanism.'
          : ev.significance === 'exonerating'
          ? 'Exonerates certain suspects by confirming their whereabouts during the homicide.'
          : 'Provides vital context regarding motive, access, or timeline corroboration.',
    };
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2B303A] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-forensic text-[#D5AA63] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D5AA63] animate-pulse"></span>
            <span>STEP 2 • DISCOVERED EXHIBITS</span>
          </div>
          <h1 className="font-serif-noir text-2xl md:text-3xl font-bold text-[#F0F0F2]">
            Evidence
          </h1>
          <p className="text-xs text-[#9BA2AE] mt-1">
            Review physical clues and forensic documents recovered from Vale Manor.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search evidence..."
            className="w-full bg-[#151922] border border-[#2B303A] focus:border-[#D5AA63] rounded-lg px-3.5 py-2 pl-9 text-xs text-[#F0F0F2] focus:outline-none font-mono-forensic"
          />
          <Search className="w-4 h-4 text-[#656C7A] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Empty State */}
      {filteredEvidence.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#101218] border border-[#2B303A] space-y-3">
          <p className="text-sm text-[#9BA2AE]">No evidence discovered yet.</p>
          <button
            onClick={() => onNavigate('crimescene')}
            className="px-5 py-2.5 rounded-lg bg-[#D5AA63] text-[#090A0D] text-xs font-mono-forensic font-bold uppercase tracking-wider cursor-pointer"
          >
            Enter Crime Scene to Investigate
          </button>
        </div>
      ) : (
        /* Discovered Evidence Cards Grid: ONLY Name, Preview, 1-sentence description, Inspect button */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredEvidence.map((disc) => {
            const ev = disc.evidence;
            return (
              <div
                key={disc.id}
                className="rounded-xl bg-[#101218] border border-[#2B303A] hover:border-[#D5AA63]/60 transition-all overflow-hidden flex flex-col justify-between group shadow-lg"
              >
                {/* 1. Image or document preview */}
                <div className="relative aspect-[4/3] bg-[#090A0D] overflow-hidden border-b border-[#2B303A]">
                  <SafeImage
                    src={ev.image_url}
                    alt={ev.title}
                    fallbackType={ev.type === 'document' || ev.type === 'report' ? 'document' : 'evidence'}
                    fallbackTitle={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 text-[9px] font-mono-forensic bg-[#090A0D]/90 text-[#D5AA63] px-2 py-0.5 rounded border border-[#D5AA63]/30 font-bold">
                    {ev.evidence_code}
                  </span>
                  {disc.inspected && (
                    <span className="absolute top-2.5 right-2.5 text-[9px] font-mono-forensic bg-[#151922]/90 text-[#65B8A7] px-1.5 py-0.5 rounded border border-[#65B8A7]/30 flex items-center space-x-1">
                      <CheckCircle className="w-2.5 h-2.5" />
                      <span>INSPECTED</span>
                    </span>
                  )}
                </div>

                {/* Card Body: Name + 1-sentence description */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif-noir text-sm font-bold text-[#F0F0F2] group-hover:text-[#D5AA63] transition-colors line-clamp-1">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-[#9BA2AE] mt-1 line-clamp-2 leading-relaxed">
                      {ev.short_description}
                    </p>
                  </div>

                  {/* 4. Inspect Button */}
                  <button
                    onClick={() => handleInspect(disc)}
                    className="w-full py-2 rounded-lg bg-[#151922] hover:bg-[#D5AA63] text-[#F0F0F2] hover:text-[#090A0D] border border-[#2B303A] hover:border-[#D5AA63] text-xs font-mono-forensic font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Modal: Shows What was found, Why it may matter, and Continue Investigation button */}
      {activeModalEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090A0D]/85 backdrop-blur-md">
          <div className="bg-[#101218] border border-[#2B303A] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-start justify-between border-b border-[#2B303A] pb-3">
              <div>
                <span className="text-[10px] font-mono-forensic text-[#D5AA63] font-bold">
                  EXHIBIT [{activeModalEvidence.evidence.evidence_code}]
                </span>
                <h2 className="font-serif-noir text-xl font-bold text-[#F0F0F2]">
                  {activeModalEvidence.evidence.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalEvidence(null)}
                className="text-[#656C7A] hover:text-[#F0F0F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview */}
            <div className="aspect-[16/9] rounded-lg overflow-hidden border border-[#2B303A] bg-[#090A0D]">
              <SafeImage
                src={activeModalEvidence.evidence.image_url}
                alt={activeModalEvidence.evidence.title}
                fallbackType="evidence"
                fallbackTitle={activeModalEvidence.evidence.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Inspection Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#151922] border border-[#2B303A] space-y-1">
                <span className="text-[10px] font-mono-forensic text-[#F0F0F2] uppercase font-bold block">
                  WHAT WAS FOUND:
                </span>
                <p className="text-[#9BA2AE] leading-relaxed">
                  {getInspectionDetails(activeModalEvidence).whatWasFound}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#151922] border border-[#D5AA63]/30 space-y-1">
                <span className="text-[10px] font-mono-forensic text-[#D5AA63] uppercase font-bold block">
                  WHY IT MAY MATTER:
                </span>
                <p className="text-[#F0F0F2] leading-relaxed">
                  {getInspectionDetails(activeModalEvidence).whyItMayMatter}
                </p>
              </div>
            </div>

            {/* Continue Investigation Button */}
            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => setActiveModalEvidence(null)}
                className="px-4 py-2 rounded-lg bg-[#151922] hover:bg-[#1B202A] text-xs font-mono-forensic text-[#9BA2AE] cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  setActiveModalEvidence(null);
                  onNavigate('suspects');
                }}
                className="px-5 py-2.5 rounded-lg bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] text-xs font-mono-forensic font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Continue Investigation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
