import React, { useState } from 'react';
import { MentorGuidance } from '../types';
import {
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  HelpCircle,
  Compass,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface DetectiveMentorPanelProps {
  guidance: MentorGuidance | null;
  onNavigate: (page: string) => void;
  onRefresh?: () => void;
}

export const DetectiveMentorPanel: React.FC<DetectiveMentorPanelProps> = ({
  guidance,
  onNavigate,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeHintLevel, setActiveHintLevel] = useState<number>(1);

  if (!guidance) return null;

  const currentHintText =
    activeHintLevel === 1
      ? guidance.hints.level_1_nudge
      : activeHintLevel === 2
      ? guidance.hints.level_2_stronger
      : guidance.hints.level_3_deduction;

  return (
    <div className="rounded-xl bg-[#101218] border border-[#2B303A] overflow-hidden shadow-xl transition-all">
      {/* Mentor Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 bg-gradient-to-r from-[#151922] via-[#101218] to-[#151922] border-b border-[#2B303A] flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#1B202A] border border-[#D5AA63]/50 flex items-center justify-center text-[#D5AA63] shadow-[0_0_12px_rgba(213,170,99,0.2)]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif-noir font-bold text-sm text-[#F0F0F2]">
                Senior Detective's Guidance
              </span>
              <span className="text-xs text-[#656C7A]">•</span>
              <span className="text-[11px] font-mono-forensic text-[#D5AA63]">
                {guidance.mentor_name} ({guidance.mentor_title})
              </span>
            </div>
            <div className="text-[11px] font-mono-forensic text-[#9BA2AE]">
              CURRENT CASE STAGE: <span className="text-[#65B8A7] font-semibold">{guidance.phase}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="hidden sm:inline-block text-[11px] font-mono-forensic text-[#9BA2AE] group-hover:text-[#F0F0F2]">
            {isExpanded ? 'Collapse Guidance' : 'Open Guidance'}
          </span>
          <button className="p-1 rounded text-[#9BA2AE] group-hover:text-[#D5AA63]">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-5 space-y-5">
          {/* Active Advice & Next Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#151922] border border-[#2B303A]">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono-forensic text-[#D5AA63] uppercase font-bold tracking-wider flex items-center space-x-1">
                <Compass className="w-3 h-3" />
                <span>RECOMMENDED NEXT MOVE</span>
              </span>
              <h4 className="font-serif-noir text-sm font-bold text-[#F0F0F2]">
                {guidance.objective_title}
              </h4>
              <p className="text-xs text-[#9BA2AE] leading-relaxed">
                {guidance.objective_description}
              </p>
            </div>

            <button
              onClick={() => onNavigate(guidance.target_page)}
              className="px-4 py-2 rounded-lg bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>Take Action</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 Progressive Hint Levels */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-forensic text-[#9BA2AE] flex items-center space-x-1">
                <Lightbulb className="w-3.5 h-3.5 text-[#D5AA63]" />
                <span>INVESTIGATION HINTS (CHOOSE DEPTH):</span>
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveHintLevel(1)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono-forensic transition-colors ${
                    activeHintLevel === 1
                      ? 'bg-[#D5AA63] text-[#090A0D] font-bold'
                      : 'bg-[#151922] text-[#9BA2AE] hover:text-[#F0F0F2] border border-[#2B303A]'
                  }`}
                >
                  Hint 1: Gentle Nudge
                </button>
                <button
                  onClick={() => setActiveHintLevel(2)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono-forensic transition-colors ${
                    activeHintLevel === 2
                      ? 'bg-[#D5AA63] text-[#090A0D] font-bold'
                      : 'bg-[#151922] text-[#9BA2AE] hover:text-[#F0F0F2] border border-[#2B303A]'
                  }`}
                >
                  Hint 2: Stronger Clue
                </button>
                <button
                  onClick={() => setActiveHintLevel(3)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono-forensic transition-colors ${
                    activeHintLevel === 3
                      ? 'bg-[#D5AA63] text-[#090A0D] font-bold'
                      : 'bg-[#151922] text-[#9BA2AE] hover:text-[#F0F0F2] border border-[#2B303A]'
                  }`}
                >
                  Hint 3: Deduction Help
                </button>
              </div>
            </div>

            {/* Hint Box */}
            <div className="p-4 rounded-lg bg-[#090A0D] border border-[#D5AA63]/30 text-xs sm:text-sm text-[#F0F0F2] font-mono-forensic leading-relaxed flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-[#D5AA63]/20 text-[#D5AA63] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                {activeHintLevel}
              </div>
              <p className="flex-1 text-[#F0F0F2]">
                "{currentHintText}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
