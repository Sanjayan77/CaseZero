import React, { useState } from 'react';
import { DiscoveredEvidence, Investigation } from '../types';
import { api } from '../services/api';
import { SafeImage } from '../components/SafeImage';
import {
  Search,
  CheckCircle,
  Eye,
  DoorClosed,
  Flame,
  Phone,
  Maximize2,
  FileText,
  ArrowRight,
  X,
  Compass
} from 'lucide-react';

interface CrimeScenePageProps {
  investigation: Investigation;
  evidenceList: DiscoveredEvidence[];
  onEvidenceDiscovered: () => void;
  onNavigate: (page: string) => void;
}

interface Hotspot {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  coords: { x: number; y: number }; // percentage on the image
  description: string;
  observation: string;
  associatedCodes: string[];
}

export const CrimeScenePage: React.FC<CrimeScenePageProps> = ({
  investigation,
  evidenceList,
  onEvidenceDiscovered,
  onNavigate,
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [examining, setExamining] = useState<boolean>(false);
  const [recentlyDiscovered, setRecentlyDiscovered] = useState<DiscoveredEvidence | null>(null);

  // 6 canonical hotspots on the study crime scene
  const hotspots: Hotspot[] = [
    {
      id: 'desk',
      name: 'Study Desk',
      icon: Search,
      coords: { x: 50, y: 64 },
      description: "Adrian's mahogany executive desk where he spent his final evening.",
      observation: "A spilled crystal glass with amber liquid, confidential Aegis wire documents, and an open desk calendar.",
      associatedCodes: ['EV-02', 'EV-03', 'EV-11'],
    },
    {
      id: 'door',
      name: 'Locked Door',
      icon: DoorClosed,
      coords: { x: 18, y: 48 },
      description: "The heavy antique oak study door, locked from the inside.",
      observation: "Recent scuff friction along the brass deadbolt strike plate and a clear nylon fiber pinched in the door seal.",
      associatedCodes: ['EV-01', 'EV-14'],
    },
    {
      id: 'window',
      name: 'Window & Terrace Door',
      icon: Maximize2,
      coords: { x: 82, y: 38 },
      description: "French terrace doors overlooking the rain-swept garden terrace.",
      observation: "Brass latches are locked from the inside. Mud impressions with Vibram diamond heels are visible outside on the wet stone.",
      associatedCodes: ['EV-06'],
    },
    {
      id: 'body',
      name: 'Body Location',
      icon: Eye,
      coords: { x: 48, y: 46 },
      description: "Adrian Vale's high-backed leather chair where his body was discovered slumped.",
      observation: "No signs of physical struggle, bruising, or trauma. Digitalis cardiac arrest occurred between 20:25 and 20:35.",
      associatedCodes: ['EV-12'],
    },
    {
      id: 'fireplace',
      name: 'Fireplace Hearth',
      icon: Flame,
      coords: { x: 30, y: 55 },
      description: "The brick fireplace containing dying embers and ashes.",
      observation: "A partially charred paper fragment with typed letters matching Marcus Reed's office typewriter.",
      associatedCodes: ['EV-13'],
    },
    {
      id: 'telephone',
      name: 'Telephone Console',
      icon: Phone,
      coords: { x: 68, y: 54 },
      description: "Brass desk telephone with connected receiver cord.",
      observation: "Sub-station carrier telemetry shows a call initiated at 20:21 dropped abruptly due to disconnect at 20:26.",
      associatedCodes: ['EV-04'],
    },
  ];

  // Helper to check if all associated evidence for a hotspot is discovered
  const isHotspotDiscovered = (hotspot: Hotspot) => {
    return hotspot.associatedCodes.every((code) =>
      evidenceList.some((e) => e.evidence.evidence_code === code)
    );
  };

  const handleExamineHotspot = async (hotspot: Hotspot) => {
    setExamining(true);
    setRecentlyDiscovered(null);
    try {
      let newestDiscovery: DiscoveredEvidence | null = null;
      // Discover any undiscovered associated evidence
      for (const code of hotspot.associatedCodes) {
        const already = evidenceList.find((e) => e.evidence.evidence_code === code);
        if (!already) {
          const disc = await api.discoverEvidence(investigation.id, code);
          newestDiscovery = disc;
        } else {
          newestDiscovery = already;
        }
      }
      onEvidenceDiscovered();
      setRecentlyDiscovered(newestDiscovery);
    } catch (err) {
      console.error('Failed to examine hotspot:', err);
    } finally {
      setExamining(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#2B303A] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-forensic text-[#D5AA63] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D5AA63] animate-pulse"></span>
            <span>STEP 1 • PHYSICAL INVESTIGATION</span>
          </div>
          <h1 className="font-serif-noir text-2xl md:text-3xl font-bold text-[#F0F0F2]">
            Crime Scene — Adrian Vale&apos;s Study
          </h1>
          <p className="text-xs text-[#9BA2AE] mt-1">
            Vale Manor, second floor. Click visible objects to examine physical clues and discover evidence.
          </p>
        </div>

        <button
          onClick={() => onNavigate('evidence')}
          className="px-4 py-2 rounded-lg bg-[#151922] hover:bg-[#1B202A] border border-[#D5AA63]/40 text-xs font-mono-forensic text-[#D5AA63] flex items-center space-x-1.5 self-start cursor-pointer transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Evidence File ({evidenceList.length} Discovered)</span>
        </button>
      </div>

      {/* Atmospheric Crime Scene Container */}
      <div className="relative rounded-2xl overflow-hidden border border-[#2B303A] bg-[#090A0D] aspect-[16/9] max-h-[580px] shadow-2xl group">
        <SafeImage
          src="/assets/study_crime_scene.jpg"
          alt="Adrian Vale Study Crime Scene"
          fallbackType="scene"
          fallbackTitle="Vale Manor Study"
          className="w-full h-full object-cover filter contrast-110 brightness-90"
        />

        {/* Ambient Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D]/80 via-transparent to-[#090A0D]/40 pointer-events-none" />

        {/* Status HUD Tag */}
        <div className="absolute top-4 left-4 flex items-center space-x-2 pointer-events-none">
          <span className="text-[10px] font-mono-forensic bg-[#090A0D]/90 text-[#D5AA63] px-2.5 py-1 rounded border border-[#D5AA63]/40 backdrop-blur-sm">
            CORDON ACTIVE • 21:15 HRS
          </span>
          <span className="text-[10px] font-mono-forensic bg-[#151922]/90 text-[#65B8A7] px-2.5 py-1 rounded border border-[#65B8A7]/40 backdrop-blur-sm flex items-center space-x-1">
            <Compass className="w-3 h-3" />
            <span>6 HOTSPOTS IDENTIFIED</span>
          </span>
        </div>

        {/* Interactive Hotspot Markers Overlaid on Image */}
        {hotspots.map((spot) => {
          const discovered = isHotspotDiscovered(spot);
          const isSelected = selectedHotspot?.id === spot.id;
          const SpotIcon = spot.icon;

          return (
            <button
              key={spot.id}
              onClick={() => {
                setSelectedHotspot(spot);
                setRecentlyDiscovered(null);
              }}
              style={{ left: `${spot.coords.x}%`, top: `${spot.coords.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center space-x-2 px-2.5 py-1.5 rounded-full text-xs font-mono-forensic transition-all cursor-pointer backdrop-blur-md shadow-lg ${
                isSelected
                  ? 'bg-[#D5AA63] text-[#090A0D] font-bold border-2 border-white scale-110 shadow-[0_0_20px_rgba(213,170,99,0.7)] z-20'
                  : discovered
                  ? 'bg-[#151922]/90 text-[#65B8A7] border border-[#65B8A7]/60 hover:scale-105 z-10'
                  : 'bg-[#090A0D]/90 text-[#D5AA63] border border-[#D5AA63]/80 hover:bg-[#D5AA63] hover:text-[#090A0D] hover:scale-110 z-10 animate-pulse'
              }`}
            >
              <SpotIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">{spot.name}</span>
              {discovered && <CheckCircle className="w-3 h-3 text-[#65B8A7]" />}
            </button>
          );
        })}
      </div>

      {/* Hotspots Quick Switch Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {hotspots.map((spot) => {
          const discovered = isHotspotDiscovered(spot);
          const isSelected = selectedHotspot?.id === spot.id;
          const SpotIcon = spot.icon;

          return (
            <button
              key={spot.id}
              onClick={() => {
                setSelectedHotspot(spot);
                setRecentlyDiscovered(null);
              }}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-[#1B202A] border-[#D5AA63] shadow-[0_0_12px_rgba(213,170,99,0.2)]'
                  : 'bg-[#101218] border-[#2B303A] hover:border-[#D5AA63]/40'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <SpotIcon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSelected ? 'text-[#D5AA63]' : discovered ? 'text-[#65B8A7]' : 'text-[#9BA2AE]'
                  }`}
                />
                <span className="text-xs font-medium text-[#F0F0F2] truncate">{spot.name}</span>
              </div>
              {discovered && <span className="text-[10px] text-[#65B8A7] font-mono-forensic">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Selected Object Examination Modal / Drawer */}
      {selectedHotspot && (
        <div className="p-6 rounded-xl bg-[#101218] border border-[#D5AA63]/40 space-y-4 shadow-xl">
          <div className="flex items-start justify-between border-b border-[#2B303A] pb-3">
            <div>
              <span className="text-[10px] font-mono-forensic text-[#D5AA63] uppercase">
                INVESTIGATION STATION
              </span>
              <h2 className="font-serif-noir text-xl font-bold text-[#F0F0F2] flex items-center space-x-2">
                <span>{selectedHotspot.name}</span>
                {isHotspotDiscovered(selectedHotspot) && (
                  <span className="text-xs font-mono-forensic text-[#65B8A7] px-2 py-0.5 rounded bg-[#65B8A7]/10 border border-[#65B8A7]/30">
                    EXAMINED ✓
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedHotspot(null);
                setRecentlyDiscovered(null);
              }}
              className="text-[#656C7A] hover:text-[#F0F0F2] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A] space-y-1">
              <span className="text-[10px] font-mono-forensic text-[#656C7A] uppercase block">
                DESCRIPTION:
              </span>
              <p className="text-[#F0F0F2] leading-relaxed">{selectedHotspot.description}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#151922] border border-[#2B303A] space-y-1">
              <span className="text-[10px] font-mono-forensic text-[#D5AA63] uppercase block">
                WHAT CAN BE OBSERVED:
              </span>
              <p className="text-[#9BA2AE] leading-relaxed">{selectedHotspot.observation}</p>
            </div>
          </div>

          {/* Recently Discovered Evidence Callout */}
          {recentlyDiscovered && (
            <div className="p-4 rounded-lg bg-[#1B202A] border border-[#65B8A7]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-[#65B8A7] shrink-0" />
                <div>
                  <span className="text-[10px] font-mono-forensic text-[#65B8A7] font-bold block">
                    NEW EVIDENCE LOGGED • [{recentlyDiscovered.evidence.evidence_code}]
                  </span>
                  <span className="text-xs font-bold text-[#F0F0F2]">
                    {recentlyDiscovered.evidence.title}
                  </span>
                  <p className="text-[11px] text-[#9BA2AE] mt-0.5">
                    {recentlyDiscovered.evidence.short_description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('evidence')}
                className="px-4 py-2 rounded-lg bg-[#65B8A7] hover:bg-[#52a493] text-[#090A0D] text-xs font-mono-forensic font-bold uppercase tracking-wider flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer shrink-0"
              >
                <span>View in Evidence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => handleExamineHotspot(selectedHotspot)}
              disabled={examining}
              className="px-6 py-2.5 rounded-lg bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] text-xs font-mono-forensic font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Eye className="w-4 h-4" />
              <span>{examining ? 'Examining...' : isHotspotDiscovered(selectedHotspot) ? 'Re-Examine Object' : 'Examine Object'}</span>
            </button>

            <button
              onClick={() => onNavigate('evidence')}
              className="text-xs font-mono-forensic text-[#D5AA63] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Review Discovered Evidence ({evidenceList.length}) →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
