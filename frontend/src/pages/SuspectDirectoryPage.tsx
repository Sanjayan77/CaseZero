import React from 'react';
import { Suspect } from '../types';
import { SafeImage } from '../components/SafeImage';
import { MessageSquare, Clock } from 'lucide-react';

interface SuspectDirectoryPageProps {
  suspects: Suspect[];
  onSelectSuspectForInterrogation: (suspectId: number) => void;
}

export const SuspectDirectoryPage: React.FC<SuspectDirectoryPageProps> = ({
  suspects,
  onSelectSuspectForInterrogation,
}) => {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#2B303A] pb-4">
        <div className="flex items-center space-x-2 text-xs font-mono-forensic text-[#D5AA63] mb-1">
          <span className="w-2 h-2 rounded-full bg-[#D5AA63] animate-pulse"></span>
          <span>STEP 3 • PERSONS OF INTEREST</span>
        </div>
        <h1 className="font-serif-noir text-2xl md:text-3xl font-bold text-[#F0F0F2]">
          Suspects
        </h1>
        <p className="text-xs text-[#9BA2AE] mt-1">
          Five guests were inside Vale Manor during the 20:25–20:35 homicide window. Select a suspect to question them.
        </p>
      </div>

      {/* 5 Suspects Cards Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {suspects.map((suspect) => (
          <div
            key={suspect.id}
            onClick={() => onSelectSuspectForInterrogation(suspect.id)}
            className="rounded-xl bg-[#101218] border border-[#2B303A] hover:border-[#D5AA63]/60 transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xl hover:shadow-[0_0_20px_rgba(213,170,99,0.15)] cursor-pointer"
          >
            {/* Portrait with SafeImage */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#090A0D]">
              <SafeImage
                src={suspect.portrait_image}
                alt={suspect.name}
                fallbackType="suspect"
                fallbackTitle={suspect.name}
                className="w-full h-full object-cover object-top filter grayscale contrast-125 brightness-95 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101218] via-transparent to-transparent opacity-90" />

              <div className="absolute top-2.5 left-2.5">
                <span className="text-[9px] font-mono-forensic bg-[#090A0D]/90 text-[#D5AA63] px-2 py-0.5 rounded border border-[#D5AA63]/30">
                  {suspect.role}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-serif-noir text-lg font-bold text-[#F0F0F2] group-hover:text-[#D5AA63] transition-colors leading-tight">
                  {suspect.name}
                </h3>
                <div className="text-[10px] font-mono-forensic text-[#9BA2AE] truncate">
                  {suspect.relationship_to_victim}
                </div>
              </div>
            </div>

            {/* Profile Summary & Action */}
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
              <div className="p-2.5 rounded bg-[#151922] border border-[#2B303A] text-xs font-mono-forensic space-y-1">
                <div className="text-[9px] text-[#D5AA63] flex items-center space-x-1 uppercase font-bold">
                  <Clock className="w-2.5 h-2.5" />
                  <span>CLAIMED ALIBI</span>
                </div>
                <p className="text-[11px] text-[#F0F0F2] line-clamp-2 leading-relaxed">
                  {suspect.known_alibi}
                </p>
              </div>

              <button className="w-full py-2 rounded-lg bg-[#1B202A] group-hover:bg-[#D5AA63] text-[#F0F0F2] group-hover:text-[#090A0D] border border-[#2B303A] group-hover:border-[#D5AA63] text-xs font-mono-forensic font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Interrogate</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
