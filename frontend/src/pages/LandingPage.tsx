import React from 'react';
import { RainCanvas } from '../components/RainCanvas';
import { Shield, Search, MessageSquare, Network, Scale, ChevronRight, Play, Eye } from 'lucide-react';

interface LandingPageProps {
  onStartDemo: () => void;
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDemo,
  onNavigate,
}) => {
  return (
    <div className="relative min-h-screen bg-[#090A0D] text-[#F0F0F2] overflow-x-hidden selection:bg-[#D5AA63] selection:text-[#090A0D]">
      {/* Rain canvas overlay */}
      <RainCanvas />

      {/* Hero Section */}
      <div className="relative min-h-[92vh] flex items-center justify-center px-6 border-b border-[#2B303A]">
        {/* Background Artwork with Dark Vignette */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/assets/mansion_exterior.jpg"
            alt="Vale Manor Exterior at Midnight"
            className="w-full h-full object-cover object-center filter brightness-[0.4] contrast-[1.15] scale-105 transform motion-safe:transition-transform motion-safe:duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-[#090A0D]/70 to-[#090A0D]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#090A0D]/50 to-[#090A0D]" />
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-4xl mx-auto text-center pt-12 pb-16">
          {/* Case Identifier Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#151922]/90 border border-[#D5AA63]/40 text-[#D5AA63] text-xs font-mono-forensic mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(213,170,99,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#D5AA63] animate-ping" />
            <span>CASE FILE CZ-001 • THE LAST GUEST</span>
          </div>

          <h1 className="font-serif-noir text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#F0F0F2] mb-6 leading-[1.08]">
            Every Detail Tells a Story.<br />
            <span className="text-[#D5AA63] italic">Every Lie Leaves a Trace.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#9BA2AE] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Step into the midnight study of Adrian Vale. Interrogate suspects driven by real AI, inspect forensic evidence, connect the timeline, and solve a locked-room murder.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-lg bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] font-bold text-sm tracking-wide uppercase flex items-center justify-center space-x-3 transition-all duration-300 shadow-[0_0_25px_rgba(213,170,99,0.4)] hover:shadow-[0_0_35px_rgba(213,170,99,0.6)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Investigation (1-Click Demo)</span>
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-7 py-4 rounded-lg bg-[#151922]/90 hover:bg-[#1B202A] text-[#F0F0F2] border border-[#2B303A] hover:border-[#D5AA63]/50 font-medium text-sm flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#9BA2AE]" />
              <span>Sign In / Register</span>
            </button>
          </div>

          {/* Quick Features List */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 text-left">
            <div className="p-4 rounded-lg bg-[#101218]/80 border border-[#2B303A] backdrop-blur-sm">
              <Search className="w-5 h-5 text-[#D5AA63] mb-2" />
              <div className="text-xs font-bold text-[#F0F0F2] uppercase tracking-wider mb-1">
                Forensic Lab
              </div>
              <div className="text-[11px] text-[#9BA2AE]">
                Examine locks, scotch residue, autopsy reports & wire transfers.
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#101218]/80 border border-[#2B303A] backdrop-blur-sm">
              <MessageSquare className="w-5 h-5 text-[#65B8A7] mb-2" />
              <div className="text-xs font-bold text-[#F0F0F2] uppercase tracking-wider mb-1">
                AI Interrogations
              </div>
              <div className="text-[11px] text-[#9BA2AE]">
                Ask free-text questions and catch suspects in real contradictions.
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#101218]/80 border border-[#2B303A] backdrop-blur-sm">
              <Network className="w-5 h-5 text-[#D5AA63] mb-2" />
              <div className="text-xs font-bold text-[#F0F0F2] uppercase tracking-wider mb-1">
                Connected Board
              </div>
              <div className="text-[11px] text-[#9BA2AE]">
                Drag nodes, pin evidence, and map labelled relations in real time.
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#101218]/80 border border-[#2B303A] backdrop-blur-sm">
              <Scale className="w-5 h-5 text-[#D9535D] mb-2" />
              <div className="text-xs font-bold text-[#F0F0F2] uppercase tracking-wider mb-1">
                Logical Deduction
              </div>
              <div className="text-[11px] text-[#9BA2AE]">
                Submit culprit, motive, method and evidence for deterministic scoring.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Case Preview Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-10 bg-[#101218] rounded-xl border border-[#2B303A] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="md:w-1/2">
            <div className="text-xs font-mono-forensic text-[#D5AA63] uppercase tracking-widest mb-2">
              FEATURED ACTIVE MYSTERY
            </div>
            <h2 className="font-serif-noir text-3xl md:text-4xl font-bold text-[#F0F0F2] mb-4">
              CZ-001: The Last Guest
            </h2>
            <p className="text-sm text-[#9BA2AE] mb-6 leading-relaxed">
              At 20:15 during an exclusive dinner party at Vale Manor, tech mogul Adrian Vale excused himself to his private second-floor study. At 21:00, the door had to be forced open—the heavy brass deadbolt was thrown from the inside, and Adrian was dead on the Persian rug.
            </p>

            <div className="space-y-2 text-xs font-mono-forensic text-[#9BA2AE] mb-8">
              <div className="flex justify-between border-b border-[#2B303A] pb-1.5">
                <span>VICTIM:</span>
                <span className="text-[#F0F0F2]">Adrian Vale (CEO, Vale Technologies)</span>
              </div>
              <div className="flex justify-between border-b border-[#2B303A] pb-1.5">
                <span>SCENE:</span>
                <span className="text-[#F0F0F2]">Locked 2nd-Floor Study</span>
              </div>
              <div className="flex justify-between border-b border-[#2B303A] pb-1.5">
                <span>SUSPECTS:</span>
                <span className="text-[#F0F0F2]">5 Dinner Guests with Concealed Secrets</span>
              </div>
              <div className="flex justify-between">
                <span>DIFFICULTY:</span>
                <span className="text-[#D5AA63]">INTERMEDIATE (20-30 MINS)</span>
              </div>
            </div>

            <button
              onClick={onStartDemo}
              className="px-6 py-3 rounded-lg bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <span>Begin Investigation Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="md:w-1/2 rounded-lg overflow-hidden border border-[#2B303A] shadow-xl relative group">
            <img
              src="/assets/study_crime_scene.jpg"
              alt="Crime scene study"
              className="w-full h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="text-xs font-mono-forensic bg-[#090A0D]/90 text-[#D5AA63] px-2.5 py-1 rounded border border-[#2B303A]">
                EXHIBIT A-1: CRIME SCENE
              </span>
              <span className="text-[11px] text-[#9BA2AE] font-mono-forensic">
                EVIDENCE UNLOCKED
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2B303A] bg-[#090A0D] py-8 text-center text-xs text-[#656C7A] font-mono-forensic">
        <p>CASEZERO INVESTIGATION ARCHITECTURE • FULL-STACK AI MYSTERY ENGINE</p>
      </footer>
    </div>
  );
};
