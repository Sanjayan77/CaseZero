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

import { FAQPage } from './pages/FAQPage';
import { SupportPage } from './pages/SupportPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ServerErrorPage } from './pages/ServerErrorPage';
import { SupportChatWidget } from './components/SupportChatWidget';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [attemptedPath, setAttemptedPath] = useState<string>(window.location.pathname);
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

  const pageToPath: Record<string, string> = {
    landing: '/',
    faq: '/faq',
    support: '/support',
    notfound: '/404',
    servererror: '/500',
    login: '/login',
    register: '/register',
    story: '/story',
    crimescene: '/crimescene',
    evidence: '/evidence',
    suspects: '/suspects',
    interrogation: '/interrogation',
    deduction: '/deduction',
    review: '/review',
  };

  const pathToPage = (path: string): { page: string; isNotFound: boolean } => {
    const clean = path.replace(/\/$/, '') || '/';
    if (clean === '/' || clean === '/landing') return { page: 'landing', isNotFound: false };
    if (clean === '/faq') return { page: 'faq', isNotFound: false };
    if (clean === '/support') return { page: 'support', isNotFound: false };
    if (clean === '/404') return { page: 'notfound', isNotFound: false };
    if (clean === '/500') return { page: 'servererror', isNotFound: false };
    if (clean === '/login') return { page: 'login', isNotFound: false };
    if (clean === '/register') return { page: 'register', isNotFound: false };
    if (clean === '/story') return { page: 'story', isNotFound: false };
    if (clean === '/crimescene') return { page: 'crimescene', isNotFound: false };
    if (clean === '/evidence') return { page: 'evidence', isNotFound: false };
    if (clean === '/suspects') return { page: 'suspects', isNotFound: false };
    if (clean === '/interrogation') return { page: 'interrogation', isNotFound: false };
    if (clean === '/deduction') return { page: 'deduction', isNotFound: false };
    if (clean === '/review') return { page: 'review', isNotFound: false };
    return { page: 'notfound', isNotFound: true };
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    const targetPath = pageToPath[page] || `/${page}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  // Sync initial URL on mount and handle popstate
  useEffect(() => {
    const handleUrl = () => {
      const currentPath = window.location.pathname;
      const { page, isNotFound } = pathToPage(currentPath);
      if (isNotFound) {
        setAttemptedPath(currentPath);
      }
      setCurrentPage(page);
    };

    handleUrl();
    window.addEventListener('popstate', handleUrl);
    return () => window.removeEventListener('popstate', handleUrl);
  }, []);

  // Load user session on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        const token = api.getToken();
        if (token) {
          const me = await api.getMe();
          setUser(me);
          // Only redirect to crimescene if on landing, login, or register
          const currentPath = window.location.pathname;
          const { page } = pathToPage(currentPath);
          if (['landing', 'login', 'register'].includes(page)) {
            handleNavigate('crimescene');
          }
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
      handleNavigate('crimescene');
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
        handleNavigate('crimescene');
      } else {
        const newInv = await api.startCase('CZ-001');
        setInvestigation(newInv);
        await loadInvestigationData(newInv.id);
        handleNavigate('crimescene');
      }
    } catch {
      handleNavigate('crimescene');
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setInvestigation(null);
    handleNavigate('landing');
  };

  const handleEvidenceRefresh = () => {
    if (investigation) {
      loadInvestigationData(investigation.id);
    }
  };

  const handleSelectSuspectForInterrogation = (suspectId: number) => {
    setSelectedSuspectId(suspectId);
    handleNavigate('interrogation');
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
        onNavigate={handleNavigate}
      />
    );
  }

  if (currentPage === 'faq') {
    return (
      <FAQPage
        onNavigate={handleNavigate}
      />
    );
  }

  if (currentPage === 'support') {
    return (
      <SupportPage
        onNavigate={handleNavigate}
      />
    );
  }

  if (currentPage === 'notfound') {
    return (
      <NotFoundPage
        onNavigate={handleNavigate}
        attemptedPath={attemptedPath}
      />
    );
  }

  if (currentPage === 'servererror') {
    return (
      <ServerErrorPage
        onNavigate={handleNavigate}
      />
    );
  }

  if (currentPage === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigate={handleNavigate}
        onStartDemo={handleStartDemo}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <RegisterPage
        onRegisterSuccess={handleLoginSuccess}
        onNavigate={handleNavigate}
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
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
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
                onNavigate={handleNavigate}
                onSelectSuspectForInterrogation={handleSelectSuspectForInterrogation}
                onEvidenceDiscovered={handleEvidenceRefresh}
              />
            )}

            {currentPage === 'crimescene' && investigation && (
              <CrimeScenePage
                investigation={investigation}
                evidenceList={evidenceList}
                onEvidenceDiscovered={handleEvidenceRefresh}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'evidence' && investigation && (
              <EvidenceLabPage
                investigationId={investigation.id}
                evidenceList={evidenceList}
                onEvidenceUpdated={handleEvidenceRefresh}
                onNavigate={handleNavigate}
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
                onNavigate={handleNavigate}
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

      {/* Persistent Floating Website Support Assistant Widget */}
      <SupportChatWidget />



      {/* Accessible Detective Handbook Modal */}
      <DetectiveHandbookModal
        isOpen={isHandbookOpen}
        onClose={() => setIsHandbookOpen(false)}
      />
    </div>

  );
}

export default App;
