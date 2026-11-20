import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  X, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Send, 
  LogOut, 
  ChevronRight,
  Sparkles,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { 
  signInCollegeAdmin, 
  signUpCollegeAdmin, 
  signOutCollegeAdmin, 
  getActiveCollegeAdmin,
  submitCollegeData,
  fetchSubmissionsByUser,
  resetPasswordForEmail,
  supabase,
  isSupabaseConfigured
} from '../lib/supabase';
import type { CollegeSubmission, CollegeAdminProfile } from '../types';
import { COMMON_AYUSH_BRANCHES } from '../data/colleges';

interface CollegePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmissionSuccess?: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

export const CollegePortalModal: React.FC<CollegePortalModalProps> = ({
  isOpen,
  onClose,
  onSubmissionSuccess,
}) => {
  const [currentUser, setCurrentUser] = useState<CollegeAdminProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState<string | null>(null);

  // Auth Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeNameInput, setCollegeNameInput] = useState('');
  const [contactNameInput, setContactNameInput] = useState('');
  const [designationInput, setDesignationInput] = useState('Principal / PG In-Charge');
  const [phoneInput, setPhoneInput] = useState('');

  // Forgot Password state
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState('');
  const [resetErrorMsg, setResetErrorMsg] = useState('');

  // Active view for logged in user: 'form' | 'tracker' | 'confirmation'
  const [activeTab, setActiveTab] = useState<'form' | 'tracker'>('form');
  const [submittedData, setSubmittedData] = useState<CollegeSubmission | null>(null);
  const [submissionsList, setSubmissionsList] = useState<CollegeSubmission[]>([]);

  // Submission Form Inputs
  const [formCollegeName, setFormCollegeName] = useState('');
  const [ncismCode, setNcismCode] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [collegeType, setCollegeType] = useState('Private');
  const [quotaType, setQuotaType] = useState('State Quota');
  const [selectedDepts, setSelectedDepts] = useState<string[]>([
    'Kayachikitsa',
    'Shalya Tantra',
    'Prasuti Tantra / Stri Roga',
  ]);
  const [annualFee, setAnnualFee] = useState('');
  const [monthlyStipend, setMonthlyStipend] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [designation, setDesignation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Check auth session on open
  useEffect(() => {
    if (isOpen) {
      loadSession();
    }
  }, [isOpen]);

  const loadSession = async () => {
    const user = await getActiveCollegeAdmin();
    setCurrentUser(user);
    if (user) {
      // Pre-fill form from user profile
      if (user.collegeName && !formCollegeName) setFormCollegeName(user.collegeName);
      if (user.contactPersonName && !contactPerson) setContactPerson(user.contactPersonName);
      if (user.designation && !designation) setDesignation(user.designation);
      if (user.phone && !contactPhone) setContactPhone(user.phone);
      if (user.email && !officialEmail) setOfficialEmail(user.email);
      loadUserSubmissions(user.id, user.email);
    }
  };

  const loadUserSubmissions = async (userId: string, userEmail: string) => {
    const list = await fetchSubmissionsByUser(userId, userEmail);
    setSubmissionsList(list);
  };

  if (!isOpen) return null;

  // ---------------------------------------------------------------------------
  // AUTH HANDLERS
  // ---------------------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const { user, error } = await signInCollegeAdmin(email.trim(), password);
    setLoading(false);

    if (error) {
      setAuthError(error);
    } else if (user) {
      setCurrentUser(user);
      setFormCollegeName(user.collegeName || '');
      setContactPerson(user.contactPersonName || '');
      setDesignation(user.designation || '');
      setContactPhone(user.phone || '');
      setOfficialEmail(user.email || '');
      loadUserSubmissions(user.id, user.email);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      return;
    }
    if (phoneInput.replace(/\D/g, '').length !== 10) {
      setAuthError('Please enter a valid 10-digit mobile number for phone verification');
      return;
    }

    setLoading(true);
    setAuthError(null);

    const { user, error } = await signUpCollegeAdmin(email.trim(), password, {
      collegeName: collegeNameInput.trim(),
      contactPersonName: contactNameInput.trim(),
      designation: designationInput.trim(),
      phone: phoneInput.trim(),
    });
    setLoading(false);

    if (error) {
      setAuthError(error);
    } else if (user) {
      setCurrentUser(user);
      setFormCollegeName(user.collegeName || '');
      setContactPerson(user.contactPersonName || '');
      setDesignation(user.designation || '');
      setContactPhone(user.phone || '');
      setOfficialEmail(user.email || '');
      loadUserSubmissions(user.id, user.email);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg('');
    setResetSuccessNotice('');

    const targetEmail = resetEmail.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setResetErrorMsg('Please enter a valid official email address.');
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
      setResetErrorMsg(err.message || 'Failed to send reset email. Please try again.');
    }
  };

  const handleLogout = async () => {
    await signOutCollegeAdmin();
    setCurrentUser(null);
    setSubmittedData(null);
    setActiveTab('form');
  };

  // ---------------------------------------------------------------------------
  // SUBMISSION HANDLER
  // ---------------------------------------------------------------------------
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanPhone = contactPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setFormError('Please enter a valid 10-digit phone number. Our faculty will call this number for verification.');
      return;
    }

    if (!formCollegeName.trim()) {
      setFormError('Please enter the College Name.');
      return;
    }

    if (!contactPerson.trim() || !designation.trim()) {
      setFormError('Contact Person Name and Designation are mandatory for institutional verification.');
      return;
    }

    setSubmitting(true);

    const payload = {
      submitted_by_user_id: currentUser?.id,
      college_name: formCollegeName.trim(),
      ncism_code: ncismCode.trim() || undefined,
      state,
      college_type: collegeType,
      quota_type: quotaType,
      departments: selectedDepts,
      annual_fee: annualFee.trim() || undefined,
      monthly_stipend: monthlyStipend.trim() || undefined,
      contact_person_name: contactPerson.trim(),
      designation: designation.trim(),
      contact_phone: cleanPhone,
      official_email: officialEmail.trim(),
      proof_url: proofUrl.trim() || undefined,
    };

    const { data, error } = await submitCollegeData(payload);
    setSubmitting(false);

    if (error) {
      setFormError(error);
    } else if (data) {
      setSubmittedData(data);
      if (currentUser) {
        loadUserSubmissions(currentUser.id, currentUser.email);
      }
      if (onSubmissionSuccess) onSubmissionSuccess();
    }
  };

  const toggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter((d) => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xl bg-black/85 animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl my-8 rounded-3xl glass-panel border border-white/20 p-5 sm:p-8 bg-[#090d16]/98 shadow-2xl text-white max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer transition-all z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-5 pb-5 border-b border-white/10 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-teal-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
            <Building2 className="w-6 h-6 text-indigo-300" />
          </div>
          <div className="pr-8">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                Institutional Administration
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Verified Portal
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
              Ayush College Administrator Portal
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Submit and update your institution's official fees, stipends, departments, and seat matrix for AIAPGET 2026.
            </p>
          </div>
        </div>

        {/* Main Body */}
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
          
          {/* ----------------------------------------------------------------- */}
          {/* NOT LOGGED IN: SIGN IN / SIGN UP TABS */}
          {/* ----------------------------------------------------------------- */}
          {!currentUser ? (
            <div className="max-w-md mx-auto py-3">
              
              {isForgotPasswordView ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPasswordView(false);
                        setResetSuccessNotice('');
                        setResetErrorMsg('');
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to College Sign In</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-['Outfit']">
                        Reset College Administrator Password
                      </h4>
                      <p className="text-xs text-slate-400">
                        Enter your official institution email to receive a password recovery link.
                      </p>
                    </div>
                  </div>

                  {resetErrorMsg && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{resetErrorMsg}</span>
                    </div>
                  )}

                  {resetSuccessNotice ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                        <div>
                          <p className="font-semibold">{resetSuccessNotice}</p>
                          <p className="text-xs text-emerald-300/80 mt-1">
                            Click the link in your email to choose your new password.
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
                        Return to College Sign In
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Official Institutional Email *</span>
                        </label>
                        <input
                          type="email"
                          required
                          autoFocus
                          placeholder="principal@ayurvedacollege.edu.in"
                          value={resetEmail}
                          onChange={(e) => {
                            setResetEmail(e.target.value);
                            if (resetErrorMsg) setResetErrorMsg('');
                          }}
                          className="w-full h-11 px-3.5 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                        />
                      </div>

                      <div className="pt-2 flex flex-col gap-2">
                        <button
                          type="submit"
                          disabled={resetLoading}
                          className="w-full h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-teal-400 hover:opacity-95 text-slate-950 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
                        >
                          {resetLoading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
                          <ChevronRight className="w-4 h-4" />
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
              {/* Tab Selector */}
              <div className="flex rounded-xl bg-white/5 p-1 mb-6 border border-white/10">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  College Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register New College
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Login Form */}
              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Official College Email</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. principal@ayurvedacollege.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-3.5 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Password</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter your college admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 px-3.5 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                    />
                    <div className="flex items-center justify-end mt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPasswordView(true);
                          setResetErrorMsg('');
                          setResetSuccessNotice('');
                          if (email) setResetEmail(email);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-semibold cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-teal-400 hover:opacity-95 text-slate-950 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Signing in...' : 'Sign In to College Portal'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-center text-slate-400 pt-2">
                    Don't have an institutional account yet?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="text-indigo-400 hover:underline font-semibold"
                    >
                      Register your college here
                    </button>
                  </p>
                </form>
              ) : (
                /* Registration Form */
                <form onSubmit={handleSignup} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Official College / Institute Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. D.Y. Patil College of Ayurved & Hospital"
                      value={collegeNameInput}
                      onChange={(e) => setCollegeNameInput(e.target.value)}
                      className="w-full h-10 px-3.5 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Contact Person Name</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Rajesh Sharma"
                        value={contactNameInput}
                        onChange={(e) => setContactNameInput(e.target.value)}
                        className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Designation</label>
                      <input
                        type="text"
                        required
                        placeholder="Principal / Dean / PG In-charge"
                        value={designationInput}
                        onChange={(e) => setDesignationInput(e.target.value)}
                        className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>10-Digit Mobile Number (For Phone Verification)</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs text-slate-400 font-mono">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-10 pl-12 pr-3 text-sm rounded-xl glass-input text-white placeholder-slate-500 font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-amber-400 mt-0.5 block">
                      * Our team will call this number to verify the institutional identity.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Official Institutional Email</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admissions@collegename.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Create Password (min 6 characters)</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-teal-400 hover:opacity-95 text-slate-950 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Creating Account...' : 'Register College Account'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
                </>
              )}

            </div>
          ) : (
            /* ----------------------------------------------------------------- */
            /* LOGGED IN VIEW */
            /* ----------------------------------------------------------------- */
            <div>
              {/* Account Header Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {currentUser.collegeName || 'Ayush Medical College'}
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center gap-2">
                      <span>{currentUser.contactPersonName || 'Admin'}</span>
                      <span className="text-slate-500">•</span>
                      <span>{currentUser.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'form'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-slate-300 hover:text-white'
                    }`}
                  >
                    📝 Submit Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tracker')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'tracker'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>📊 Track Status</span>
                    {submissionsList.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-400 text-slate-950 font-bold">
                        {submissionsList.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 cursor-pointer transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CONFIRMATION SCREEN (Shown right after successful submission) */}
              {submittedData ? (
                <div className="py-6 px-4 text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <ShieldCheck className="w-9 h-9" />
                  </div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
                    Submission Received
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1 mb-3 font-['Outfit']">
                    Pending Verification
                  </h3>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left mb-6 space-y-2">
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Your details for <strong className="text-white">{submittedData.college_name}</strong> have been safely stored in our system under reference ID <code className="text-emerald-400 font-mono text-[11px]">{submittedData.id}</code>.
                    </p>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-white mb-0.5">Verification Phone Call Scheduled</strong>
                        Our faculty team will call <strong className="text-amber-200">+91 {submittedData.contact_phone}</strong> to speak with <strong className="text-amber-200">{submittedData.contact_person_name}</strong> ({submittedData.designation}) before publishing your details live to AIAPGET students.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedData(null);
                        setActiveTab('tracker');
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-lg"
                    >
                      View in Status Tracker
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmittedData(null)}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 cursor-pointer"
                    >
                      Submit Another College / Branch
                    </button>
                  </div>
                </div>
              ) : activeTab === 'form' ? (
                /* TAB 1: SUBMISSION FORM */
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Section 1: Institution Details */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3.5">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-indigo-400 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>1. Institution Identification</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Official College Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formCollegeName}
                          onChange={(e) => setFormCollegeName(e.target.value)}
                          placeholder="e.g. Government Ayurved College, Nanded"
                          className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          NCISM / Ayush Code
                        </label>
                        <input
                          type="text"
                          value={ncismCode}
                          onChange={(e) => setNcismCode(e.target.value)}
                          placeholder="e.g. AYU0032"
                          className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white placeholder-slate-500 font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">State *</label>
                        <select
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white bg-slate-900 border border-white/10"
                        >
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">College Type *</label>
                        <select
                          value={collegeType}
                          onChange={(e) => setCollegeType(e.target.value)}
                          className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white bg-slate-900 border border-white/10"
                        >
                          <option value="Government">Government</option>
                          <option value="Govt-Aided">Govt-Aided</option>
                          <option value="Private">Private</option>
                          <option value="Deemed">Deemed University</option>
                          <option value="National Institute">National Institute</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Quota Type *</label>
                        <select
                          value={quotaType}
                          onChange={(e) => setQuotaType(e.target.value)}
                          className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white bg-slate-900 border border-white/10"
                        >
                          <option value="All India Quota (AIQ)">All India Quota (AIQ)</option>
                          <option value="State Quota">State Quota (85%)</option>
                          <option value="Deemed / Management">Deemed / Management</option>
                          <option value="National Institute">National Institute Quota</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: PG Branches Offered */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase font-bold tracking-wider text-teal-400 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>2. PG MD/MS Ayurveda Departments Offered</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {selectedDepts.length} selected
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {COMMON_AYUSH_BRANCHES.map((dept) => {
                        const isSelected = selectedDepts.includes(dept);
                        return (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => toggleDept(dept)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-teal-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(20,184,166,0.4)]'
                                : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {dept}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 3: Official Financials (Fees & Stipend) */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3.5">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      <span>3. Official Financials (Annual Fees & Monthly Stipend)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Annual Tuition Fee (Govt / Merit Quota)
                        </label>
                        <input
                          type="text"
                          value={annualFee}
                          onChange={(e) => setAnnualFee(e.target.value)}
                          placeholder="e.g. ₹2,20,000 / year"
                          className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Monthly PG Stipend (Year 1)
                        </label>
                        <input
                          type="text"
                          value={monthlyStipend}
                          onChange={(e) => setMonthlyStipend(e.target.value)}
                          placeholder="e.g. ₹55,000 / month (or As per State Norms)"
                          className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Seat Matrix / Fee Notification Document Link (URL)
                      </label>
                      <input
                        type="url"
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        placeholder="https://collegename.edu.in/pg-seat-matrix-2025.pdf"
                        className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Optional: Link to official university circular, state fee regulatory committee gazette, or prospectus.
                      </span>
                    </div>
                  </div>

                  {/* Section 4: Mandatory Phone Verification Contact */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3.5">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-amber-300 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>4. Mandatory Phone Verification Contact</span>
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      To prevent unauthorized updates, our Vedabhyas faculty will telephone this official contact before publishing your data to students.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-200 mb-1">
                          Contact Person Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          placeholder="e.g. Dr. Sudhir Deshmukh"
                          className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-200 mb-1">
                          Designation *
                        </label>
                        <input
                          type="text"
                          required
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          placeholder="e.g. Dean / Principal / PG Admission In-Charge"
                          className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-200 mb-1">
                          10-Digit Mobile Number to Call *
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-xs text-slate-400 font-mono">+91</span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="9822000000"
                            className="w-full h-10 pl-12 pr-3 text-sm rounded-xl glass-input text-white placeholder-slate-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-200 mb-1">
                          Official Email ID *
                        </label>
                        <input
                          type="email"
                          required
                          value={officialEmail}
                          onChange={(e) => setOfficialEmail(e.target.value)}
                          placeholder="principal@college.edu.in"
                          className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-400 hover:opacity-95 text-slate-950 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Submitting...' : 'Submit Details for Faculty Verification'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* TAB 2: MY SUBMISSIONS & TRACKER */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-slate-300">
                      Submitted Applications & Verification History
                    </h4>
                    <button
                      type="button"
                      onClick={() => currentUser && loadUserSubmissions(currentUser.id, currentUser.email)}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Refresh
                    </button>
                  </div>

                  {submissionsList.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10">
                      <Building2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-300">No submissions found yet for this account.</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('form')}
                        className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
                      >
                        Submit Your College Details
                      </button>
                    </div>
                  ) : (
                    submissionsList.map((sub) => {
                      const isApproved = sub.status === 'approved';
                      const isPending = sub.status === 'pending';
                      const isRejected = sub.status === 'rejected';

                      return (
                        <div
                          key={sub.id}
                          className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-white">{sub.college_name}</h5>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {sub.state} • {sub.college_type}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Submitted on {new Date(sub.created_at).toLocaleDateString()} by {sub.contact_person_name} ({sub.designation})
                              </p>
                            </div>

                            {/* Status Badge */}
                            <div>
                              {isPending && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Pending Verification</span>
                                </span>
                              )}
                              {isApproved && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Approved & Live ✓</span>
                                </span>
                              )}
                              {isRejected && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Needs Revision</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Details strip */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 border-t border-white/5">
                            <div>
                              <span className="text-[10px] text-slate-500 block">Annual Fee</span>
                              <span className="text-white font-medium">{sub.annual_fee || 'Not specified'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">Monthly Stipend</span>
                              <span className="text-white font-medium">{sub.monthly_stipend || 'Not specified'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">Verification Phone</span>
                              <span className="text-amber-300 font-mono font-medium">+91 {sub.contact_phone}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">Departments</span>
                              <span className="text-teal-300 font-medium">{sub.departments.length} offered</span>
                            </div>
                          </div>

                          {/* Status Description Box */}
                          {isPending && (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                              📞 <strong>Call Scheduled:</strong> Our admissions team will reach out to +91 {sub.contact_phone} to verify official affiliation documents. Once verified, this college will display a <strong>"✓ Verified by College"</strong> badge in the live student search.
                            </div>
                          )}

                          {isApproved && (
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200">
                              ✓ <strong>Published Live:</strong> This institution is verified and visible to AIAPGET candidates.
                            </div>
                          )}

                          {isRejected && sub.admin_notes && (
                            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-200">
                              <strong>Revision Note:</strong> {sub.admin_notes}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Supabase Authenticated Institutional Storage</span>
          </div>
          <div>
            Need assistance? WhatsApp: <strong className="text-emerald-400">8208506052</strong>
          </div>
        </div>

      </div>
    </div>
  );
};
