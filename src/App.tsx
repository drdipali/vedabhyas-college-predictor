import React, { useState, useMemo, useEffect } from 'react';
import type { Category, QuotaFilter, InstitutionTypeFilter, PredictionResult, StudentProfile, CounsellingAlertsFeed } from './types';
import { collegesData, getAllStates, getAllBranches } from './data/colleges';
import { predictCollegeChances } from './utils/predictor';
import { getCurrentStudent, clearCurrentStudent } from './data/mockStudents';
import { defaultCounsellingFeed, mergeCounsellingFeeds, manualNotices } from './data/counselling';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PredictorLockGate } from './components/PredictorLockGate';
import { PredictorForm } from './components/PredictorForm';
import { CollegeGrid } from './components/CollegeGrid';
import { CollegeDetailModal } from './components/CollegeDetailModal';
import { CounselingGuide } from './components/CounselingGuide';
import { StudentAuthModal } from './components/StudentAuthModal';
import { AdminPortal } from './components/AdminPortal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CounselorChatbot } from './components/CounselorChatbot';
import { LiveAlertTicker } from './components/LiveAlertTicker';
import { LiveCounsellingModal } from './components/LiveCounsellingModal';
import { CollegePortalModal } from './components/CollegePortalModal';
import { Footer } from './components/Footer';
import { getLiveApprovedColleges } from './lib/supabase';
import type { College } from './types';

export const App: React.FC = () => {
  // Student authentication profile state
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(() => getCurrentStudent());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Admin Portal security state
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Live Counselling Updates Feed & Alerts Modal
  const [counsellingFeed, setCounsellingFeed] = useState<CounsellingAlertsFeed>(defaultCounsellingFeed);
  const [isLiveAlertsOpen, setIsLiveAlertsOpen] = useState(false);

  // College Administrator Portal state
  const [isCollegePortalOpen, setIsCollegePortalOpen] = useState(false);
  const [approvedLiveColleges, setApprovedLiveColleges] = useState<Partial<College>[]>([]);

  const loadApprovedColleges = async () => {
    try {
      const list = await getLiveApprovedColleges();
      setApprovedLiveColleges(list);
    } catch {}
  };

  useEffect(() => {
    loadApprovedColleges();
  }, []);

  // Predictor state variables - Initialized from student profile when logged in
  const [rank, setRank] = useState<number | ''>(currentStudent?.aiapgetRank ?? 240);
  const [category, setCategory] = useState<Category>(currentStudent?.category ?? 'General');
  const [quotaFilter, setQuotaFilter] = useState<QuotaFilter>('All');
  const [institutionTypeFilter, setInstitutionTypeFilter] = useState<InstitutionTypeFilter>('All');
  const [stateFilter, setStateFilter] = useState<string>('All');
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'chance' | 'rank' | 'name'>('chance');

  // Modal states
  const [selectedCollege, setSelectedCollege] = useState<PredictionResult | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // States & Branches lists for filtering
  const availableStates = useMemo(() => getAllStates(), []);
  const availableBranches = useMemo(() => getAllBranches(), []);

  // Fetch dynamic counselling updates and merge with manual_notices.json
  useEffect(() => {
    const scrapedUrl = `${import.meta.env.BASE_URL}data/counselling_updates.json`;
    const manualUrl = `${import.meta.env.BASE_URL}data/manual_notices.json`;

    Promise.all([
      fetch(scrapedUrl).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(manualUrl).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([scrapedData, manualData]) => {
        const liveManual = Array.isArray(manualData) && manualData.length > 0 
          ? manualData 
          : manualNotices;
        const targetScraped = (scrapedData && typeof scrapedData === 'object')
          ? (scrapedData as CounsellingAlertsFeed)
          : defaultCounsellingFeed;
        const merged = mergeCounsellingFeeds(targetScraped, liveManual);
        setCounsellingFeed(merged);
      })
      .catch(() => {
        // Fall back gracefully to bundled defaultCounsellingFeed
      });
  }, []);

  // Synchronize student session across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vedabhyas_current_student') {
        const student = getCurrentStudent();
        setCurrentStudent(student);
        if (student) {
          setRank(student.aiapgetRank);
          setCategory(student.category);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Merge verified approved colleges into live list
  const allColleges = useMemo<College[]>(() => {
    if (approvedLiveColleges.length === 0) return collegesData;
    const map = new Map<string, College>();
    collegesData.forEach((c) => map.set(c.id, { ...c }));
    approvedLiveColleges.forEach((ac) => {
      if (ac.id && map.has(ac.id)) {
        map.set(ac.id, { ...map.get(ac.id)!, ...ac, is_verified: true } as College);
      } else if (ac.id && ac.name) {
        map.set(ac.id, {
          ...ac,
          closingRank: ac.closingRank || 3500,
          categoryClosingRanks: ac.categoryClosingRanks || {
            General: 3500,
            OBC: 3900,
            EWS: 3700,
            SC: 5200,
            ST: 6500,
          },
          quota: ac.quota || 'AIQ',
          quota_type: ac.quota_type || 'State Quota',
          institutionType: ac.institutionType || 'Private',
          college_type: ac.college_type || 'Private',
          type: ac.type || 'Private Institute',
          topBranches: ac.topBranches || ac.branches || ['Kayachikitsa', 'Shalya Tantra'],
          is_verified: true,
        } as College);
      }
    });
    return Array.from(map.values());
  }, [approvedLiveColleges]);

  // Compute predictions only if student is authenticated
  const predictions = useMemo(() => {
    if (!currentStudent || !rank || rank <= 0) return [];
    
    const results = predictCollegeChances(
      allColleges,
      rank,
      category,
      quotaFilter,
      institutionTypeFilter,
      stateFilter,
      searchQuery,
      branchFilter
    );

    // Custom sorting
    return [...results].sort((a, b) => {
      if (sortBy === 'rank') {
        return a.closingRank - b.closingRank;
      }
      if (sortBy === 'name') {
        return a.college.name.localeCompare(b.college.name);
      }
      return 0;
    });
  }, [currentStudent, rank, category, quotaFilter, institutionTypeFilter, stateFilter, searchQuery, branchFilter, sortBy]);

  const handlePredict = () => {
    const resultsElement = document.getElementById('results-section');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStudentAuthSuccess = (student: StudentProfile) => {
    setCurrentStudent(student);
    setRank(student.aiapgetRank);
    setCategory(student.category);
  };

  const handleLogout = () => {
    clearCurrentStudent();
    setCurrentStudent(null);
  };

  // Open Admin View if authenticated, otherwise prompt for passcode
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setIsAdminView(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  // Support direct URL hash #admin or query param ?admin=true
  useEffect(() => {
    const handleUrlHash = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
        handleOpenAdmin();
      }
    };
    handleUrlHash();
    window.addEventListener('hashchange', handleUrlHash);
    return () => window.removeEventListener('hashchange', handleUrlHash);
  }, [isAdminAuthenticated]);

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminView(true);
  };

  // If Admin View is active and authenticated, render the Admin Portal
  if (isAdminView && isAdminAuthenticated) {
    return (
      <AdminPortal 
        onBackToPredictor={() => {
          setIsAdminView(false);
          loadApprovedColleges();
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#07090e] text-slate-100 flex flex-col relative selection:bg-emerald-500 selection:text-white">
      
      {/* Background Spatial Grid & Glowing Mesh */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        <div className="absolute -top-[20%] left-[10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-[10%] left-[25%] w-[550px] h-[550px] bg-amber-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Branded Navbar */}
      <Navbar 
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAdminLogin={handleOpenAdmin}
        onOpenLiveAlerts={() => setIsLiveAlertsOpen(true)}
        onOpenCollegePortal={() => setIsCollegePortalOpen(true)}
        currentStudent={currentStudent}
        onLogout={handleLogout}
        activeAlertCount={counsellingFeed.updates.length}
      />

      {/* Top Breaking News Live Alerts Ticker */}
      <LiveAlertTicker 
        feed={counsellingFeed} 
        onOpenUpdates={() => setIsLiveAlertsOpen(true)} 
      />

      {/* Main Content Area */}
      <main className="flex-grow w-full overflow-x-hidden">
        
        {/* Student Welcome Banner if logged in */}
        {currentStudent && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300">
                  Logged in as <strong className="text-white">{currentStudent.fullName}</strong> ({currentStudent.bamsCollege.split(',')[0]})
                </span>
                <span className="hidden sm:inline text-slate-500">•</span>
                <span className="hidden sm:inline text-emerald-400 font-mono font-semibold">AIR #{currentStudent.aiapgetRank}</span>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs text-emerald-300 hover:underline font-semibold cursor-pointer"
              >
                Edit College & Prep Data
              </button>
            </div>
          </div>
        )}

        {/* Spatial Hero Section */}
        <HeroSection />

        {/* CONDITION: If student is NOT logged in, show the Lock Gate */}
        {!currentStudent ? (
          <PredictorLockGate 
            onOpenAuth={() => setIsAuthModalOpen(true)} 
            onOpenAdminLogin={handleOpenAdmin}
          />
        ) : (
          /* UNLOCKED: Full Interactive Glassmorphic Predictor Form & Results */
          <>
            <PredictorForm
              rank={rank}
              setRank={setRank}
              category={category}
              setCategory={setCategory}
              quotaFilter={quotaFilter}
              setQuotaFilter={setQuotaFilter}
              institutionTypeFilter={institutionTypeFilter}
              setInstitutionTypeFilter={setInstitutionTypeFilter}
              stateFilter={stateFilter}
              setStateFilter={setStateFilter}
              branchFilter={branchFilter}
              setBranchFilter={setBranchFilter}
              availableBranches={availableBranches}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              availableStates={availableStates}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onPredict={handlePredict}
            />

            <div id="results-section">
              <CollegeGrid
                predictions={predictions}
                onSelectCollege={(p) => setSelectedCollege(p)}
                userRank={rank}
                category={category}
              />
            </div>
          </>
        )}

      </main>

      {/* Live AIAPGET 2026 Counselling Alerts & Portal Updates Drawer / Modal */}
      <LiveCounsellingModal
        isOpen={isLiveAlertsOpen}
        onClose={() => setIsLiveAlertsOpen(false)}
        feed={counsellingFeed}
      />

      {/* Student Registration / Login Modal */}
      <StudentAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleStudentAuthSuccess}
        existingStudent={currentStudent}
        defaultMode={currentStudent ? 'register' : 'login'}
      />

      {/* College Administrator Portal Modal */}
      <CollegePortalModal
        isOpen={isCollegePortalOpen}
        onClose={() => setIsCollegePortalOpen(false)}
        onSubmissionSuccess={loadApprovedColleges}
      />

      {/* Restricted Admin Passcode Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* Institutional Profile Detail Modal */}
      <CollegeDetailModal
        prediction={selectedCollege}
        onClose={() => setSelectedCollege(null)}
      />

      {/* AACCC Counseling Guide & Checklist Drawer */}
      <CounselingGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Vedabhyas Footer with Discreet Staff Access */}
      <Footer 
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAdminLogin={handleOpenAdmin}
      />

      {/* Floating 24/7 AI Counselor Chatbot & WhatsApp Helpline Widget */}
      <CounselorChatbot />

    </div>
  );
};

export default App;
