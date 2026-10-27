import React from 'react';
import {
  Clapperboard,
  Search,
  FileText,
  Users,
  MessageSquare,
  Scale,
  BookOpen
} from 'lucide-react';
import { Investigation } from '../types';
import { SafeImage } from './SafeImage';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  investigation: Investigation | null;
  onOpenHandbook?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  investigation,
  onOpenHandbook,
}) => {
  // STRICTLY LIMITED to the 6 specified sections
  const navItems = [
    {
      id: 'story',
      label: 'Story Mode',
      icon: Clapperboard,
      badge: null,
    },
    {
      id: 'crimescene',
      label: 'Crime Scene',
      icon: Search,
      badge: 'STUDY',
    },
    {
      id: 'evidence',
      label: 'Evidence',
      icon: FileText,
      badge: investigation ? `${investigation.discovered_count}` : null,
    },
    {
      id: 'suspects',
      label: 'Suspects',
      icon: Users,
      badge: '5',
    },
    {
      id: 'interrogation',
      label: 'Interrogation',
      icon: MessageSquare,
      badge: null,
    },
    {
      id: 'deduction',
      label: 'Final Accusation',
      icon: Scale,
      badge: 'SOLVE',
      badgeColor: 'text-[#D9535D] bg-[#D9535D]/10 border-[#D9535D]/30',
    },
  ];

  return (
    <aside className="w-60 border-r border-[#2B303A] bg-[#101218] flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#2B303A]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-[#D5AA63] flex items-center justify-center text-[#090A0D] font-bold text-sm shadow-[0_0_15px_rgba(213,170,99,0.35)]">
            CZ
          </div>
          <div>
            <h1 className="font-serif-noir font-bold text-base text-[#F0F0F2] tracking-wide">
              CASEZERO
            </h1>
            <p className="text-[10px] font-mono-forensic text-[#9BA2AE]">
              THE LAST GUEST
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation: EXACTLY the 6 sections */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-[#1B202A] text-[#F0F0F2] border border-[#D5AA63]/60 shadow-[0_0_14px_rgba(213,170,99,0.18)]'
                  : 'text-[#9BA2AE] hover:text-[#F0F0F2] hover:bg-[#151922] border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#D5AA63]' : 'text-[#656C7A] group-hover:text-[#9BA2AE]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-mono-forensic px-1.5 py-0.5 rounded border shrink-0 ${
                    item.badgeColor || 'text-[#9BA2AE] bg-[#151922] border-[#2B303A]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Small Optional Detective Handbook Action */}
        {onOpenHandbook && (
          <div className="pt-3 mt-3 border-t border-[#2B303A]/70">
            <button
              onClick={onOpenHandbook}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#D5AA63] bg-[#151922] hover:bg-[#1B202A] border border-[#D5AA63]/20 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <BookOpen className="w-3.5 h-3.5 text-[#D5AA63]" />
                <span className="text-[11px]">Detective Handbook</span>
              </div>
              <span className="text-[9px] font-mono-forensic text-[#656C7A]">HELP</span>
            </button>
          </div>
        )}
      </nav>

      {/* Senior Mentor Indicator Footer */}
      <div className="p-3 border-t border-[#2B303A] bg-[#090A0D]/70 text-[11px] font-mono-forensic text-[#656C7A]">
        <div className="flex items-center space-x-2 text-[#F0F0F2]">
          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-[#D5AA63]/40 bg-[#090A0D]">
            <SafeImage
              src="/assets/detective_morgan.jpg"
              alt="Det. Morgan"
              fallbackType="suspect"
              fallbackTitle="Morgan"
              className="w-full h-full object-cover filter grayscale"
            />
          </div>
          <div className="truncate">
            <span className="text-xs font-semibold block text-[#F0F0F2]">Det. Morgan</span>
            <span className="text-[9px] text-[#D5AA63]">Homicide Mentor</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
