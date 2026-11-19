import React, { useState, useMemo, useEffect } from 'react';
import type { Category, QuotaFilter, InstitutionTypeFilter, PredictionResult, StudentProfile, CounsellingAlertsFeed } from './types';
import { collegesData, getAllStates, getAllBranches } from './data/colleges';
import { predictCollegeChances } from './utils/predictor';
import { getCurrentStudent, clearCurrentStudent } from './data/mockStudents';
import { defaultCounsellingFeed } from './data/counselling';
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
import { Footer } from './components/Footer';

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

  // Predictor state variables - Initialized from student profile when logged in
  const [rank, setRank] = useState<number | ''>(currentStudent?.aiapgetRank ?? 240);
  const [category, setCategory] = useState<Category>(currentStudent?.category ?? 'General');
  const [quotaFilter, setQuotaFilter] = useState<QuotaFilter>('All');
  const [institutionTypeFilter, setInstitutionTypeFilter] = useState<InstitutionTypeFilter>('All');
  const [stateFilter, setStateFilter] = useState<string>('All');
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'chance' | 'stipend' | 'rank' | 'beds'>('chance');

  // Modal states
  const [selectedCollege, setSelectedCollege] = useState<PredictionResult | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // States & Branches lists for filtering
  const availableStates = useMemo(() => getAllStates(), []);
  const availableBranches = useMemo(() => getAllBranches(), []);

  // Fetch dynamic counselling updates from public/data/counselling_updates.json
  useEffect(() => {
    const dataUrl = `${import.meta.env.BASE_URL}data/counselling_updates.json`;
    fetch(dataUrl)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Bundled fallback');
      })
      .then((data: CounsellingAlertsFeed) => {
        if (data && Array.isArray(data.updates) && data.updates.length > 0) {
          setCounsellingFeed(data);
        }
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

  // Compute predictions only if student is authenticated
  const predictions = useMemo(() => {
    if (!currentStudent || !rank || rank <= 0) return [];
    
    const results = predictCollegeChances(
      collegesData,
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
      if (sortBy === 'stipend') {
        return b.college.stipendAmount - a.college.stipendAmount;
      }
      if (sortBy === 'rank') {
        return a.closingRank - b.closingRank;
      }
      if (sortBy === 'beds') {
        return b.college.hospitalBeds - a.college.hospitalBeds;
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
    return <AdminPortal onBackToPredictor={() => setIsAdminView(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col relative selection:bg-emerald-500 selection:text-white">
      
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
      <main className="flex-grow">
        
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

      {/* Ayush Gurukulam Footer with Discreet Staff Access */}
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
