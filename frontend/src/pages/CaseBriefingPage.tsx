import React from 'react';
import { CaseDetail, Investigation } from '../types';
import { FileText, Search, Users, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CaseBriefingPageProps {
  caseDetail: CaseDetail | null;
  investigation: Investigation | null;
  onNavigate: (page: string) => void;
}

export const CaseBriefingPage: React.FC<CaseBriefingPageProps> = ({
  caseDetail,
  investigation,
  onNavigate,
}) => {
  if (!caseDetail) {
    return (
      <div className="p-12 text-center text-xs font-mono-forensic text-[#9BA2AE]">
        LOADING CLASSIFIED BRIEFING FILE...
      </div>
    );
  }

  const initialFactLines = caseDetail.initial_facts.split('\n').filter(Boolean);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2B303A] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-forensic text-[#D5AA63] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D5AA63] animate-pulse"></span>
            <span>CASE DOSSIER: {caseDetail.case_id}</span>
            <span>•</span>
            <span className="text-[#9BA2AE]">INCIDENT BRIEFING</span>
          </div>
          <h1 className="font-serif-noir text-3xl sm:text-4xl font-bold text-[#F0F0F2]">
            {caseDetail.title}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('evidence')}
            className="px-4 py-2.5 rounded-lg bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Examine Evidence</span>
          </button>
          <button
            onClick={() => onNavigate('interrogation')}
            className="px-4 py-2.5 rounded-lg bg-[#151922] hover:bg-[#1B202A] border border-[#2B303A] text-xs font-medium text-[#F0F0F2] flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-[#65B8A7]" />
            <span>Interrogate</span>
          </button>
        </div>
      </div>

      {/* Crime Scene Photo & Core Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Crime Scene Visual Display */}
        <div className="lg:col-span-7 rounded-xl overflow-hidden border border-[#2B303A] shadow-2xl relative group bg-[#101218]">
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src="/assets/study_crime_scene.jpg"
              alt="Crime Scene: Adrian Vale Private Study"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-transparent to-transparent opacity-80" />
            <div className="absolute top-4 left-4">
              <span className="text-[11px] font-mono-forensic bg-[#090A0D]/90 text-[#D5AA63] px-2.5 py-1 rounded border border-[#D5AA63]/40">
                SCENE RECONSTRUCTION: STUDY ROOM
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono-forensic">
              <span className="text-[#F0F0F2] bg-[#101218]/90 px-2.5 py-1 rounded border border-[#2B303A]">
                EXHIBIT 1: FORENSIC PERIMETER
              </span>
              <span className="text-[#65B8A7] bg-[#101218]/90 px-2.5 py-1 rounded border border-[#2B303A]">
                STATUS: VERIFIED SEALED
              </span>
            </div>
          </div>

          <div className="p-6 bg-[#101218] border-t border-[#2B303A]">
            <h3 className="text-xs font-mono-forensic text-[#D5AA63] uppercase tracking-wider mb-2">
              SCENE COMMAND SUMMARY
            </h3>
            <p className="text-sm text-[#9BA2AE] leading-relaxed">
              Adrian Vale was discovered slumped beside his mahogany desk inside his locked second-floor study. A crystal tumbler of vintage scotch had spilled across financial documents. Initial inspection revealed the heavy brass deadbolt was thrown into the strike plate from the inside.
            </p>
          </div>
        </div>

        {/* Forensic Metadata & Incident Parameters */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-[#101218] border border-[#2B303A] space-y-4">
            <h3 className="text-xs font-mono-forensic text-[#D5AA63] uppercase tracking-wider border-b border-[#2B303A] pb-2 flex items-center justify-between">
              <span>CASE METADATA</span>
              <span className="text-[#656C7A]">CONFIDENTIAL</span>
            </h3>

            <div className="space-y-3 text-xs font-mono-forensic">
              <div>
                <span className="text-[#656C7A] block">DECEASED:</span>
                <span className="text-[#F0F0F2] font-semibold text-sm">{caseDetail.victim_name}</span>
                <span className="text-[#9BA2AE] text-[11px] block">{caseDetail.victim_role}</span>
              </div>

              <div>
                <span className="text-[#656C7A] block">LOCATION OF DEATH:</span>
                <span className="text-[#F0F0F2] font-medium">{caseDetail.crime_location}</span>
              </div>

              <div>
                <span className="text-[#656C7A] block">ESTIMATED TIME OF MORTALITY:</span>
                <span className="text-[#D9535D] font-bold">{caseDetail.crime_time_est}</span>
              </div>

              <div>
                <span className="text-[#656C7A] block">DIFFICULTY CLASSIFICATION:</span>
                <span className="text-[#65B8A7] font-bold">{caseDetail.difficulty}</span>
              </div>
            </div>
          </div>

          {/* Investigation Objective */}
          <div className="p-6 rounded-xl bg-[#151922] border border-[#2B303A] space-y-3">
            <div className="flex items-center space-x-2 text-[#D9535D] text-xs font-mono-forensic font-bold uppercase">
              <ShieldAlert className="w-4 h-4" />
              <span>PRIMARY INVESTIGATIVE OBJECTIVE</span>
            </div>
            <p className="text-xs text-[#F0F0F2] leading-relaxed">
              {caseDetail.objective}
            </p>
          </div>
        </div>
      </div>

      {/* Initial Established Facts */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#101218] border border-[#2B303A]">
        <h3 className="font-serif-noir text-xl font-bold text-[#F0F0F2] mb-4 flex items-center space-x-2">
          <span>Initial Known Chronology & Forensic Facts</span>
        </h3>

        <div className="space-y-3">
          {initialFactLines.map((line, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-[#151922] border border-[#2B303A] flex items-start space-x-3 text-xs sm:text-sm text-[#F0F0F2] font-mono-forensic"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D5AA63] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{line}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => onNavigate('evidence')}
            className="px-6 py-3 rounded-lg bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <span>Proceed to Evidence Lab</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
