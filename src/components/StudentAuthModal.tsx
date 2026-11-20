import React, { useState } from 'react';
import type { StudentProfile, Category, PreparationMethod } from '../types';
import { 
  saveStudentProfile, 
  authenticateStudent, 
  normalizePhone 
} from '../data/mockStudents';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  GraduationCap, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Clock, 
  Sparkles, 
  Award,
  ChevronRight,
  LogIn,
  UserPlus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrandLogo } from './BrandLogo';
import { supabase, resetPasswordForEmail, isSupabaseConfigured } from '../lib/supabase';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: StudentProfile) => void;
  existingStudent: StudentProfile | null;
  defaultMode?: 'login' | 'register';
}

const PREPARATION_METHODS: PreparationMethod[] = [
  'Self-Study & Standard Samhitas',
  'Vedabhyas Coaching',
  'External Coaching Institute',
  'Online Test Series & Q-Bank',
  'Combined Group Study & Mentorship'
];

const SPECIALTIES = [
  'Kayachikitsa (Internal Medicine)',
  'Shalya Tantra (Surgery)',
  'Panchakarma (Detoxification & Purification)',
  'Prasuti Tantra & Stri Roga (Obstetrics & Gynecology)',
  'Kaumarbhritya (Pediatrics)',
  'Dravyaguna Vigyana (Pharmacology & Herbology)',
  'Shalakya Tantra (ENT & Ophthalmology)',
  'Rasa Shastra & Bhaishajya Kalpana (Pharmaceutics)',
  'Roga Nidana (Pathology & Diagnostics)',
  'Agada Tantra (Toxicology & Forensic Medicine)',
  'Swasthavritta (Preventive & Social Medicine)',
  'Samhita & Siddhanta (Basic Principles)'
];

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingStudent,
  defaultMode = 'login',
}) => {
  // Mode: 'login' for returning students, 'register' for new registration / profile update
  const [authMode, setAuthMode] = useState<'login' | 'register'>(
    existingStudent ? 'register' : defaultMode
  );

  // Quick Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccessNotice, setLoginSuccessNotice] = useState('');

  // Forgot Password state
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState('');
  const [resetErrorMsg, setResetErrorMsg] = useState('');

  // Registration / Profile form state
  const [fullName, setFullName] = useState(existingStudent?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(existingStudent?.mobileNumber || '');
  const [email, setEmail] = useState(existingStudent?.email || '');
  const [regPassword, setRegPassword] = useState(existingStudent?.password || '');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [bamsCollege, setBamsCollege] = useState(existingStudent?.bamsCollege || '');
  const [bamsState, setBamsState] = useState(existingStudent?.bamsState || 'Maharashtra');
  const [passingYear, setPassingYear] = useState<number>(existingStudent?.passingYear || 2024);
  const [bamsScore, setBamsScore] = useState(existingStudent?.bamsScore || '68%');
  const [aiapgetRank, setAiapgetRank] = useState<number | ''>(existingStudent?.aiapgetRank || 240);
  const [category, setCategory] = useState<Category>(existingStudent?.category || 'General');
  const [prepMethod, setPrepMethod] = useState<PreparationMethod>(
    existingStudent?.prepMethod || 'Vedabhyas Coaching'
  );
  const [dailyStudyHours, setDailyStudyHours] = useState<number>(existingStudent?.dailyStudyHours || 7);
  const [prepDurationMonths, setPrepDurationMonths] = useState<number>(
    existingStudent?.prepDurationMonths || 12
  );
  const [targetSpecialty, setTargetSpecialty] = useState(
    existingStudent?.targetSpecialty || 'Kayachikitsa (Internal Medicine)'
  );
  const [counselingAssistanceRequired, setCounselingAssistanceRequired] = useState(
    existingStudent?.counselingAssistanceRequired ?? true
  );

  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [regErrorMsg, setRegErrorMsg] = useState('');

  if (!isOpen) return null;

  // 1. Password-Protected Returning Student Login Handler
  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccessNotice('');

    const query = loginIdentifier.trim();
    const pwd = loginPassword.trim();

    if (!query) {
      setLoginError('Please enter your registered Mobile Number or Email ID.');
      return;
    }
    if (!pwd) {
      setLoginError('Please enter your account password.');
      return;
    }

    const authResult = authenticateStudent(query, pwd);
    if (authResult.student) {
      const student = authResult.student;
      setLoginSuccessNotice(`Welcome back, ${student.fullName}! Unlocking predictor...`);
      saveStudentProfile(student); // writes to localStorage for persistent session
      
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#38bdf8', '#f59e0b'],
        });
      } catch (err) {
        // ignore
      }

      setTimeout(() => {
        onSuccess(student);
        onClose();
      }, 350);
    } else {
      setLoginError(authResult.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  // 1b. Forgot Password Request Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg('');
    setResetSuccessNotice('');

    const targetEmail = resetEmail.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setResetErrorMsg('Please enter a valid email address.');
      return;
    }

    setResetLoading(true);
    try {
      const redirectTo = window.location.origin + import.meta.env.BASE_URL;
      let errorMsg: string | null = null;

      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
          redirectTo,
        });
        if (error) errorMsg = error.message;
      } else {
        const res = await resetPasswordForEmail(targetEmail);
        if (!res.success) errorMsg = res.error;
      }

      setResetLoading(false);
      if (errorMsg) {
        setResetErrorMsg(errorMsg);
      } else {
        setResetSuccessNotice('Password reset link sent! Please check your inbox (and spam folder).');
      }
    } catch (err: any) {
      setResetLoading(false);
      setResetErrorMsg(err.message || 'Failed to send reset link. Please try again.');
    }
  };

  // 2. Full Student Registration Handler with Required Password
  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg('');

    // Step 1 Validation
    if (activeStep === 1) {
      if (!fullName.trim()) {
        setRegErrorMsg('Please enter your full name');
        return;
      }
      if (!mobileNumber.trim() || normalizePhone(mobileNumber).length < 10) {
        setRegErrorMsg('Please enter a valid 10-digit mobile number for login verification');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setRegErrorMsg('Please enter a valid email address');
        return;
      }
      if (!regPassword || regPassword.trim().length < 6) {
        setRegErrorMsg('Please create an account password with at least 6 characters');
        return;
      }
      if (!bamsCollege.trim()) {
        setRegErrorMsg('Please enter your BAMS College / Institute name');
        return;
      }
      setActiveStep(2);
      return;
    }

    // Step 2 Submission
    if (!aiapgetRank || aiapgetRank <= 0) {
      setRegErrorMsg('Please enter a valid AIAPGET Rank');
      return;
    }

    const newProfile: StudentProfile = {
      id: existingStudent?.id || `std-${Date.now()}`,
      fullName: fullName.trim().startsWith('Dr.') ? fullName.trim() : `Dr. ${fullName.trim()}`,
      email: email.trim().toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      password: regPassword.trim(),
      bamsCollege: bamsCollege.trim(),
      bamsState,
      passingYear: Number(passingYear),
      bamsScore: bamsScore.trim(),
      aiapgetRank: Number(aiapgetRank),
      category,
      prepMethod,
      dailyStudyHours: Number(dailyStudyHours),
      prepDurationMonths: Number(prepDurationMonths),
      targetSpecialty,
      counselingAssistanceRequired,
      registeredAt: existingStudent?.registeredAt || new Date().toISOString(),
    };

    saveStudentProfile(newProfile); // saves to localStorage
    onSuccess(newProfile);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#38bdf8', '#f59e0b'],
      });
    } catch (e) {
      // ignore
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-xl bg-black/80 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/20 p-6 sm:p-8 bg-[#0b101c]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 flex items-start gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 border border-white/20 shadow-md shrink-0">
            <BrandLogo alt="Vedabhyas" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
                Vedabhyas Student Network
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-300">
                Verified Sign In
              </span>
            </div>
            <h3 id="auth-modal-title" className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
              {existingStudent
                ? 'Update Your Student Profile'
                : isForgotPasswordView
                ? 'Reset Account Password'
                : authMode === 'login'
                ? 'Student Sign In'
                : 'Student Registration & Profile Setup'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {isForgotPasswordView
                ? 'Enter your registered email address to receive an official recovery link.'
                : authMode === 'login'
                ? 'Enter your registered Mobile Number or Email ID and password to unlock the college predictor.'
                : 'Enter your contact, password, BAMS college, and AIAPGET rank to unlock the predictor.'}
            </p>
          </div>
        </div>

        {/* FORGOT PASSWORD RESET REQUEST VIEW */}
        {isForgotPasswordView ? (
          <div className="space-y-5 animate-fadeIn">
            {resetErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-medium">{resetErrorMsg}</p>
              </div>
            )}

            {resetSuccessNotice ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="font-semibold">{resetSuccessNotice}</p>
                    <p className="text-xs text-emerald-300/80 mt-1">
                      Check your email inbox and spam folder for the link to choose your new password.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordView(false);
                    setResetSuccessNotice('');
                  }}
                  className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Registered Student Email ID *</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. doctor@ayush.org"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      if (resetErrorMsg) setResetErrorMsg('');
                    }}
                    autoFocus
                    required
                    className="w-full h-12 px-4 text-sm rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
                  >
                    {resetLoading ? (
                      <span>Sending Reset Link...</span>
                    ) : (
                      <>
                        <span>Send Password Reset Link</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordView(false);
                      setResetErrorMsg('');
                    }}
                    className="w-full py-2.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
        {/* Auth Mode Toggle Tabs (Login vs Register) */}
        {!existingStudent && (
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-2xl bg-slate-900/80 border border-white/10 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError('');
              }}
              className={`py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In (Returning)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setRegErrorMsg('');
              }}
              className={`py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>New Registration</span>
            </button>
          </div>
        )}

        {/* TAB 1: PASSWORD-PROTECTED RETURNING STUDENT LOGIN */}
        {authMode === 'login' && !existingStudent && (
          <div className="space-y-5 animate-fadeIn">
            
            {loginError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{loginError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (loginIdentifier.includes('@')) {
                        setEmail(loginIdentifier);
                      } else if (normalizePhone(loginIdentifier).length >= 10) {
                        setMobileNumber(loginIdentifier);
                      }
                      setAuthMode('register');
                    }}
                    className="mt-1.5 text-xs text-amber-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Click here to create a new profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {loginSuccessNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{loginSuccessNotice}</span>
              </div>
            )}

            <form onSubmit={handleQuickLogin} className="space-y-4">
              {/* Identifier Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Registered Mobile Number or Email ID *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9823456712 or doctor@ayush.org"
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  autoFocus
                  required
                  className="w-full h-12 px-4 text-sm rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Account Password *</span>
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter your account password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    required
                    className="w-full h-12 px-4 pr-11 text-sm rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-slate-400">
                    You will stay signed in on this device.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordView(true);
                      setResetErrorMsg('');
                      setResetSuccessNotice('');
                      if (loginIdentifier.includes('@')) {
                        setResetEmail(loginIdentifier);
                      }
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <span>Verify Credentials & Unlock Predictor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                New to Vedabhyas College Predictor?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                >
                  Create new student profile
                </button>
              </p>
            </div>

          </div>
        )}

        {/* TAB 2: FULL REGISTRATION / PROFILE UPDATE WIZARD */}
        {(authMode === 'register' || existingStudent) && (
          <div>
            {/* Multi-Step Indicator */}
            <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-xl bg-slate-900/60 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeStep === 1
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
                <span>Contact & Security</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (fullName && mobileNumber && email && regPassword) setActiveStep(2);
                }}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeStep === 2
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
                <span>AIAPGET & Prep Strategy</span>
              </button>
            </div>

            {/* Error message */}
            {regErrorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium animate-fadeIn">
                {regErrorMsg}
              </div>
            )}

            <form onSubmit={handleRegSubmit} className="space-y-4">
              
              {/* STEP 1: Contact, Security & BAMS College Details */}
              {activeStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Full Name (with Dr. prefix) *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Ananya Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full h-11 px-3.5 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                    />
                  </div>

                  {/* Mobile Number & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>Mobile Number (Login ID) *</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                        className="w-full h-11 px-3.5 text-sm font-mono rounded-xl glass-input text-white placeholder-slate-500"
                      />
                      <span className="text-[10px] text-slate-400">Used for login & counseling alerts</span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-teal-400" />
                        <span>Email Address (Login ID) *</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. ananya.ayur@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-11 px-3.5 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                      />
                      <span className="text-[10px] text-slate-400">Used for allotment reports & notifications</span>
                    </div>
                  </div>

                  {/* Create Password Field */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Create Account Password (Min. 6 characters) *</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="Enter a secure password (minimum 6 characters)"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full h-11 px-3.5 pr-11 text-sm rounded-xl glass-input text-white placeholder-slate-500 font-mono tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                        aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      You will stay signed in on this device.
                    </span>
                  </div>

                  {/* BAMS College Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                      <span>Undergraduate (BAMS) College Name *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. R.A. Podar Medical College (Ayurvedic), Mumbai"
                      value={bamsCollege}
                      onChange={(e) => setBamsCollege(e.target.value)}
                      required
                      className="w-full h-11 px-3.5 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                    />
                  </div>

                  {/* State of College, Passing Year & Score */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>College State *</span>
                      </label>
                      <select
                        value={bamsState}
                        onChange={(e) => setBamsState(e.target.value)}
                        className="w-full h-11 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                      >
                        {STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Internship / Passing Year</span>
                      </label>
                      <select
                        value={passingYear}
                        onChange={(e) => setPassingYear(Number(e.target.value))}
                        className="w-full h-11 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                      >
                        {[2025, 2024, 2023, 2022, 2021, 2020].map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-teal-400" />
                        <span>BAMS Overall %</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 68.5%"
                        value={bamsScore}
                        onChange={(e) => setBamsScore(e.target.value)}
                        className="w-full h-11 px-3 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    {!existingStudent && (
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className="text-xs text-slate-400 hover:text-emerald-300 underline cursor-pointer"
                      >
                        ← Back to Sign In
                      </button>
                    )}
                    <button
                      type="submit"
                      className="ml-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 hover:opacity-95 shadow-md cursor-pointer"
                    >
                      <span>Continue to AIAPGET Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 2: AIAPGET Preparation & Target Details */}
              {activeStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Rank & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Your AIAPGET All India Rank (AIR) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 240"
                        value={aiapgetRank}
                        onChange={(e) => setAiapgetRank(e.target.value ? Number(e.target.value) : '')}
                        required
                        className="w-full h-11 px-3.5 text-base font-bold font-mono rounded-xl glass-input text-emerald-400 placeholder-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Counseling Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className="w-full h-11 px-3 text-sm rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                      >
                        {(['General', 'OBC', 'SC', 'ST', 'EWS'] as Category[]).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* How did you prepare for the exam? */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>How did you prepare for AIAPGET? *</span>
                    </label>
                    <select
                      value={prepMethod}
                      onChange={(e) => setPrepMethod(e.target.value as PreparationMethod)}
                      className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                    >
                      {PREPARATION_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Study Hours & Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>Average Daily Study Hours</span>
                      </label>
                      <select
                        value={dailyStudyHours}
                        onChange={(e) => setDailyStudyHours(Number(e.target.value))}
                        className="w-full h-11 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                      >
                        {[3, 4, 5, 6, 7, 8, 9, 10, 12].map((hr) => (
                          <option key={hr} value={hr}>
                            {hr} hours / day
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        <span>Preparation Duration</span>
                      </label>
                      <select
                        value={prepDurationMonths}
                        onChange={(e) => setPrepDurationMonths(Number(e.target.value))}
                        className="w-full h-11 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                      >
                        {[3, 6, 9, 12, 18, 24].map((m) => (
                          <option key={m} value={m}>
                            {m} months
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Target Specialty */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Target MD/MS Ayurveda Branch / Specialty</span>
                    </label>
                    <select
                      value={targetSpecialty}
                      onChange={(e) => setTargetSpecialty(e.target.value)}
                      className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                    >
                      {SPECIALTIES.map((sp) => (
                        <option key={sp} value={sp}>
                          {sp}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Counseling Assistance Checkbox */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="assistance-check"
                      checked={counselingAssistanceRequired}
                      onChange={(e) => setCounselingAssistanceRequired(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="assistance-check" className="text-xs text-slate-300 cursor-pointer">
                      <strong className="text-white block font-medium">Request Free Vedabhyas Choice-Locking Mentorship</strong>
                      Receive personal guidance on Round 1 and Round 2 choices, security deposit forfeiture prevention, and fee concessions.
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 cursor-pointer"
                    >
                      ← Back to Contact & Password
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition-all cursor-pointer"
                    >
                      Save Profile & Unlock Custom Predictions
                    </button>
                  </div>

                </div>
              )}

            </form>
          </div>
        )}
        </>
      )}

      </div>
    </div>
  );
};
