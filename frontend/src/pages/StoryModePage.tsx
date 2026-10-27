import React, { useState } from 'react';
import { Investigation, Suspect, DiscoveredEvidence, CaseDetail } from '../types';
import { SafeImage } from '../components/SafeImage';
import { Clapperboard, ArrowRight, Search, Users, ChevronRight, ChevronLeft } from 'lucide-react';

interface StoryModePageProps {
  investigation: Investigation;
  suspects: Suspect[];
  evidenceList: DiscoveredEvidence[];
  caseDetail: CaseDetail | null;
  onNavigate: (page: string) => void;
  onSelectSuspectForInterrogation: (suspectId: number) => void;
  onEvidenceDiscovered: () => void;
}

export const StoryModePage: React.FC<StoryModePageProps> = ({
  onNavigate,
}) => {
  const [activeScene, setActiveScene] = useState<number>(1);

  const scenes = [
    {
      id: 1,
      tag: 'SCENE 1: ARRIVAL IN THE STORM',
      title: 'Vale Manor — 21:15 Hours',
      image: '/assets/mansion_exterior.jpg',
      fallbackType: 'scene' as const,
      narration:
        'Torrential rain batters the cliffside estate of tech tycoon Adrian Vale. Forty minutes ago, a servant forced open the locked study door and found Adrian dead in his chair.',
      morganDialogue:
        '“Junior, keep your wits sharp. The local police cordoned the estate, but the killer is still in this house. Let’s enter the study.”',
      primaryAction: {
        label: 'Enter the Study (Scene 2)',
        onClick: () => setActiveScene(2),
        icon: ArrowRight,
      },
    },
    {
      id: 2,
      tag: 'SCENE 2: THE LOCKED STUDY',
      title: 'The Crime Scene',
      image: '/assets/study_crime_scene.jpg',
      fallbackType: 'scene' as const,
      narration:
        'Adrian sits motionless in his high-backed mahogany armchair with a spilled glass of single-malt scotch before him. The heavy oak door was bolted from the inside.',
      morganDialogue:
        '“Look closely at the deadbolt strike plate and the desk. Start by physically inspecting every object in the room.”',
      primaryAction: {
        label: 'Examine Crime Scene Hotspots',
        onClick: () => onNavigate('crimescene'),
        icon: Search,
      },
    },
    {
      id: 3,
      tag: 'SCENE 3: THE SUSPECTS',
      title: 'Persons of Interest',
      image: '/assets/study_crime_scene.jpg',
      fallbackType: 'scene' as const,
      narration:
        'Five dinner guests are detained downstairs in the library: the estranged widow, the CFO, the personal physician, the private secretary, and an investigative journalist.',
      morganDialogue:
        '“Each has a declared alibi, but someone took advantage of the storm. Question them directly and break their stories.”',
      primaryAction: {
        label: 'Interview Suspects',
        onClick: () => onNavigate('suspects'),
        icon: Users,
      },
    },
  ];

  const current = scenes.find((s) => s.id === activeScene) || scenes[0];
  const ActionIcon = current.primaryAction.icon;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header & Scene Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2B303A] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-forensic text-[#D5AA63] mb-1">
            <Clapperboard className="w-3.5 h-3.5" />
            <span>CINEMATIC STORY MODE</span>
          </div>
          <h1 className="font-serif-noir text-2xl md:text-3xl font-bold text-[#F0F0F2]">
            {current.title}
          </h1>
        </div>

        {/* 3 Short Scene Switchers */}
        <div className="flex items-center space-x-2">
          {scenes.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScene(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-forensic transition-all cursor-pointer ${
                activeScene === s.id
                  ? 'bg-[#D5AA63] text-[#090A0D] font-bold shadow-[0_0_12px_rgba(213,170,99,0.3)]'
                  : 'bg-[#151922] text-[#9BA2AE] hover:text-[#F0F0F2] border border-[#2B303A]'
              }`}
            >
              Scene {s.id}
            </button>
          ))}
        </div>
      </div>

      {/* Atmospheric Scene Hero Image with SafeImage */}
      <div className="relative rounded-2xl overflow-hidden border border-[#2B303A] bg-[#090A0D] aspect-[21/9] max-h-[380px] shadow-2xl">
        <SafeImage
          src={current.image}
          alt={current.title}
          fallbackType={current.fallbackType}
          fallbackTitle={current.title}
          className="w-full h-full object-cover filter contrast-125 brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-transparent to-transparent opacity-80" />

        <div className="absolute top-4 left-4">
          <span className="text-[10px] font-mono-forensic bg-[#090A0D]/90 text-[#D5AA63] px-2.5 py-1 rounded border border-[#D5AA63]/40">
            {current.tag}
          </span>
        </div>
      </div>

      {/* Short Narration & Mentor Advice Card */}
      <div className="rounded-xl bg-[#101218] border border-[#2B303A] p-6 space-y-4 shadow-xl">
        <p className="text-sm md:text-base text-[#F0F0F2] font-serif-noir leading-relaxed">
          {current.narration}
        </p>

        {/* Small Mentor Speech Bubble */}
        <div className="p-3.5 rounded-lg bg-[#151922] border border-[#D5AA63]/30 flex items-start space-x-3">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#D5AA63]/50 bg-[#090A0D]">
            <SafeImage
              src="/assets/detective_morgan.jpg"
              alt="Det. Morgan"
              fallbackType="suspect"
              fallbackTitle="Morgan"
              className="w-full h-full object-cover filter grayscale"
            />
          </div>
          <div>
            <span className="text-[10px] font-mono-forensic text-[#D5AA63] uppercase font-bold block">
              DET. MORGAN:
            </span>
            <p className="text-xs text-[#9BA2AE] leading-relaxed mt-0.5">
              {current.morganDialogue}
            </p>
          </div>
        </div>

        {/* Scene Navigation & Primary Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2B303A]">
          <div className="flex items-center space-x-2">
            {activeScene > 1 && (
              <button
                onClick={() => setActiveScene(activeScene - 1)}
                className="px-3.5 py-2 rounded-lg bg-[#151922] text-[#9BA2AE] hover:text-[#F0F0F2] text-xs font-mono-forensic flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}
            {activeScene < scenes.length && (
              <button
                onClick={() => setActiveScene(activeScene + 1)}
                className="px-3.5 py-2 rounded-lg bg-[#151922] text-[#9BA2AE] hover:text-[#F0F0F2] text-xs font-mono-forensic flex items-center space-x-1 cursor-pointer"
              >
                <span>Next Scene</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={current.primaryAction.onClick}
            className="px-6 py-2.5 rounded-lg bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] text-xs font-mono-forensic font-bold uppercase tracking-wider flex items-center space-x-2 cursor-pointer shadow-md transition-colors"
          >
            <span>{current.primaryAction.label}</span>
            <ActionIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
