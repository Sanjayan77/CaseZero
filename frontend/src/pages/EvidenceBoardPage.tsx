import React, { useState, useEffect, useRef } from 'react';
import { BoardNode, BoardEdge, BoardState, DiscoveredEvidence, Suspect } from '../types';
import { api } from '../services/api';
import {
  Save,
  Plus,
  Trash2,
  Move,
  Link as LinkIcon,
  Search,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Compass,
  LayoutGrid,
  Network,
  Clock,
  ArrowRight
} from 'lucide-react';

interface EvidenceBoardPageProps {
  investigationId: number;
  evidenceList: DiscoveredEvidence[];
  suspects: Suspect[];
}

export const EvidenceBoardPage: React.FC<EvidenceBoardPageProps> = ({
  investigationId,
  evidenceList,
  suspects,
}) => {
  const [boardView, setBoardView] = useState<'notes' | 'board'>('notes');
  const [board, setBoard] = useState<BoardState>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Edge creation state
  const [linkingSourceNodeId, setLinkingSourceNodeId] = useState<string | null>(null);
  const [edgeLabel, setEdgeLabel] = useState<string>('contradicts');

  // Custom note creation
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);

  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api
      .getBoard(investigationId)
      .then((data) => {
        if (isMounted) {
          setBoard(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load board state:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [investigationId]);

  const handleMouseDown = (e: React.MouseEvent, node: BoardNode) => {
    e.stopPropagation();
    if (linkingSourceNodeId) {
      if (linkingSourceNodeId !== node.node_id) {
        const newEdge: BoardEdge = {
          edge_id: `edge_${Date.now()}`,
          source_node_id: linkingSourceNodeId,
          target_node_id: node.node_id,
          label: edgeLabel,
        };
        setBoard((prev) => ({
          ...prev,
          edges: [...prev.edges, newEdge],
        }));
      }
      setLinkingSourceNodeId(null);
      return;
    }

    setDraggingNodeId(node.node_id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const newX = Math.max(20, Math.min(boardRect.width - 240, e.clientX - boardRect.left - dragOffset.x));
    const newY = Math.max(20, Math.min(boardRect.height - 180, e.clientY - boardRect.top - dragOffset.y));

    setBoard((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) =>
        node.node_id === draggingNodeId ? { ...node, pos_x: newX, pos_y: newY } : node
      ),
    }));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleSaveBoard = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.saveBoard(investigationId, board);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save board:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddEvidenceNode = (ev: DiscoveredEvidence) => {
    const newNode: BoardNode = {
      node_id: `node_ev_${ev.evidence.evidence_code}_${Date.now()}`,
      node_type: 'evidence',
      ref_code: ev.evidence.evidence_code,
      title: `[${ev.evidence.evidence_code}] ${ev.evidence.title}`,
      content: ev.evidence.short_description,
      pos_x: 50 + Math.random() * 200,
      pos_y: 50 + Math.random() * 200,
      color: '#D5AA63',
    };
    setBoard((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
    setShowAddMenu(false);
  };

  const handleAddSuspectNode = (suspect: Suspect) => {
    const newNode: BoardNode = {
      node_id: `node_sus_${suspect.id}_${Date.now()}`,
      node_type: 'suspect',
      ref_code: suspect.suspect_key,
      title: suspect.name,
      content: `Alibi: ${suspect.known_alibi}`,
      pos_x: 250 + Math.random() * 200,
      pos_y: 50 + Math.random() * 200,
      color: '#65B8A7',
    };
    setBoard((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
    setShowAddMenu(false);
  };

  const handleAddCustomNote = () => {
    if (!noteTitle.trim()) return;
    const newNode: BoardNode = {
      node_id: `node_note_${Date.now()}`,
      node_type: 'note',
      title: 'Detective Note',
      content: noteTitle.trim(),
      pos_x: 150 + Math.random() * 200,
      pos_y: 150 + Math.random() * 200,
      color: '#D9535D',
    };
    setBoard((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
    setNoteTitle('');
    setShowAddMenu(false);
  };

  const handleDeleteNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBoard((prev) => ({
      nodes: prev.nodes.filter((n) => n.node_id !== nodeId),
      edges: prev.edges.filter((edge) => edge.source_node_id !== nodeId && edge.target_node_id !== nodeId),
    }));
  };

  // Case suggestions generated from discovered evidence
  const caseSuggestions = [
    {
      title: "Compare Evelyn's stated location with the dinner timeline",
      detail: "Evelyn claims she was reading in the library, yet the power dipped at 8:33 PM and servants reported no lights on in the east wing.",
      tag: "Timeline Check",
    },
    {
      title: "Cross-examine Marcus on the offshore ledger",
      detail: "The encrypted ledger reveals $22.5M missing. Adrian had scheduled a meeting with federal auditors for the very next morning.",
      tag: "Motive Correlation",
    },
    {
      title: "Analyze the locked-room illusion with physical clues",
      detail: "The monofilament thread and deadbolt setup required access from the inside, staged before the killer slipped out into the corridor.",
      tag: "Method Analysis",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-5.5rem)] flex flex-col space-y-4">
      {/* Top Header & Dual View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2B303A] pb-4">
        <div>
          <span className="text-[10px] font-mono-forensic text-[#D5AA63] uppercase tracking-wider">
            SYNTHESIS & ANALYSIS
          </span>
          <h2 className="text-xl font-bold text-[#F0F0F2] font-serif-cinematic">
            {boardView === 'notes' ? 'Case Notes & Evidence Dossier' : 'Interactive Evidence Board'}
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          {/* Dual View Segmented Control */}
          <div className="bg-[#151922] p-1 rounded-lg border border-[#2B303A] flex items-center space-x-1">
            <button
              onClick={() => setBoardView('notes')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono-forensic flex items-center space-x-1.5 transition-colors cursor-pointer ${
                boardView === 'notes'
                  ? 'bg-[#D5AA63] text-[#090A0D] font-bold'
                  : 'text-[#9BA2AE] hover:text-[#F0F0F2]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Simple Case Notes</span>
            </button>
            <button
              onClick={() => setBoardView('board')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono-forensic flex items-center space-x-1.5 transition-colors cursor-pointer ${
                boardView === 'board'
                  ? 'bg-[#D5AA63] text-[#090A0D] font-bold'
                  : 'text-[#9BA2AE] hover:text-[#F0F0F2]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Interactive Board</span>
            </button>
          </div>

          {boardView === 'board' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="px-3 py-1.5 bg-[#1B202A] hover:bg-[#2B303A] border border-[#2B303A] rounded-md text-xs font-mono-forensic text-[#D5AA63] flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Node</span>
              </button>

              <button
                onClick={handleSaveBoard}
                disabled={saving}
                className="px-4 py-1.5 bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] rounded-md text-xs font-mono-forensic font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Board'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: SIMPLE CASE NOTES (Beginner-Friendly Structured Dossier) */}
      {boardView === 'notes' && (
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Senior Detective Morgan's Strategic Suggestions */}
          <div className="bg-[#151922] border border-[#D5AA63]/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-[#D5AA63]">
              <Compass className="w-4 h-4" />
              <h3 className="text-xs font-mono-forensic font-bold uppercase tracking-wider">
                Detective Morgan’s Suggested Clue Corroborations
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {caseSuggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="bg-[#101218] border border-[#2B303A] rounded-lg p-3 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] font-mono-forensic text-[#65B8A7] bg-[#151922] px-2 py-0.5 rounded border border-[#2B303A] inline-block mb-1.5">
                      {sug.tag}
                    </span>
                    <h4 className="text-xs font-bold text-[#F0F0F2] mb-1">
                      {sug.title}
                    </h4>
                    <p className="text-[11px] text-[#9BA2AE] leading-relaxed">
                      {sug.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dual Column: Discovered Physical Clues vs. Suspect Alibis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Discovered Physical Clues */}
            <div className="lg:col-span-6 bg-[#101218] border border-[#2B303A] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2B303A] pb-3">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-[#D5AA63]" />
                  <h3 className="text-sm font-bold text-[#F0F0F2] font-mono-forensic uppercase">
                    Discovered Forensic Clues ({evidenceList.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono-forensic text-[#9BA2AE]">
                  PHYSICAL EVIDENCE
                </span>
              </div>

              {evidenceList.length === 0 ? (
                <div className="text-xs font-mono-forensic text-[#9BA2AE] py-8 text-center">
                  NO EVIDENCE RECORDED YET. INSPECT THE CRIME SCENE FIRST.
                </div>
              ) : (
                <div className="space-y-3">
                  {evidenceList.map((disc) => (
                    <div
                      key={disc.id}
                      className="p-3 bg-[#151922] border border-[#2B303A] rounded-lg flex items-start space-x-3"
                    >
                      <img
                        src={disc.evidence.image_url}
                        alt={disc.evidence.title}
                        className="w-14 h-14 rounded object-cover border border-[#2B303A] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono-forensic text-[#D5AA63]">
                            [{disc.evidence.evidence_code}] {disc.evidence.category.toUpperCase()}
                          </span>
                          <span className="text-[9px] font-mono-forensic text-[#65B8A7] bg-[#090A0D] px-1.5 py-0.2 rounded border border-[#2B303A]">
                            AUTHENTICATED
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#F0F0F2] mt-0.5">
                          {disc.evidence.title}
                        </h4>
                        <p className="text-[11px] text-[#9BA2AE] mt-1 leading-relaxed">
                          {disc.evidence.short_description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suspects & Stated Alibis */}
            <div className="lg:col-span-6 bg-[#101218] border border-[#2B303A] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2B303A] pb-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#65B8A7]" />
                  <h3 className="text-sm font-bold text-[#F0F0F2] font-mono-forensic uppercase">
                    Suspect Profiles & Stated Alibis ({suspects.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono-forensic text-[#9BA2AE]">
                  TESTIMONY LOG
                </span>
              </div>

              <div className="space-y-3">
                {suspects.map((suspect) => (
                  <div
                    key={suspect.id}
                    className="p-3 bg-[#151922] border border-[#2B303A] rounded-lg flex items-start space-x-3"
                  >
                    <img
                      src={suspect.portrait_image}
                      alt={suspect.name}
                      className="w-12 h-12 rounded object-cover border border-[#2B303A] shrink-0 filter contrast-110"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#F0F0F2]">
                          {suspect.name}
                        </h4>
                        <span className="text-[9px] font-mono-forensic text-[#9BA2AE]">
                          {suspect.relationship_to_victim}
                        </span>
                      </div>
                      <div className="mt-1 bg-[#101218] p-2 rounded border border-[#2B303A]">
                        <span className="text-[9px] font-mono-forensic text-[#D5AA63] block uppercase mb-0.5">
                          Declared Alibi:
                        </span>
                        <p className="text-[11px] text-[#9BA2AE] italic leading-tight">
                          "{suspect.known_alibi}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE EVIDENCE BOARD (Advanced Drag-and-Connect Graph) */}
      {boardView === 'board' && (
        <div
          ref={boardRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex-1 bg-[#101218] border border-[#2B303A] rounded-xl relative overflow-hidden select-none min-h-[500px]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(43, 48, 58, 0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {/* Add Node Menu Overlay */}
          {showAddMenu && (
            <div className="absolute top-4 left-4 z-30 bg-[#151922] border border-[#2B303A] rounded-xl p-4 shadow-2xl w-80 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2B303A] pb-2">
                <span className="text-xs font-bold text-[#F0F0F2] font-mono-forensic uppercase">
                  ADD TO EVIDENCE BOARD
                </span>
                <button
                  onClick={() => setShowAddMenu(false)}
                  className="text-xs text-[#9BA2AE] hover:text-[#F0F0F2]"
                >
                  ✕
                </button>
              </div>

              <div>
                <span className="text-[10px] font-mono-forensic text-[#D5AA63] block mb-2 uppercase">
                  Attach Evidence Clue:
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {evidenceList.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => handleAddEvidenceNode(ev)}
                      className="w-full text-left text-xs p-2 rounded bg-[#101218] hover:bg-[#1B202A] text-[#F0F0F2] truncate border border-[#2B303A] cursor-pointer"
                    >
                      [{ev.evidence.evidence_code}] {ev.evidence.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono-forensic text-[#65B8A7] block mb-2 uppercase">
                  Attach Suspect:
                </span>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {suspects.map((sus) => (
                    <button
                      key={sus.id}
                      onClick={() => handleAddSuspectNode(sus)}
                      className="w-full text-left text-xs p-2 rounded bg-[#101218] hover:bg-[#1B202A] text-[#F0F0F2] truncate border border-[#2B303A] cursor-pointer"
                    >
                      {sus.name} ({sus.role})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono-forensic text-[#D9535D] block mb-2 uppercase">
                  Write Custom Hypothesis Note:
                </span>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Enter deduction note..."
                    className="flex-1 bg-[#101218] border border-[#2B303A] rounded px-2.5 py-1 text-xs text-[#F0F0F2] focus:outline-none"
                  />
                  <button
                    onClick={handleAddCustomNote}
                    className="px-3 py-1 bg-[#D9535D] text-white rounded text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SVG Connection String Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {board.edges.map((edge) => {
              const startNode = board.nodes.find((n) => n.node_id === edge.source_node_id);
              const endNode = board.nodes.find((n) => n.node_id === edge.target_node_id);
              if (!startNode || !endNode) return null;

              const start = { x: startNode.pos_x + 112, y: startNode.pos_y + 50 };
              const end = { x: endNode.pos_x + 112, y: endNode.pos_y + 50 };

              const isContradiction = edge.label === 'contradicts';
              const isSupport = edge.label === 'supports';
              const strokeColor = isContradiction ? '#D9535D' : isSupport ? '#65B8A7' : '#D5AA63';
              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;

              return (
                <g key={edge.edge_id}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={strokeColor}
                    strokeWidth={2}
                    strokeDasharray={isContradiction ? '4 3' : 'none'}
                    strokeOpacity={0.8}
                  />
                  <circle cx={start.x} cy={start.y} r={4} fill={strokeColor} />
                  <circle cx={end.x} cy={end.y} r={4} fill={strokeColor} />

                  <rect
                    x={midX - 35}
                    y={midY - 10}
                    width={70}
                    height={20}
                    rx={4}
                    fill="#151922"
                    stroke={strokeColor}
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill="#F0F0F2"
                    fontSize="9px"
                    fontFamily="monospace"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Board Nodes */}
          {board.nodes.map((node) => {
            const isSelectedForLink = linkingSourceNodeId === node.node_id;

            return (
              <div
                key={node.node_id}
                onMouseDown={(e) => handleMouseDown(e, node)}
                style={{
                  left: `${node.pos_x}px`,
                  top: `${node.pos_y}px`,
                  borderColor: isSelectedForLink ? '#D9535D' : node.color || '#2B303A',
                }}
                className={`absolute w-56 rounded-lg bg-[#151922] p-3.5 shadow-xl border-2 z-20 cursor-move transition-shadow ${
                  isSelectedForLink
                    ? 'ring-2 ring-[#D9535D] animate-pulse'
                    : 'hover:shadow-[0_0_15px_rgba(213,170,99,0.2)]'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span
                    style={{ color: node.color }}
                    className="text-[10px] font-mono-forensic uppercase font-bold tracking-wider truncate"
                  >
                    {node.node_type}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLinkingSourceNodeId(node.node_id);
                      }}
                      title="Connect this node"
                      className="p-1 rounded hover:bg-[#1B202A] text-[#9BA2AE] hover:text-[#D5AA63]"
                    >
                      <LinkIcon className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteNode(node.node_id, e)}
                      title="Remove from board"
                      className="p-1 rounded hover:bg-[#1B202A] text-[#9BA2AE] hover:text-[#D9535D]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h4 className="font-serif-noir text-xs font-bold text-[#F0F0F2] mb-1 line-clamp-2">
                  {node.title}
                </h4>

                {node.content && (
                  <p className="text-[11px] text-[#9BA2AE] line-clamp-2 font-mono-forensic">
                    {node.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
