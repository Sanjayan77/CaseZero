export interface User {
  id: number;
  username: string;
  email: string;
  badge_title: string;
  created_at: string;
}

export interface CasePublic {
  id: number;
  case_id: string;
  title: string;
  summary: string;
  victim_name: string;
  victim_role: string;
  crime_location: string;
  crime_time_est: string;
  objective: string;
  difficulty: string;
  status: string;
  cover_image?: string;
  crime_scene_image?: string;
}

export interface CaseDetail extends CasePublic {
  initial_facts: string;
}

export interface Investigation {
  id: number;
  case_id: number;
  case: CasePublic;
  status: 'in_progress' | 'submitted' | 'completed';
  started_at: string;
  completed_at?: string;
  final_score?: number;
  discovered_count: number;
  inspected_count: number;
}

export interface Evidence {
  id: number;
  evidence_code: string;
  title: string;
  type: string;
  category: string;
  short_description: string;
  full_description: string;
  image_url?: string;
  forensic_details?: string;
  significance: string;
  initial_discovered: boolean;
}

export interface DiscoveredEvidence {
  id: number;
  evidence_id: number;
  evidence: Evidence;
  discovered_at: string;
  inspected: boolean;
  inspected_at?: string;
  pinned: boolean;
  player_notes: string;
}

export interface Suspect {
  id: number;
  suspect_key: string;
  name: string;
  role: string;
  relationship_to_victim: string;
  public_bio: string;
  known_alibi: string;
  portrait_image: string;
  speaking_style: string;
}

export interface InterviewMessage {
  id: number;
  sender: 'player' | 'suspect' | 'system';
  content: string;
  referenced_evidence_code?: string;
  emotion?: string;
  is_fallback: boolean;
  follow_up_suggestions?: string[];
  created_at: string;
}

export interface Interview {
  id: number;
  suspect_id: number;
  suspect: Suspect;
  status: string;
  last_interaction_at: string;
  messages: InterviewMessage[];
}

export interface BoardNode {
  node_id: string;
  node_type: 'evidence' | 'suspect' | 'event' | 'note';
  ref_code?: string;
  title: string;
  content?: string;
  pos_x: number;
  pos_y: number;
  color?: string;
}

export interface BoardEdge {
  edge_id: string;
  source_node_id: string;
  target_node_id: string;
  label: string;
}

export interface BoardState {
  nodes: BoardNode[];
  edges: BoardEdge[];
}

export interface TimelineEvent {
  id: number;
  time_marker: string;
  title: string;
  location: string;
  description: string;
  is_established_fact: boolean;
  associated_suspects: string[];
  conflicting_claims?: string;
  supporting_evidence_codes: string[];
}

export interface ScoreBreakdown {
  culprit_score: number;
  motive_score: number;
  method_score: number;
  timeline_score: number;
  evidence_score: number;
  explanation_score: number;
  total_score: number;
  is_correct_culprit: boolean;
  evaluations?: Record<string, string>;
}

export interface AccusationResult {
  investigation_id: number;
  final_score: number;
  score_breakdown: ScoreBreakdown;
  actual_culprit: string;
  actual_motive: string;
  actual_method: string;
  actual_timeline_solution: string;
  canonical_explanation: string;
  decisive_evidence: string[];
  suspect_resolutions: Record<string, string>;
}

export interface AIStatus {
  status: 'connected' | 'connecting' | 'unavailable' | 'development_fallback' | 'fallback';
  provider: 'gemini' | 'openai' | 'none';
  model: string;
  real_ai_active: boolean;
  has_api_key: boolean;
  message: string;
  env_var_name: string;
  help?: string;
}

export interface ObjectiveItem {
  id: number;
  title: string;
  description: string;
  is_completed: boolean;
  target_page: string;
  importance: string;
}

export interface MentorGuidance {
  mentor_name: string;
  mentor_title: string;
  phase: string;
  objective_title: string;
  objective_description: string;
  target_page: string;
  hints: {
    level_1_nudge: string;
    level_2_stronger: string;
    level_3_deduction: string;
  };
  objectives: ObjectiveItem[];
  active_objective_index?: number;
  progress_summary: {
    discovered_clues: number;
    inspected_clues: number;
    suspects_interviewed: number;
    case_status: string;
  };
}

export interface EvidenceExplanation {
  evidence_code: string;
  title: string;
  what_we_found: string;
  what_it_tells_us: string;
  why_it_matters: string;
  unlocked_connections: string[];
  senior_advice: string;
}

export interface TheoryReview {
  review_verdict: 'strong' | 'promising' | 'incomplete';
  strengths: string[];
  cautions: string[];
  senior_feedback: string;
  questions_to_answer: string[];
}
