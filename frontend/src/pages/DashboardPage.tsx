import React from 'react';
import { User, Investigation, CasePublic } from '../types';
import { Shield, Play, Search, Users, Award, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface DashboardPageProps {
  user: User | null;
  investigation: Investigation | null;
  cases: CasePublic[];
  onStartOrResumeCase: (caseId: string) => void;
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  investigation,
  cases,
  onStartOrResumeCase,
  onNavigate,
}) => {
  const activeCase = cases.find((c) => c.case_id === 'CZ-001') || cases[0];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-[#101218] to-[#151922] border border-[#2B303A]">
        <div>
          <div className="text-xs font-mono-forensic text-[#D5AA63] uppercase tracking-wider mb-1 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#65B8A7]"></span>
            <span>HOMICIDE DIVISION ACTIVE TERMINAL</span>
          </div>
          <h1 className="font-serif-noir text-2xl md:text-3xl font-bold text-[#F0F0F2]">
            Welcome back, {user ? user.username : 'Investigator'}.
          </h1>
          <p className="text-xs text-[#9BA2AE] mt-1">
            Current clearance: <span className="text-[#D5AA63]">{user?.badge_title || 'Lead Detective'}</span> • Jurisdiction: Vale Manor
          </p>
        </div>

        {investigation && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-[11px] font-mono-forensic text-[#9BA2AE]">INVESTIGATION STATUS</div>
              <div className="text-xs font-bold text-[#65B8A7] uppercase tracking-wide">
                {investigation.status.replace('_', ' ')}
              </div>
            </div>
            <button
              onClick={() => onNavigate('briefing')}
              className="px-5 py-2.5 rounded-lg bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Case Room</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Case Dossier Card */}
      {activeCase && (
        <div className="rounded-xl bg-[#101218] border border-[#2B303A] overflow-hidden shadow-2xl">
          <div className="relative h-64 md:h-80 w-full overflow-hidden">
            <img
              src="/assets/mansion_exterior.jpg"
              alt={activeCase.title}
              className="w-full h-full object-cover object-center filter brightness-50 contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101218] via-[#101218]/40 to-transparent" />

            <div className="absolute top-6 left-6 flex items-center space-x-2">
              <span className="font-mono-forensic text-xs bg-[#090A0D]/90 text-[#D5AA63] px-3 py-1 rounded border border-[#D5AA63]/40">
                ACTIVE CASE FILE • {activeCase.case_id}
              </span>
              <span className="text-xs font-mono-forensic bg-[#D9535D]/20 text-[#D9535D] border border-[#D9535D]/40 px-2.5 py-1 rounded font-bold">
                LOCKED ROOM HOMICIDE
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="font-serif-noir text-3xl md:text-4xl font-bold text-[#F0F0F2] mb-2">
                {activeCase.title}
              </h2>
              <p className="text-sm text-[#9BA2AE] max-w-3xl line-clamp-2">
                {activeCase.summary}
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono-forensic">
              <div className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A]">
                <div className="text-[#656C7A] mb-1">VICTIM IDENTITY</div>
                <div className="text-[#F0F0F2] font-bold">{activeCase.victim_name}</div>
                <div className="text-[11px] text-[#9BA2AE]">{activeCase.victim_role}</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A]">
                <div className="text-[#656C7A] mb-1">INCIDENT SCENE</div>
                <div className="text-[#F0F0F2] font-bold">{activeCase.crime_location}</div>
                <div className="text-[11px] text-[#9BA2AE]">{activeCase.crime_time_est}</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A]">
                <div className="text-[#656C7A] mb-1">EVIDENCE DISCOVERED</div>
                <div className="text-[#D5AA63] font-bold text-base">
                  {investigation ? `${investigation.discovered_count} / 14` : '10 / 14 Available'}
                </div>
                <div className="text-[11px] text-[#9BA2AE]">Forensics, Docs & Cables</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A]">
                <div className="text-[#656C7A] mb-1">DIFFICULTY RATING</div>
                <div className="text-[#65B8A7] font-bold text-base">INTERMEDIATE</div>
                <div className="text-[11px] text-[#9BA2AE]">Deterministic Deduction</div>
              </div>
            </div>

            {/* Quick Actions to Workspaces */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onStartOrResumeCase(activeCase.case_id)}
                className="px-6 py-3 rounded-lg bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <span>{investigation ? 'Open Investigation Room' : 'Open Case File'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('evidence')}
                className="px-5 py-3 rounded-lg bg-[#151922] hover:bg-[#1B202A] border border-[#2B303A] text-xs font-medium text-[#F0F0F2] flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#D5AA63]" />
                <span>Evidence Lab</span>
              </button>

              <button
                onClick={() => onNavigate('interrogation')}
                className="px-5 py-3 rounded-lg bg-[#151922] hover:bg-[#1B202A] border border-[#2B303A] text-xs font-medium text-[#F0F0F2] flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-[#65B8A7]" />
                <span>Interrogate Suspects</span>
              </button>

              <button
                onClick={() => onNavigate('board')}
                className="px-5 py-3 rounded-lg bg-[#151922] hover:bg-[#1B202A] border border-[#2B303A] text-xs font-medium text-[#F0F0F2] flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4 text-[#D9535D]" />
                <span>Evidence Board</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Investigation Card if Finished */}
      {investigation?.status === 'completed' && (
        <div className="p-6 rounded-xl bg-[#65B8A7]/10 border border-[#65B8A7]/40 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#65B8A7]/20 flex items-center justify-center text-[#65B8A7]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono-forensic text-[#65B8A7] uppercase font-bold">
                OFFICIAL VERDICT FILED
              </div>
              <div className="font-serif-noir text-xl font-bold text-[#F0F0F2]">
                Investigation Completed with Score {investigation.final_score}/100
              </div>
              <div className="text-xs text-[#9BA2AE] mt-0.5">
                The full forensic breakdown and culprit confession review is available.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('review')}
            className="px-5 py-2.5 rounded-lg bg-[#65B8A7] hover:bg-[#52a090] text-[#090A0D] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Review Solution & Debrief
          </button>
        </div>
      )}
    </div>
  );
};
