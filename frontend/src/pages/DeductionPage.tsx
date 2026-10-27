import React, { useState } from 'react';
import { Suspect, DiscoveredEvidence, AccusationResult } from '../types';
import { api } from '../services/api';
import { SafeImage } from '../components/SafeImage';
import { Scale, CheckCircle, AlertTriangle, ArrowRight, Award, RotateCcw } from 'lucide-react';

interface DeductionPageProps {
  investigationId: number;
  suspects: Suspect[];
  evidenceList: DiscoveredEvidence[];
  onAccusationSubmitted: () => void;
}

export const DeductionPage: React.FC<DeductionPageProps> = ({
  investigationId,
  suspects,
  evidenceList,
  onAccusationSubmitted,
}) => {
  const [selectedSuspectName, setSelectedSuspectName] = useState<string>(
    suspects.length > 0 ? suspects[0].name : 'Marcus Reed'
  );

  const [selectedMotive, setSelectedMotive] = useState<string>(
    'Adrian discovered Marcus Reed embezzled $22.5M from Aegis Holdings into Caribbean accounts and was presenting the dossier to federal prosecutors tomorrow morning.'
  );

  const [selectedMethod, setSelectedMethod] = useState<string>(
    'Lethal cardiac glycosides (Digitalis Purpurea) introduced into Adrian’s single-malt scotch, followed by rigging the study deadbolt with monofilament thread through the latch gap to simulate a locked-room suicide.'
  );

  const [selectedEvidenceCodes, setSelectedEvidenceCodes] = useState<string[]>([
    'EV-01',
    'EV-02',
    'EV-03',
  ]);

  const [explanation, setExplanation] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<AccusationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const motives = [
    {
      id: 'm1',
      title: '$22.5M Embezzlement & Imminent Federal Audit',
      text: 'Adrian discovered Marcus Reed embezzled $22.5M from Aegis Holdings into Caribbean accounts and was presenting the dossier to federal prosecutors tomorrow morning.',
      hint: 'Marcus Reed',
    },
    {
      id: 'm2',
      title: 'Contested Divorce & Zero Prenuptial Settlement',
      text: 'Adrian was finalizing divorce proceedings with strict prenuptial enforcement, which would have stripped Evelyn of all matrimonial assets and estate rights.',
      hint: 'Evelyn Vale',
    },
    {
      id: 'm3',
      title: 'Medical Malpractice & Threat of License Revocation',
      text: 'Adrian threatened to submit an official malpractice dossier to the state medical licensing board, guaranteeing the end of Dr. Shah’s career.',
      hint: 'Dr. Nina Shah',
    },
    {
      id: 'm4',
      title: 'Disinheritance & Refusal to Bail Out Debts',
      text: 'Adrian amended his estate will to disinherit Oliver completely and refused to bail him out of crushing predatory loan debt.',
      hint: 'Oliver Grant',
    },
  ];

  const methods = [
    {
      id: 'met1',
      title: 'Digitalis Poison in Scotch + Monofilament Deadbolt Trick',
      text: 'Lethal cardiac glycosides (Digitalis Purpurea) introduced into Adrian’s single-malt scotch, followed by rigging the study deadbolt with monofilament thread through the latch gap to simulate a locked-room suicide.',
      highlight: true,
    },
    {
      id: 'met2',
      title: 'Forced Poison Ingestion Through Physical Restraint',
      text: 'Forcing Adrian to swallow digitalis pills at gunpoint during a struggle inside the study.',
      highlight: false,
    },
    {
      id: 'met3',
      title: 'Exterior Terrace Window Forced Entry',
      text: 'Shattering or picking the French window latches from the rain terrace to enter and escape.',
      highlight: false,
    },
  ];

  const toggleEvidence = (code: string) => {
    setSelectedEvidenceCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSubmit = async () => {
    if (!selectedSuspectName || !selectedMotive || !selectedMethod) {
      setError('Please select a suspect, motive, and method before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.submitAccusation(investigationId, {
        suspect_name: selectedSuspectName,
        motive: selectedMotive,
        method: selectedMethod,
        timeline_explanation: 'Opportunity window between 20:26 and 20:38 during dropped terrace call.',
        supporting_evidence_codes: selectedEvidenceCodes,
        written_deduction: explanation || 'Formal accusation filed.',
      });
      setResult(res);
      onAccusationSubmitted();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit accusation.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Case Reveal View
  if (result) {
    const isCorrect = result.score_breakdown?.is_correct_culprit;
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
        <div className="text-center space-y-3 pb-6 border-b border-[#2B303A]">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono-forensic bg-[#D5AA63]/10 text-[#D5AA63] border border-[#D5AA63]/30">
            <Award className="w-4 h-4" />
            <span>CASE VERDICT • SCORE: {result.final_score}/100</span>
          </div>

          <h1 className="font-serif-noir text-3xl md:text-4xl font-bold text-[#F0F0F2]">
            {isCorrect ? 'Case Solved — Justice Delivered' : 'Accusation Submitted'}
          </h1>
          <p className="text-xs text-[#9BA2AE] max-w-xl mx-auto">
            The Crown Prosecutor and Senior Detective Morgan have reviewed your formal indictment.
          </p>
        </div>

        {/* Truth Reveal Box */}
        <div className="rounded-xl bg-[#101218] border border-[#D5AA63]/40 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#2B303A] pb-3">
            <span className="text-xs font-mono-forensic text-[#D5AA63] uppercase font-bold">
              THE CANONICAL SOLUTION
            </span>
            <span className="text-xs font-mono-forensic text-[#65B8A7]">
              ACTUAL CULPRIT: {result.actual_culprit}
            </span>
          </div>

          <p className="text-xs md:text-sm text-[#F0F0F2] leading-relaxed">
            {result.canonical_explanation}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A] space-y-1">
              <span className="text-[10px] font-mono-forensic text-[#D5AA63] uppercase font-bold">
                PROVEN MOTIVE:
              </span>
              <p className="text-[#9BA2AE]">{result.actual_motive}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A] space-y-1">
              <span className="text-[10px] font-mono-forensic text-[#65B8A7] uppercase font-bold">
                PROVEN METHOD:
              </span>
              <p className="text-[#9BA2AE]">{result.actual_method}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={() => setResult(null)}
            className="px-6 py-2.5 rounded-lg bg-[#1B202A] hover:bg-[#2B303A] text-xs font-mono-forensic text-[#F0F0F2] flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Review Accusation Choices</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#2B303A] pb-4">
        <div className="flex items-center space-x-2 text-xs font-mono-forensic text-[#D9535D] mb-1">
          <span className="w-2 h-2 rounded-full bg-[#D9535D] animate-pulse"></span>
          <span>STEP 4 • FINAL ACCUSATION</span>
        </div>
        <h1 className="font-serif-noir text-2xl md:text-3xl font-bold text-[#F0F0F2]">
          Solve the Case
        </h1>
        <p className="text-xs text-[#9BA2AE] mt-1">
          Select the prime suspect, motive, execution method, and supporting evidence.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-[#D9535D]/15 border border-[#D9535D]/40 text-xs text-[#D9535D] flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. SELECT SUSPECT */}
      <div className="space-y-3">
        <span className="text-xs font-mono-forensic text-[#D5AA63] uppercase font-bold block">
          1. SELECT THE CULPRIT:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {suspects.map((suspect) => {
            const isSelected = selectedSuspectName === suspect.name;
            return (
              <div
                key={suspect.id}
                onClick={() => setSelectedSuspectName(suspect.name)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between space-y-2 ${
                  isSelected
                    ? 'bg-[#1B202A] border-[#D9535D] shadow-[0_0_15px_rgba(217,83,93,0.35)]'
                    : 'bg-[#101218] border-[#2B303A] hover:border-[#D5AA63]/50'
                }`}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-current bg-[#090A0D]">
                  <SafeImage
                    src={suspect.portrait_image}
                    alt={suspect.name}
                    fallbackType="suspect"
                    className="w-full h-full object-cover filter grayscale"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F0F0F2]">{suspect.name}</h4>
                  <p className="text-[10px] text-[#9BA2AE] font-mono-forensic truncate">
                    {suspect.role}
                  </p>
                </div>
                {isSelected && (
                  <span className="text-[10px] font-mono-forensic text-[#D9535D] font-bold">
                    ACCUSED ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SELECT MOTIVE */}
      <div className="space-y-3">
        <span className="text-xs font-mono-forensic text-[#D5AA63] uppercase font-bold block">
          2. SELECT THE MOTIVE:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {motives.map((m) => {
            const isSelected = selectedMotive === m.text;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMotive(m.text)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-[#1B202A] border-[#D5AA63] shadow-[0_0_15px_rgba(213,170,99,0.2)]'
                    : 'bg-[#101218] border-[#2B303A] hover:border-[#D5AA63]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#F0F0F2]">{m.title}</h4>
                  {isSelected && <span className="text-xs text-[#D5AA63] font-bold">✓</span>}
                </div>
                <p className="text-xs text-[#9BA2AE] leading-relaxed">{m.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SELECT METHOD */}
      <div className="space-y-3">
        <span className="text-xs font-mono-forensic text-[#D5AA63] uppercase font-bold block">
          3. SELECT THE METHOD:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {methods.map((met) => {
            const isSelected = selectedMethod === met.text;
            return (
              <div
                key={met.id}
                onClick={() => setSelectedMethod(met.text)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-[#1B202A] border-[#D5AA63] shadow-[0_0_15px_rgba(213,170,99,0.2)]'
                    : 'bg-[#101218] border-[#2B303A] hover:border-[#D5AA63]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#F0F0F2]">{met.title}</h4>
                  {isSelected && <span className="text-xs text-[#D5AA63] font-bold">✓</span>}
                </div>
                <p className="text-xs text-[#9BA2AE] leading-relaxed">{met.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SELECT SUPPORTING EVIDENCE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono-forensic text-[#D5AA63] uppercase font-bold">
            4. ATTACH SUPPORTING EVIDENCE ({selectedEvidenceCodes.length} SELECTED):
          </span>
        </div>

        {evidenceList.length === 0 ? (
          <p className="text-xs text-[#9BA2AE]">No evidence discovered yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {evidenceList.map((disc) => {
              const code = disc.evidence.evidence_code;
              const isSelected = selectedEvidenceCodes.includes(code);
              return (
                <div
                  key={disc.id}
                  onClick={() => toggleEvidence(code)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center space-x-2.5 truncate ${
                    isSelected
                      ? 'bg-[#1B202A] border-[#65B8A7] text-[#F0F0F2]'
                      : 'bg-[#101218] border-[#2B303A] text-[#9BA2AE] hover:border-[#D5AA63]/40'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isSelected ? 'border-[#65B8A7] bg-[#65B8A7] text-[#090A0D]' : 'border-[#2B303A]'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-mono-forensic text-[#D5AA63] block">
                      {code}
                    </span>
                    <span className="truncate block font-semibold">{disc.evidence.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Optional Brief Explanation */}
      <div className="space-y-2">
        <span className="text-xs font-mono-forensic text-[#9BA2AE] uppercase block">
          Optional Detective Notes:
        </span>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Brief notes summarizing the locked room solution..."
          rows={2}
          className="w-full bg-[#151922] border border-[#2B303A] focus:border-[#D5AA63] rounded-lg p-3 text-xs text-[#F0F0F2] focus:outline-none font-sans"
        />
      </div>

      {/* Final Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 py-3 rounded-lg bg-[#D9535D] hover:bg-[#c4434d] text-white text-xs font-mono-forensic font-bold uppercase tracking-wider flex items-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(217,83,93,0.3)] disabled:opacity-50 transition-colors"
        >
          <Scale className="w-4 h-4" />
          <span>{submitting ? 'Calculating Indictment...' : 'Submit Final Accusation'}</span>
        </button>
      </div>
    </div>
  );
};
