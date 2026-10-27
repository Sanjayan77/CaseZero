import {
  User,
  CasePublic,
  CaseDetail,
  Investigation,
  DiscoveredEvidence,
  Suspect,
  Interview,
  InterviewMessage,
  BoardState,
  TimelineEvent,
  AccusationResult,
  AIStatus,
  MentorGuidance,
  EvidenceExplanation,
  TheoryReview
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '') : '') + '/api';

class ApiService {
  private tokenKey = 'casezero_jwt_token';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred during investigation request';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // fallback to status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth
  async register(username: string, email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(username: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async demoLogin(): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/demo', {
      method: 'POST',
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  logout(): void {
    this.clearToken();
  }

  // Cases & Investigation
  async getCases(): Promise<CasePublic[]> {
    return this.request<CasePublic[]>('/cases');
  }

  async getCaseDetail(caseId: string): Promise<CaseDetail> {
    return this.request<CaseDetail>(`/cases/${caseId}`);
  }

  async startCase(caseId: string): Promise<Investigation> {
    return this.request<Investigation>(`/cases/${caseId}/start`, {
      method: 'POST',
    });
  }

  async getInvestigations(): Promise<Investigation[]> {
    return this.request<Investigation[]>('/investigations');
  }

  async getInvestigation(id: number): Promise<Investigation> {
    return this.request<Investigation>(`/investigations/${id}`);
  }

  // Evidence
  async getEvidence(investigationId: number): Promise<DiscoveredEvidence[]> {
    return this.request<DiscoveredEvidence[]>(`/investigations/${investigationId}/evidence`);
  }

  async discoverEvidence(investigationId: number, evidenceCode: string): Promise<DiscoveredEvidence> {
    return this.request<DiscoveredEvidence>(`/investigations/${investigationId}/evidence/discover`, {
      method: 'POST',
      body: JSON.stringify({ evidence_code: evidenceCode }),
    });
  }

  async inspectEvidence(investigationId: number, evidenceId: number): Promise<DiscoveredEvidence> {
    return this.request<DiscoveredEvidence>(`/investigations/${investigationId}/evidence/${evidenceId}/inspect`, {
      method: 'POST',
    });
  }

  async togglePinEvidence(investigationId: number, evidenceId: number): Promise<DiscoveredEvidence> {
    return this.request<DiscoveredEvidence>(`/investigations/${investigationId}/evidence/${evidenceId}/pin`, {
      method: 'POST',
    });
  }

  async updateEvidenceNote(investigationId: number, evidenceId: number, notes: string): Promise<DiscoveredEvidence> {
    return this.request<DiscoveredEvidence>(`/investigations/${investigationId}/evidence/${evidenceId}/note`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  // Interrogation
  async getSuspects(investigationId: number): Promise<Suspect[]> {
    return this.request<Suspect[]>(`/investigations/${investigationId}/suspects`);
  }

  async getInterview(investigationId: number, suspectId: number): Promise<Interview> {
    return this.request<Interview>(`/investigations/${investigationId}/interviews/${suspectId}`);
  }

  async sendInterrogationMessage(
    investigationId: number,
    suspectId: number,
    content: string,
    referencedEvidenceCode?: string
  ): Promise<InterviewMessage> {
    return this.request<InterviewMessage>(`/investigations/${investigationId}/interviews/${suspectId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        referenced_evidence_code: referencedEvidenceCode || null,
      }),
    });
  }

  // Evidence Board
  async getBoard(investigationId: number): Promise<BoardState> {
    return this.request<BoardState>(`/investigations/${investigationId}/board`);
  }

  async syncBoard(investigationId: number, boardState: BoardState): Promise<BoardState> {
    return this.request<BoardState>(`/investigations/${investigationId}/board`, {
      method: 'PUT',
      body: JSON.stringify(boardState),
    });
  }

  async saveBoard(investigationId: number, boardState: BoardState): Promise<BoardState> {
    return this.syncBoard(investigationId, boardState);
  }

  // Timeline
  async getTimeline(investigationId: number): Promise<TimelineEvent[]> {
    return this.request<TimelineEvent[]>(`/investigations/${investigationId}/timeline`);
  }

  // Final Deduction & Results
  async submitAccusation(
    investigationId: number,
    data: {
      suspect_name: string;
      motive: string;
      method: string;
      timeline_explanation: string;
      supporting_evidence_codes: string[];
      written_deduction: string;
    }
  ): Promise<AccusationResult> {
    return this.request<AccusationResult>(`/investigations/${investigationId}/accusation`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getResults(investigationId: number): Promise<AccusationResult> {
    return this.request<AccusationResult>(`/investigations/${investigationId}/results`);
  }

  // AI Diagnostics
  async getAIStatus(): Promise<AIStatus> {
    return this.request<AIStatus>('/ai/status');
  }

  async testAIConnection(): Promise<AIStatus> {
    return this.request<AIStatus>('/ai/test', {
      method: 'POST',
    });
  }

  // Detective Morgan Mentor Guidance & Objectives
  async getMentorGuidance(investigationId: number): Promise<MentorGuidance> {
    return this.request<MentorGuidance>(`/investigations/${investigationId}/mentor`);
  }

  async explainEvidence(investigationId: number, evidenceCode: string): Promise<EvidenceExplanation> {
    return this.request<EvidenceExplanation>(`/investigations/${investigationId}/mentor/explain/${evidenceCode}`);
  }

  async reviewDraftTheory(
    investigationId: number,
    draft: {
      suspect_name: string;
      motive: string;
      method: string;
      timeline_explanation: string;
      supporting_evidence_codes: string[];
      written_deduction: string;
    }
  ): Promise<TheoryReview> {
    return this.request<TheoryReview>(`/investigations/${investigationId}/mentor/pre-review`, {
      method: 'POST',
      body: JSON.stringify(draft),
    });
  }

  async chatWithAssistant(
    investigationId: number,
    message: string,
    chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<{ response: string; is_real_ai: boolean; model_used?: string; error?: string }> {
    return this.request<{ response: string; is_real_ai: boolean; model_used?: string; error?: string }>(
      `/investigations/${investigationId}/assistant/chat`,
      {
        method: 'POST',
        body: JSON.stringify({
          message,
          chat_history: chatHistory || [],
        }),
      }
    );
  }

  // --- Website Support, FAQ, Health & Diagnostics Endpoints ---

  async getFAQs(category?: string, search?: string): Promise<import('../types').FAQItem[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<import('../types').FAQItem[]>(`/support/faqs${qs}`);
  }

  async chatWithSupportAssistant(
    message: string,
    chatHistory?: Array<{ role: string; content: string }>,
    sessionId?: string,
    userEmail?: string,
    userName?: string
  ): Promise<import('../types').SupportChatResponse> {
    return this.request<import('../types').SupportChatResponse>('/support/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        chat_history: chatHistory || [],
        session_id: sessionId,
        user_email: userEmail || 'investigator@casezero.local',
        user_name: userName || 'Investigator',
      }),
    });
  }

  async createSupportTicket(
    subject: string,
    description: string,
    category?: string,
    priority?: string,
    userEmail?: string,
    userName?: string
  ): Promise<import('../types').SupportTicketItem> {
    return this.request<import('../types').SupportTicketItem>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify({
        subject,
        description,
        category: category || 'Investigation Support',
        priority: priority || 'normal',
        user_email: userEmail || 'investigator@casezero.local',
        user_name: userName || 'Investigator',
      }),
    });
  }

  async getSupportTickets(statusFilter?: string): Promise<import('../types').SupportTicketItem[]> {
    const qs = statusFilter ? `?status_filter=${encodeURIComponent(statusFilter)}` : '';
    return this.request<import('../types').SupportTicketItem[]>(`/support/tickets${qs}`);
  }

  async submitFeedback(
    rating: number,
    comments?: string,
    category?: string,
    sessionId?: string
  ): Promise<{ status: string; message: string; record_id: string; is_mock: boolean }> {
    return this.request<{ status: string; message: string; record_id: string; is_mock: boolean }>('/support/feedback', {
      method: 'POST',
      body: JSON.stringify({
        rating,
        comments,
        category: category || 'general',
        session_id: sessionId,
      }),
    });
  }

  async getWeatherAdvisory(timeout?: number): Promise<import('../types').WeatherAdvisory> {
    const qs = timeout !== undefined ? `?timeout=${timeout}` : '';
    return this.request<import('../types').WeatherAdvisory>(`/support/weather${qs}`);
  }

  async getErrorDocumentation(): Promise<{
    title: string;
    site_specific_code: { code: string; name: string; description: string };
    errors: import('../types').ErrorDocItem[];
  }> {
    return this.request<{
      title: string;
      site_specific_code: { code: string; name: string; description: string };
      errors: import('../types').ErrorDocItem[];
    }>('/errors/documentation');
  }

  async triggerErrorScenario(code: number): Promise<any> {
    return this.request<any>(`/errors/trigger/${code}`);
  }

  async getSystemHealth(): Promise<import('../types').SystemHealthData> {
    return this.request<import('../types').SystemHealthData>('/health');
  }
}

export const api = new ApiService();

