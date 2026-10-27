import React, { useState, useEffect } from 'react';
import { User, CasePublic, CaseDetail, Investigation, DiscoveredEvidence, Suspect, AIStatus } from './types';
import { api } from './services/api';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { DetectiveHandbookModal } from './components/DetectiveHandbookModal';
import { AssistantDetective } from './components/AssistantDetective';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StoryModePage } from './pages/StoryModePage';
import { CrimeScenePage } from './pages/CrimeScenePage';
import { EvidenceLabPage } from './pages/EvidenceLabPage';
import { SuspectDirectoryPage } from './pages/SuspectDirectoryPage';
import { InterrogationPage } from './pages/InterrogationPage';
import { DeductionPage } from './pages/DeductionPage';
import { CaseReviewPage } from './pages/CaseReviewPage';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [, setCases] = useState<CasePublic[]>([]);
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [evidenceList, setEvidenceList] = useState<DiscoveredEvidence[]>([]);
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [selectedSuspectId, setSelectedSuspectId] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Diagnostics & Modal state
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const [isHandbookOpen, setIsHandbookOpen] = useState<boolean>(false);

  // Load user session on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        const token = api.getToken();
        if (token) {
          const me = await api.getMe();
          setUser(me);
          setCurrentPage('crimescene');
        }
      } catch (err) {
        console.warn('Session expired or not found:', err);
        api.clearToken();
      } finally {
        setInitialLoading(false);
      }
    };
    initApp();
    refreshAIStatus();
  }, []);

  // Load cases and case CZ-001 detail
  useEffect(() => {
    api.getCases()
      .then((data) => {
        setCases(data);
        if (data.length > 0) {
          api.getCaseDetail(data[0].case_id)
            .then(setCaseDetail)
            .catch(console.error);
        }
      })
      .catch(console.error);
  }, []);

  // When user is set, check for an existing active investigation
  useEffect(() => {
    if (!user) {
      setInvestigation(null);
      setEvidenceList([]);
      setSuspects([]);
      return;
    }

    api.getInvestigations()
      .then((invList) => {
        if (invList.length > 0) {
          const active = invList[0];
          setInvestigation(active);
          loadInvestigationData(active.id);
        }
      })
      .catch(console.error);
  }, [user]);

  const refreshAIStatus = async () => {
    try {
      const st = await api.getAIStatus();
      setAIStatus(st);
    } catch (err) {
      console.warn('Could not fetch AI status:', err);
    }
  };

  const loadInvestigationData = async (invId: number) => {
    try {
      const [evList, susList] = await Promise.all([
        api.getEvidence(invId),
        api.getSuspects(invId),
      ]);
      setEvidenceList(evList);
      setSuspects(susList);
    } catch (err) {
      console.error('Failed to load investigation data:', err);
    }
  };

  const handleStartDemo = async () => {
    try {
      const demoRes = await api.demoLogin();
      setUser(demoRes.user);
      const inv = await api.startCase('CZ-001');
      setInvestigation(inv);
      await loadInvestigationData(inv.id);
      setCurrentPage('crimescene');
    } catch (err) {
      console.error('Demo login failed:', err);
    }
  };

  const handleLoginSuccess = async (loggedInUser: User) => {
    setUser(loggedInUser);
    try {
      const invList = await api.getInvestigations();
      if (invList.length > 0) {
        const active = invList[0];
        setInvestigation(active);
        await loadInvestigationData(active.id);
        setCurrentPage('crimescene');
      } else {
        const newInv = await api.startCase('CZ-001');
        setInvestigation(newInv);
        await loadInvestigationData(newInv.id);
        setCurrentPage('crimescene');
      }
    } catch {
      setCurrentPage('crimescene');
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setInvestigation(null);
    setCurrentPage('landing');
  };

  const handleEvidenceRefresh = () => {
    if (investigation) {
      loadInvestigationData(investigation.id);
    }
  };

  const handleSelectSuspectForInterrogation = (suspectId: number) => {
    setSelectedSuspectId(suspectId);
    setCurrentPage('interrogation');
  };

  const handleAccusationSubmitted = () => {
    if (investigation) {
      api.getInvestigation(investigation.id)
        .then((updatedInv) => {
          setInvestigation(updatedInv);
        })
        .catch(console.error);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#090A0D] flex items-center justify-center text-xs font-mono-forensic text-[#D5AA63]">
        INITIALIZING CASEZERO INVESTIGATION TERMINAL...
      </div>
    );
  }

  // Standalone pages
  if (currentPage === 'landing') {
    return (
      <LandingPage
        onStartDemo={handleStartDemo}
        onNavigate={setCurrentPage}
      />
    );
  }

  if (currentPage === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigate={setCurrentPage}
        onStartDemo={handleStartDemo}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <RegisterPage
        onRegisterSuccess={handleLoginSuccess}
        onNavigate={setCurrentPage}
      />
    );
  }

  // Authenticated Investigation Application Shell
  return (
    <div className="min-h-screen bg-[#090A0D] text-[#F0F0F2] flex flex-col font-sans">
      <TopBar
        user={user}
        investigation={investigation}
        aiStatus={aiStatus}
        onRefreshAIStatus={refreshAIStatus}
        onOpenHandbook={() => setIsHandbookOpen(true)}
        onLogout={handleLogout}
        onNavigate={setCurrentPage}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          investigation={investigation}
          onOpenHandbook={() => setIsHandbookOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-[#090A0D] flex flex-col">
          {/* Main 6 Gameplay Pages */}
          <div className="flex-1">
            {currentPage === 'story' && investigation && (
              <StoryModePage
                investigation={investigation}
                suspects={suspects}
                evidenceList={evidenceList}
                caseDetail={caseDetail}
                onNavigate={setCurrentPage}
                onSelectSuspectForInterrogation={handleSelectSuspectForInterrogation}
                onEvidenceDiscovered={handleEvidenceRefresh}
              />
            )}

            {currentPage === 'crimescene' && investigation && (
              <CrimeScenePage
                investigation={investigation}
                evidenceList={evidenceList}
                onEvidenceDiscovered={handleEvidenceRefresh}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'evidence' && investigation && (
              <EvidenceLabPage
                investigationId={investigation.id}
                evidenceList={evidenceList}
                onEvidenceUpdated={handleEvidenceRefresh}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'suspects' && (
              <SuspectDirectoryPage
                suspects={suspects}
                onSelectSuspectForInterrogation={handleSelectSuspectForInterrogation}
              />
            )}

            {currentPage === 'interrogation' && investigation && (
              <InterrogationPage
                investigationId={investigation.id}
                suspects={suspects}
                evidenceList={evidenceList}
                initialSuspectId={selectedSuspectId}
                onEvidenceDiscovered={handleEvidenceRefresh}
                aiStatus={aiStatus}
              />
            )}

            {currentPage === 'deduction' && investigation && (
              <DeductionPage
                investigationId={investigation.id}
                suspects={suspects}
                evidenceList={evidenceList}
                onAccusationSubmitted={handleAccusationSubmitted}
              />
            )}

            {currentPage === 'review' && investigation && (
              <CaseReviewPage
                investigationId={investigation.id}
                onNavigate={setCurrentPage}
              />
            )}
          </div>
        </main>
      </div>

      {/* Persistent Floating Assistant Detective Companion */}
      {investigation && (
        <AssistantDetective
          investigationId={investigation.id}
          currentPage={currentPage}
        />
      )}

      {/* Accessible Detective Handbook Modal */}
      <DetectiveHandbookModal
        isOpen={isHandbookOpen}
        onClose={() => setIsHandbookOpen(false)}
      />
    </div>
  );
}

export default App;
