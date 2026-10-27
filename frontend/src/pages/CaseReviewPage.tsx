import React, { useState, useEffect } from 'react';
import { AccusationResult } from '../types';
import { api } from '../services/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  Shield,
  Search,
  Scale,
  ArrowRight,
  FileText,
  RotateCcw
} from 'lucide-react';

interface CaseReviewPageProps {
  investigationId: number;
  onNavigate: (page: string) => void;
}

export const CaseReviewPage: React.FC<CaseReviewPageProps> = ({
  investigationId,
  onNavigate,
}) => {
  const [results, setResults] = useState<AccusationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api
      .getResults(investigationId)
      .then((data) => {
        if (isMounted) {
          setResults(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load results:', err);
        if (isMounted) {
          setError(err.message || 'Results are sealed until accusation is filed.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [investigationId]);

  if (loading) {
    return (
      <div className="p-16 text-center text-xs font-mono-forensic text-[#9BA2AE]">
        UNSEALING CONFIDENTIAL CORONER & INVESTIGATION ARCHIVE...
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="text-sm font-mono-forensic text-[#D9535D]">{error}</div>
        <button
          onClick={() => onNavigate('deduction')}
          className="px-5 py-2.5 rounded-lg bg-[#D5AA63] text-[#090A0D] text-xs font-bold uppercase tracking-wider"
        >
          Proceed to Accusation
        </button>
      </div>
    );
  }

  const { score_breakdown } = results;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Top Score Banner */}
      <div className="p-8 rounded-xl bg-gradient-to-r from-[#101218] via-[#151922] to-[#101218] border border-[#2B303A] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-xs font-mono-forensic text-[#D5AA63]">
              <Award className="w-4 h-4" />
              <span>OFFICIAL CASE VERDICT EVALUATION</span>
            </div>
            <h1 className="font-serif-noir text-3xl md:text-4xl font-bold text-[#F0F0F2]">
              Case CZ-001: The Last Guest
            </h1>
            <p className="text-xs text-[#9BA2AE] max-w-xl">
              Investigation closed. The crown prosecutor has evaluated your evidence, timeline breakdown, and culprit accusation against canonical physical facts.
            </p>
          </div>

          {/* Large Final Score Circle */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#090A0D] border-2 border-[#D5AA63] shadow-[0_0_30px_rgba(213,170,99,0.25)] min-w-44">
            <span className="text-[10px] font-mono-forensic text-[#9BA2AE] uppercase tracking-wider mb-1">
              FINAL SCORE
            </span>
            <div className="text-5xl font-serif-noir font-bold text-[#D5AA63]">
              {results.final_score}
            </div>
            <span className="text-xs font-mono-forensic text-[#656C7A] mt-1">
              OUT OF 100 PTS
            </span>
          </div>
        </div>
      </div>

      {/* Deterministic Scoring Rubric Breakdown */}
      <div className="p-6 rounded-xl bg-[#101218] border border-[#2B303A] space-y-4">
        <h2 className="font-serif-noir text-xl font-bold text-[#F0F0F2] flex items-center space-x-2">
          <span>Scoring Rubric Breakdown</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A] text-center">
            <div className="text-[10px] font-mono-forensic text-[#656C7A] mb-1">CULPRIT</div>
            <div className="text-lg font-bold text-[#F0F0F2]">
              {score_breakdown.culprit_score}/35
            </div>
            <div className="text-[10px] font-mono-forensic text-[#65B8A7]">
              {score_breakdown.is_correct_culprit ? 'Identified' : 'Failed'}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A] text-center">
            <div className="text-[10px] font-mono-forensic text-[#656C7A] mb-1">MOTIVE</div>
            <div className="text-lg font-bold text-[#F0F0F2]">
              {score_breakdown.motive_score}/15
            </div>
            <div className="text-[10px] font-mono-forensic text-[#D5AA63]">Embezzlement</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A] text-center">
            <div className="text-[10px] font-mono-forensic text-[#656C7A] mb-1">METHOD</div>
            <div className="text-lg font-bold text-[#F0F0F2]">
              {score_breakdown.method_score}/15
            </div>
            <div className="text-[10px] font-mono-forensic text-[#D5AA63]">Poison & Thread</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A] text-center">
            <div className="text-[10px] font-mono-forensic text-[#656C7A] mb-1">TIMELINE</div>
            <div className="text-lg font-bold text-[#F0F0F2]">
              {score_breakdown.timeline_score}/15
            </div>
            <div className="text-[10px] font-mono-forensic text-[#D5AA63]">20:26 Telecom</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A] text-center">
            <div className="text-[10px] font-mono-forensic text-[#656C7A] mb-1">EVIDENCE</div>
            <div className="text-lg font-bold text-[#F0F0F2]">
              {score_breakdown.evidence_score}/15
            </div>
            <div className="text-[10px] font-mono-forensic text-[#D5AA63]">Citations</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A] text-center">
            <div className="text-[10px] font-mono-forensic text-[#656C7A] mb-1">SYNTHESIS</div>
            <div className="text-lg font-bold text-[#F0F0F2]">
              {score_breakdown.explanation_score}/5
            </div>
            <div className="text-[10px] font-mono-forensic text-[#65B8A7]">Logical Flow</div>
          </div>
        </div>

        {/* Detailed Category Remarks */}
        {score_breakdown.evaluations && (
          <div className="space-y-2 pt-2">
            {Object.entries(score_breakdown.evaluations).map(([category, remark]) => (
              <div
                key={category}
                className="p-3 rounded-lg bg-[#151922] border border-[#2B303A] flex items-start space-x-3 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-[#65B8A7] shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono-forensic uppercase font-bold text-[#D5AA63] mr-2">
                    {category}:
                  </span>
                  <span className="text-[#F0F0F2] font-mono-forensic">{String(remark)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* The Canonical Solution Revealed */}
      <div className="p-8 rounded-xl bg-[#101218] border border-[#2B303A] space-y-6">
        <div className="border-b border-[#2B303A] pb-4">
          <div className="text-xs font-mono-forensic text-[#D5AA63] uppercase tracking-wider mb-1">
            CANONICAL TRUTH UNVEILED
          </div>
          <h2 className="font-serif-noir text-2xl font-bold text-[#F0F0F2]">
            How Adrian Vale Was Murdered
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-lg bg-[#151922] border border-[#2B303A] space-y-2">
            <span className="text-[10px] font-mono-forensic text-[#D9535D] uppercase font-bold block">
              THE TRUE CULPRIT
            </span>
            <div className="font-serif-noir text-xl font-bold text-[#F0F0F2]">
              {results.actual_culprit}
            </div>
            <p className="text-xs text-[#9BA2AE] leading-relaxed">
              CFO of Vale Technologies. Orchestrated the murder after Adrian discovered the multi-million dollar fraud.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#151922] border border-[#2B303A] space-y-2">
            <span className="text-[10px] font-mono-forensic text-[#D5AA63] uppercase font-bold block">
              CANONICAL MOTIVE
            </span>
            <p className="text-xs text-[#F0F0F2] leading-relaxed">
              {results.actual_motive}
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#151922] border border-[#2B303A] space-y-2">
            <span className="text-[10px] font-mono-forensic text-[#65B8A7] uppercase font-bold block">
              LOCKED-ROOM METHOD
            </span>
            <p className="text-xs text-[#F0F0F2] leading-relaxed">
              {results.actual_method}
            </p>
          </div>
        </div>

        {/* Narrative Reconstruction */}
        <div className="p-6 rounded-lg bg-[#151922] border border-[#2B303A] space-y-3">
          <h3 className="text-xs font-mono-forensic text-[#D5AA63] uppercase tracking-wider">
            COMPLETE NARRATIVE RECONSTRUCTION
          </h3>
          <p className="text-xs sm:text-sm text-[#F0F0F2] leading-relaxed font-light">
            {results.canonical_explanation}
          </p>
        </div>

        {/* Decisive Evidence List */}
        <div className="p-5 rounded-lg bg-[#151922] border border-[#2B303A] space-y-2">
          <span className="text-[10px] font-mono-forensic text-[#D5AA63] uppercase font-bold block">
            DECISIVE PIECES OF FORENSIC PROOF
          </span>
          <div className="flex flex-wrap gap-2">
            {results.decisive_evidence.map((code) => (
              <span
                key={code}
                className="text-xs font-mono-forensic bg-[#090A0D] text-[#D5AA63] border border-[#D5AA63]/40 px-3 py-1 rounded"
              >
                EXHIBIT {code}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Suspect Exoneration Debriefs */}
      <div className="p-8 rounded-xl bg-[#101218] border border-[#2B303A] space-y-4">
        <h2 className="font-serif-noir text-xl font-bold text-[#F0F0F2]">
          Suspect Resolution Debriefs
        </h2>

        <div className="space-y-3">
          {Object.entries(results.suspect_resolutions).map(([suspectName, debrief]) => {
            const isGuilty = suspectName === results.actual_culprit;
            return (
              <div
                key={suspectName}
                className={`p-4 rounded-lg border flex items-start space-x-3 text-xs ${
                  isGuilty
                    ? 'bg-[#D9535D]/10 border-[#D9535D]/40 text-[#F0F0F2]'
                    : 'bg-[#151922] border-[#2B303A] text-[#9BA2AE]'
                }`}
              >
                {isGuilty ? (
                  <XCircle className="w-4 h-4 text-[#D9535D] shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#65B8A7] shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={`font-bold font-mono-forensic uppercase mr-2 ${isGuilty ? 'text-[#D9535D]' : 'text-[#F0F0F2]'}`}>
                    {suspectName}:
                  </span>
                  <span className="leading-relaxed">{debrief}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-[#2B303A]">
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-6 py-3 rounded-lg bg-[#151922] hover:bg-[#1B202A] border border-[#2B303A] text-xs font-mono-forensic text-[#F0F0F2] transition-colors cursor-pointer"
        >
          Return to HQ Dashboard
        </button>

        <button
          onClick={() => onNavigate('board')}
          className="px-6 py-3 rounded-lg bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors cursor-pointer"
        >
          <span>Review Evidence Board</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
