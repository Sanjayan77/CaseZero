import React, { useState } from 'react';
import { BookOpen, X, Shield, Search, HelpCircle, CheckCircle2 } from 'lucide-react';

interface DetectiveHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DetectiveHandbookModal: React.FC<DetectiveHandbookModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'glossary' | 'howToPlay'>('glossary');

  if (!isOpen) return null;

  const glossaryTerms = [
    {
      term: 'Alibi',
      definition: "A suspect's formal account of where they were and what they were doing at the time the crime occurred.",
      tip: "Always check whether an alibi is verified by an independent witness or physical telemetry (like phone records)."
    },
    {
      term: 'Contradiction',
      definition: "Two statements or facts that cannot both be true at the same time.",
      tip: "When a suspect claims they were on a call until 8:42 PM, but telecom data shows it disconnected at 8:26 PM, you have caught a contradiction."
    },
    {
      term: 'Motive',
      definition: "The underlying psychological or financial reason why someone would commit the murder.",
      tip: "In CaseZero, motives are grounded in facts like embezzlement, divorce settlements, or fear of exposure."
    },
    {
      term: 'Opportunity',
      definition: "Whether a person was physically in the position and time window to commit the deed.",
      tip: "Look at the critical 8:25 PM to 8:35 PM window to see who was unaccounted for."
    },
    {
      term: 'Forensic Evidence',
      definition: "Physical and chemical findings verified through scientific analysis (toxicology, lock wear, shoe impressions).",
      tip: "Forensic evidence provides objective truth that suspects cannot easily talk their way out of."
    },
    {
      term: 'Corroboration',
      definition: "Independent evidence or witness testimony that confirms and strengthens a claim.",
      tip: "When Evelyn and Clara both confirm they were in the conservatory arguing, their testimonies corroborate each other."
    },
    {
      term: 'Red Herring',
      definition: "A clue that appears suspicious or dramatic, but ultimately leads away from the true killer.",
      tip: "Adrian's draft pre-nuptial agreement (EV-09) seems suspicious, but Evelyn's alibi in the conservatory proves she couldn't have committed the murder."
    },
    {
      term: 'Chain of Custody',
      definition: "The documented tracking of how physical evidence was secured and preserved from the crime scene.",
      tip: "Ensures evidence was not tampered with after discovery."
    },
    {
      term: 'Timeline Reconstruction',
      definition: "Arranging verified movements, arrivals, and occurrences in strict chronological order.",
      tip: "Reconstructing the timeline isolates the exact 10-minute gap when the crime took place."
    },
    {
      term: 'Reasonable Doubt',
      definition: "A standard of logical certainty: the evidence must point overwhelmingly to the accused without viable alternatives.",
      tip: "Connect motive, method, timeline, and physical exhibits before finalizing your accusation."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090A0D]/90 backdrop-blur-md">
      <div className="bg-[#101218] border border-[#2B303A] rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#2B303A] flex items-center justify-between bg-[#151922]">
          <div className="flex items-center space-x-3 text-[#D5AA63]">
            <BookOpen className="w-5 h-5" />
            <div>
              <h3 className="font-serif-noir text-lg font-bold text-[#F0F0F2]">
                Detective Handbook & Case Guide
              </h3>
              <p className="text-[11px] font-mono-forensic text-[#9BA2AE]">
                ESSENTIAL TERMINOLOGY & FIELD PROCEDURES FOR JUNIOR DETECTIVES
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#101218] hover:bg-[#1B202A] text-[#9BA2AE] hover:text-[#F0F0F2] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#2B303A] bg-[#101218] px-5 pt-3 space-x-2">
          <button
            onClick={() => setActiveTab('glossary')}
            className={`pb-2.5 px-3 text-xs font-mono-forensic uppercase transition-colors border-b-2 ${
              activeTab === 'glossary'
                ? 'border-[#D5AA63] text-[#D5AA63] font-bold'
                : 'border-transparent text-[#9BA2AE] hover:text-[#F0F0F2]'
            }`}
          >
            Investigation Terminology
          </button>
          <button
            onClick={() => setActiveTab('howToPlay')}
            className={`pb-2.5 px-3 text-xs font-mono-forensic uppercase transition-colors border-b-2 ${
              activeTab === 'howToPlay'
                ? 'border-[#D5AA63] text-[#D5AA63] font-bold'
                : 'border-transparent text-[#9BA2AE] hover:text-[#F0F0F2]'
            }`}
          >
            How to Play CaseZero
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'glossary' ? (
            <div className="space-y-3">
              {glossaryTerms.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A] space-y-1"
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#D5AA63] font-mono-forensic uppercase">
                    <span>{item.term}</span>
                  </div>
                  <p className="text-xs text-[#F0F0F2] leading-relaxed">
                    {item.definition}
                  </p>
                  <div className="text-[11px] text-[#65B8A7] font-mono-forensic bg-[#090A0D] p-2 rounded border border-[#2B303A]">
                    💡 Detective Tip: {item.tip}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 text-xs text-[#F0F0F2] leading-relaxed">
              <div className="p-4 rounded-lg bg-[#151922] border border-[#2B303A] space-y-2">
                <h4 className="font-serif-noir text-sm font-bold text-[#D5AA63]">
                  1. Study the Crime Scene
                </h4>
                <p className="text-[#9BA2AE]">
                  Visit the <strong>Evidence Lab</strong>. Read each exhibit's <em>What we found</em>, <em>What it tells us</em>, and <em>Why it matters</em> sections. Notice the locked door (EV-01) and poisoned scotch glass (EV-02).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#151922] border border-[#2B303A] space-y-2">
                <h4 className="font-serif-noir text-sm font-bold text-[#D5AA63]">
                  2. Interrogate the Suspects
                </h4>
                <p className="text-[#9BA2AE]">
                  Go to <strong>AI Interrogation</strong>. You can choose from prepared question starters (Alibi, Relationship, Timeline, Suspicions) or type natural-language questions in free text.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#151922] border border-[#2B303A] space-y-2">
                <h4 className="font-serif-noir text-sm font-bold text-[#D5AA63]">
                  3. Catch Alibi Contradictions
                </h4>
                <p className="text-[#9BA2AE]">
                  Compare suspect statements with telephone records (EV-04) and witness logs (EV-07, EV-10). Confront suspects by presenting evidence in the interrogation room to see how they react!
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#151922] border border-[#2B303A] space-y-2">
                <h4 className="font-serif-noir text-sm font-bold text-[#D5AA63]">
                  4. Pin Clues on the Evidence Board
                </h4>
                <p className="text-[#9BA2AE]">
                  Drag nodes across the board and connect them with labeled relationships (<em>supports</em>, <em>contradicts</em>, <em>present_at</em>).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#151922] border border-[#2B303A] space-y-2">
                <h4 className="font-serif-noir text-sm font-bold text-[#D5AA63]">
                  5. Consult Senior Detective Morgan
                </h4>
                <p className="text-[#9BA2AE]">
                  If you ever feel stuck, open the <strong>Senior Detective's Guidance</strong> panel. Use Hint 1 for a gentle nudge, Hint 2 for a stronger clue, or Hint 3 for deduction assistance.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#151922] border border-[#2B303A] space-y-2">
                <h4 className="font-serif-noir text-sm font-bold text-[#D5AA63]">
                  6. File Your Accusation
                </h4>
                <p className="text-[#9BA2AE]">
                  Submit your primary culprit, motive, method, timeline, and decisive evidence in the <strong>Final Accusation</strong> chamber to receive your official 0–100 score.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
