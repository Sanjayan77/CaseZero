import React, { useState } from 'react';
import { ObjectiveItem } from '../types';
import { Target, CheckCircle2, Circle, ArrowRight, ListChecks, X } from 'lucide-react';

interface ObjectiveBannerProps {
  objectives: ObjectiveItem[];
  activeObjectiveIndex?: number;
  onNavigate: (page: string) => void;
}

export const ObjectiveBanner: React.FC<ObjectiveBannerProps> = ({
  objectives,
  onNavigate,
}) => {
  const [showAllModal, setShowAllModal] = useState<boolean>(false);

  // Current active objective is the first incomplete one, or the last one if all complete
  const currentObjective =
    objectives.find((o) => !o.is_completed) || objectives[objectives.length - 1];

  const completedCount = objectives.filter((o) => o.is_completed).length;

  if (!currentObjective) return null;

  return (
    <div className="bg-[#101218] border-b border-[#2B303A] px-6 py-2.5 flex items-center justify-between text-xs font-mono-forensic">
      {/* Current Objective Pill */}
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="flex items-center space-x-1.5 text-[#D5AA63] shrink-0 font-bold">
          <Target className="w-3.5 h-3.5 text-[#D5AA63] animate-pulse" />
          <span>CURRENT OBJECTIVE [{completedCount}/7]:</span>
        </div>

        <div className="truncate text-[#F0F0F2]">
          <span className="font-semibold text-[#F0F0F2] mr-2">
            {currentObjective.title}
          </span>
          <span className="hidden md:inline text-[#9BA2AE] text-[11px]">
            — {currentObjective.description}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3 shrink-0 ml-4">
        <button
          onClick={() => setShowAllModal(true)}
          className="text-[11px] text-[#9BA2AE] hover:text-[#F0F0F2] flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <ListChecks className="w-3.5 h-3.5 text-[#65B8A7]" />
          <span className="hidden sm:inline">All Steps</span>
        </button>

        <button
          onClick={() => onNavigate(currentObjective.target_page)}
          className="px-3 py-1 rounded bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <span>Proceed</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 7-Step Investigation Roadmap Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090A0D]/90 backdrop-blur-md">
          <div className="bg-[#101218] border border-[#2B303A] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B303A] pb-3">
              <div className="flex items-center space-x-2 text-[#D5AA63]">
                <Target className="w-5 h-5" />
                <h3 className="font-serif-noir text-lg font-bold text-[#F0F0F2]">
                  Investigation Roadmap (7 Objectives)
                </h3>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-1 rounded text-[#9BA2AE] hover:text-[#F0F0F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {objectives.map((obj) => (
                <div
                  key={obj.id}
                  onClick={() => {
                    setShowAllModal(false);
                    onNavigate(obj.target_page);
                  }}
                  className={`p-3 rounded-lg border flex items-start space-x-3 transition-colors cursor-pointer ${
                    obj.is_completed
                      ? 'bg-[#151922] border-[#65B8A7]/30 text-[#9BA2AE]'
                      : 'bg-[#1B202A] border-[#D5AA63]/50 text-[#F0F0F2]'
                  }`}
                >
                  {obj.is_completed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#65B8A7] shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#D5AA63] shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{obj.title}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono-forensic ${
                          obj.is_completed
                            ? 'bg-[#65B8A7]/20 text-[#65B8A7]'
                            : 'bg-[#D5AA63]/20 text-[#D5AA63]'
                        }`}
                      >
                        {obj.is_completed ? 'DONE' : 'ACTIVE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9BA2AE] mt-0.5">
                      {obj.description}
                    </p>
                    <div className="text-[10px] text-[#656C7A] mt-1 font-mono-forensic">
                      Why it matters: {obj.importance}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
