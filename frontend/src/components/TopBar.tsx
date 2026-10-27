import React, { useState } from 'react';
import { User, Investigation, AIStatus } from '../types';
import { Shield, Search, LogOut, Lock, Award, BookOpen, Volume2, VolumeX, Clapperboard } from 'lucide-react';
import { AIStatusIndicator } from './AIStatusIndicator';
import { noirAmbiance } from '../utils/audio';

interface TopBarProps {
  user: User | null;
  investigation: Investigation | null;
  aiStatus: AIStatus | null;
  onRefreshAIStatus?: () => void;
  onOpenHandbook: () => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  investigation,
  aiStatus,
  onRefreshAIStatus,
  onOpenHandbook,
  onLogout,
  onNavigate,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(noirAmbiance.getIsPlaying());

  const handleToggleAudio = () => {
    const active = noirAmbiance.toggle();
    setIsPlayingAudio(active);
  };

  return (
    <header className="h-16 border-b border-[#2B303A] bg-[#101218]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Active Case Badge */}
      <div className="flex items-center space-x-4">
        <div
          onClick={() => onNavigate('crimescene')}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded bg-[#1B202A] border border-[#D5AA63]/40 flex items-center justify-center text-[#D5AA63] group-hover:border-[#D5AA63] transition-colors">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono-forensic text-xs font-bold text-[#D5AA63]">
                {investigation ? investigation.case.case_id : 'CASEZERO'}
              </span>
              <span className="text-xs text-[#656C7A]">•</span>
              <span className="text-xs text-[#9BA2AE] uppercase tracking-wider font-medium truncate max-w-[140px] sm:max-w-xs">
                {investigation ? investigation.case.title : 'Forensic Terminal'}
              </span>
            </div>
            <div className="text-[11px] text-[#656C7A] flex items-center space-x-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#65B8A7] animate-pulse"></span>
              <span>JUNIOR DETECTIVE TERMINAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Investigation Quick Stats, Story Mode Shortcut & AI Status */}
      <div className="hidden md:flex items-center space-x-3 text-xs font-mono-forensic">
        {investigation && (
          <>
            {/* Story Mode Quick Launch */}
            <button
              onClick={() => onNavigate('story')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#D5AA63]/15 hover:bg-[#D5AA63]/25 border border-[#D5AA63]/40 text-[#D5AA63] font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(213,170,99,0.15)]"
            >
              <Clapperboard className="w-3.5 h-3.5 text-[#D5AA63]" />
              <span>STORY MODE</span>
            </button>

            <div className="flex items-center space-x-2 bg-[#151922] px-3 py-1.5 rounded border border-[#2B303A]">
              <Search className="w-3.5 h-3.5 text-[#D5AA63]" />
              <span className="text-[#9BA2AE]">EVIDENCE:</span>
              <span className="text-[#F0F0F2] font-bold">
                {investigation.discovered_count}
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-[#151922] px-3 py-1.5 rounded border border-[#2B303A]">
              <Lock className="w-3.5 h-3.5 text-[#D9535D]" />
              <span className="text-[#9BA2AE]">SCENE:</span>
              <span className="text-[#F0F0F2] font-bold">LOCKED STUDY</span>
            </div>

            {investigation.status === 'completed' && (
              <div className="flex items-center space-x-2 bg-[#65B8A7]/10 border border-[#65B8A7]/40 px-3 py-1.5 rounded text-[#65B8A7]">
                <Award className="w-3.5 h-3.5" />
                <span>SCORE: {investigation.final_score}/100</span>
              </div>
            )}
          </>
        )}

        {/* Real AI Status Diagnostics Badge */}
        <AIStatusIndicator
          status={aiStatus}
          onRefresh={onRefreshAIStatus}
        />
      </div>

      {/* Right: Sound Control, Quick Tools (Handbook), User Profile & Logout */}
      <div className="flex items-center space-x-2.5">
        {/* Subtle Atmospheric Rain Sound Toggle */}
        <button
          onClick={handleToggleAudio}
          title={isPlayingAudio ? "Mute Atmospheric Noir Rain" : "Play Atmospheric Noir Rain"}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono-forensic transition-all cursor-pointer ${
            isPlayingAudio
              ? "bg-[#65B8A7]/20 border-[#65B8A7]/40 text-[#65B8A7] shadow-[0_0_10px_rgba(101,184,167,0.2)]"
              : "bg-[#151922] hover:bg-[#1B202A] border-[#2B303A] text-[#9BA2AE] hover:text-[#F0F0F2]"
          }`}
        >
          {isPlayingAudio ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#65B8A7] animate-pulse" />
              <span className="hidden sm:inline">Rain Sound: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-[#656C7A]" />
              <span className="hidden sm:inline">Rain Sound: OFF</span>
            </>
          )}
        </button>

        {/* Detective Handbook Button */}
        <button
          onClick={onOpenHandbook}
          title="Open Detective Handbook & Glossary"
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#151922] hover:bg-[#1B202A] border border-[#2B303A] hover:border-[#D5AA63]/50 text-xs font-mono-forensic text-[#D5AA63] transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#D5AA63]" />
          <span className="hidden sm:inline">Handbook</span>
        </button>

        {/* Website FAQ & Support Portal Links */}
        <button
          onClick={() => onNavigate('faq')}
          title="Open SQL FAQ Knowledge Base"
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-[#151922] hover:bg-[#1B202A] border border-[#2B303A] hover:border-[#D5AA63]/50 text-xs font-mono-forensic text-[#D5AA63] transition-colors cursor-pointer"
        >
          <span>FAQ</span>
        </button>

        <button
          onClick={() => onNavigate('support')}
          title="Open System Health & Support Portal"
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-[#151922] hover:bg-[#1B202A] border border-[#2B303A] hover:border-[#D5AA63]/50 text-xs font-mono-forensic text-[#8E92A4] hover:text-[#D5AA63] transition-colors cursor-pointer"
        >
          <span className="hidden sm:inline">Support</span>
        </button>


        {user ? (
          <div className="flex items-center space-x-2.5">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-[#F0F0F2] flex items-center justify-end space-x-1">
                <span>{user.username}</span>
              </div>
              <div className="text-[10px] font-mono-forensic text-[#D5AA63]">
                {user.badge_title || 'Junior Detective'}
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded bg-[#1B202A] hover:bg-[#2B303A] border border-[#2B303A] text-[#9BA2AE] hover:text-[#D9535D] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('login')}
              className="text-xs text-[#9BA2AE] hover:text-[#F0F0F2] px-3 py-1.5 rounded bg-[#1B202A] border border-[#2B303A] transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="text-xs text-[#090A0D] bg-[#D5AA63] hover:bg-[#e2bd7e] px-3 py-1.5 rounded font-semibold transition-colors"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
