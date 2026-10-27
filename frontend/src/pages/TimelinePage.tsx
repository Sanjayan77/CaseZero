import React, { useState, useEffect } from 'react';
import { TimelineEvent } from '../types';
import { api } from '../services/api';
import { Clock, CheckCircle2, AlertTriangle, Users, Search, ArrowRight } from 'lucide-react';

interface TimelinePageProps {
  investigationId: number;
  onNavigate: (page: string) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({
  investigationId,
  onNavigate,
}) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api
      .getTimeline(investigationId)
      .then((data) => {
        if (isMounted) {
          setEvents(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load timeline:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [investigationId]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#2B303A] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-forensic text-[#D5AA63] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D5AA63] animate-pulse"></span>
            <span>CRIME CHRONOLOGY RECONSTRUCTION</span>
          </div>
          <h1 className="font-serif-noir text-3xl font-bold text-[#F0F0F2]">
            Evening Timeline (19:15 – 21:00)
          </h1>
          <p className="text-xs text-[#9BA2AE] mt-1">
            Reconstruct verified facts versus conflicting suspect testimony to isolate the 10-minute homicide window.
          </p>
        </div>

        <button
          onClick={() => onNavigate('deduction')}
          className="px-4 py-2.5 rounded-lg bg-[#D9535D] hover:bg-[#c4434d] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors cursor-pointer shrink-0"
        >
          <span>Submit Accusation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono-forensic text-[#9BA2AE]">
          RECONSTRUCTING CHRONOLOGICAL SEQUENCE...
        </div>
      ) : (
        <div className="relative border-l-2 border-[#2B303A] ml-6 sm:ml-8 pl-6 sm:pl-8 space-y-8">
          {events.map((ev) => {
            const hasConflict = !!ev.conflicting_claims;

            return (
              <div key={ev.id} className="relative group">
                {/* Node Bullet on Timeline Line */}
                <div
                  className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    hasConflict
                      ? 'bg-[#151922] border-[#D9535D] text-[#D9535D] shadow-[0_0_10px_rgba(217,83,93,0.3)]'
                      : 'bg-[#151922] border-[#D5AA63] text-[#D5AA63]'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                </div>

                {/* Event Card */}
                <div className="p-5 rounded-xl bg-[#101218] border border-[#2B303A] hover:border-[#D5AA63]/50 transition-colors shadow-lg space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-mono-forensic bg-[#1B202A] text-[#D5AA63] border border-[#D5AA63]/40 px-2.5 py-0.5 rounded font-bold">
                        {ev.time_marker}
                      </span>
                      <h3 className="font-serif-noir text-lg font-bold text-[#F0F0F2]">
                        {ev.title}
                      </h3>
                    </div>

                    <span className="text-[11px] font-mono-forensic text-[#656C7A]">
                      LOC: {ev.location}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#9BA2AE] leading-relaxed">
                    {ev.description}
                  </p>

                  {/* Associated Suspects */}
                  {ev.associated_suspects.length > 0 && (
                    <div className="flex items-center space-x-2 text-xs font-mono-forensic text-[#9BA2AE]">
                      <Users className="w-3.5 h-3.5 text-[#65B8A7]" />
                      <span className="text-[#656C7A]">PERSONS PRESENT:</span>
                      <span className="text-[#F0F0F2]">
                        {ev.associated_suspects.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Conflicting Claims Highlight */}
                  {hasConflict && (
                    <div className="p-3 rounded-lg bg-[#D9535D]/10 border border-[#D9535D]/30 flex items-start space-x-2 text-xs font-mono-forensic text-[#D9535D]">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">CONTRADICTION DETECTED:</span>
                        <span>{ev.conflicting_claims}</span>
                      </div>
                    </div>
                  )}

                  {/* Supporting Evidence Codes */}
                  {ev.supporting_evidence_codes.length > 0 && (
                    <div className="flex items-center space-x-2 text-xs font-mono-forensic pt-1">
                      <Search className="w-3.5 h-3.5 text-[#D5AA63]" />
                      <span className="text-[#656C7A]">SUPPORTING FORENSIC FILES:</span>
                      <div className="flex space-x-1">
                        {ev.supporting_evidence_codes.map((code) => (
                          <span
                            key={code}
                            className="bg-[#151922] text-[#D5AA63] border border-[#2B303A] px-1.5 py-0.5 rounded text-[10px]"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
