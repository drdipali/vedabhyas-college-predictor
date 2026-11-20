import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  BookOpen,
  MapPin,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitMissingCollege } from '../lib/supabase';
import type { StudentProfile, College, StudentCollegeSuggestion } from '../types';
import { COMMON_AYUSH_BRANCHES } from '../data/colleges';

interface AddMissingCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: StudentProfile | null;
  initialCollegeName?: string;
  onSuccess?: () => void;
  onOpenAuth?: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

export const AddMissingCollegeModal: React.FC<AddMissingCollegeModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  initialCollegeName = '',
  onSuccess,
  onOpenAuth,
}) => {
  const [collegeCode, setCollegeCode] = useState('');
  const [collegeName, setCollegeName] = useState(initialCollegeName);
  const [state, setState] = useState(currentStudent?.bamsState || 'Maharashtra');
  const [collegeType, setCollegeType] = useState('Government');
  const [quotaType, setQuotaType] = useState('State Quota');
  const [branch, setBranch] = useState(currentStudent?.targetSpecialty?.split('(')[0].trim() || 'Kayachikitsa');
  const [notes, setNotes] = useState('');

  // Update initial college name when passed
  React.useEffect(() => {
    if (isOpen && initialCollegeName) {
      setCollegeName(initialCollegeName);
    }
  }, [isOpen, initialCollegeName]);

  const [loading, setLoading] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    type: 'live_found' | 'suggestion_updated' | 'suggestion_created';
    title: string;
    description: string;
    college?: College;
    suggestion?: StudentCollegeSuggestion;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusResult(null);

    const cleanCode = collegeCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Please enter a valid College Code (e.g. NCISM, AACCC, or State Counselling Code).');
      return;
    }
    if (!collegeName.trim()) {
      setErrorMsg('Please enter the College / Institute Name.');
      return;
    }

    if (!currentStudent) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    setLoading(true);

    try {
      const res = await submitMissingCollege({
        college_code: cleanCode,
        college_name: collegeName.trim(),
        state,
        college_type: collegeType,
        quota_type: quotaType,
        branch,
        notes: notes.trim(),
        user_id: currentStudent.id,
        student_name: currentStudent.fullName,
        student_rank: currentStudent.aiapgetRank,
      });

      setLoading(false);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#38bdf8', '#f59e0b'],
        });
      } catch {}

      if (res.action === 'added_existing_live') {
        setStatusResult({
          type: 'live_found',
          title: 'College Already in System!',
          description: `Great news! "${res.liveCollege?.name || cleanCode}" is already verified in our live AACCC database. We have directly added it to your preference list.`,
          college: res.liveCollege,
        });
      } else if (res.action === 'updated_existing_suggestion') {
        setStatusResult({
          type: 'suggestion_updated',
          title: `Verification +1 Added! (Total: ${res.suggestion?.verification_count || 2} Students)`,
          description: `Other students have also requested "${cleanCode}". Your verification helps faculty prioritize official verification. Added to your preference list!`,
          suggestion: res.suggestion,
        });
      } else {
        setStatusResult({
          type: 'suggestion_created',
          title: 'College Submitted for Verification!',
          description: `"${collegeName.trim()}" (${cleanCode}) has been submitted to our faculty review queue and added to your preference list.`,
          suggestion: res.suggestion,
        });
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to submit college. Please check your network.');
    }
  };

  const handleResetForm = () => {
    setStatusResult(null);
    setCollegeCode('');
    setCollegeName('');
    setNotes('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xl bg-black/85 animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl my-6 rounded-3xl glass-panel border border-white/20 p-5 sm:p-7 bg-[#090d16]/98 shadow-2xl text-white max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="pr-8">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                Crowdsourced Directory
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Community Verification
              </span>
            </div>
            <h2 className="text-xl font-bold font-['Outfit'] text-white">
              Add Missing Ayush College
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Can't find a government, private, or state quota college? Submit its official code to add it to your choice list and trigger faculty verification.
            </p>
          </div>
        </div>

        {/* Not Logged In Warning */}
        {!currentStudent ? (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Sign In Required</h4>
            <p className="text-xs text-slate-300">
              Please sign in with your student profile to add missing colleges and maintain your personal counselling preference list.
            </p>
            <button
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs hover:bg-emerald-300 transition-colors cursor-pointer min-h-[44px]"
            >
              Sign In / Register as Student
            </button>
          </div>
        ) : statusResult ? (
          /* Submission Outcome Card */
          <div className="space-y-4 animate-fadeIn">
            <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              statusResult.type === 'live_found'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                : 'bg-teal-500/15 border-teal-500/30 text-teal-200'
            }`}>
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold text-white mb-1 font-['Outfit']">
                  {statusResult.title}
                </h4>
                <p className="text-xs leading-relaxed opacity-90">
                  {statusResult.description}
                </p>
                <div className="mt-2 text-[11px] font-mono text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-lg inline-block border border-emerald-500/20">
                  Branch Added: {branch}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleResetForm}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 transition-colors cursor-pointer min-h-[44px]"
              >
                + Add Another Missing College
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer min-h-[44px]"
              >
                View My Preference List
              </button>
            </div>
          </div>
        ) : (
          /* The Missing College Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* College Code Field (Smart Match) */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>College Code (NCISM / AACCC / State Code) *</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">e.g. AYU0014 or MH-01</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AYU0014, GAC-NANDED, or KEA-AYU-04"
                value={collegeCode}
                onChange={(e) => {
                  setCollegeCode(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full h-11 px-3.5 text-sm rounded-xl glass-input text-white font-mono placeholder-slate-500 uppercase focus:border-emerald-400 tracking-wider"
              />
              <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-amber-300 font-medium bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Please check and enter the exact College Code from the official AACCC / State Counselling portal.</span>
              </div>
            </div>

            {/* College Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Full Official College Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Government Ayurved College and Hospital, Nanded"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full h-11 px-3.5 text-sm rounded-xl glass-input text-white placeholder-slate-500"
              />
            </div>

            {/* State & College Type (Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>State *</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-11 px-3 text-xs sm:text-sm rounded-xl glass-input text-white bg-slate-900 border border-white/10"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  College Type
                </label>
                <select
                  value={collegeType}
                  onChange={(e) => setCollegeType(e.target.value)}
                  className="w-full h-11 px-3 text-xs sm:text-sm rounded-xl glass-input text-white bg-slate-900 border border-white/10"
                >
                  <option value="Government">Government</option>
                  <option value="Govt-Aided">Govt-Aided</option>
                  <option value="Private">Private</option>
                  <option value="Deemed">Deemed University</option>
                </select>
              </div>
            </div>

            {/* Quota & Target Branch (Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Quota Category
                </label>
                <select
                  value={quotaType}
                  onChange={(e) => setQuotaType(e.target.value)}
                  className="w-full h-11 px-3 text-xs sm:text-sm rounded-xl glass-input text-white bg-slate-900 border border-white/10"
                >
                  <option value="State Quota">State Quota (85%)</option>
                  <option value="All India Quota (AIQ)">All India Quota (AIQ 15%)</option>
                  <option value="Deemed / Management">Deemed / Management Quota</option>
                  <option value="National Institute">National Institute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Preferred Branch *</span>
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full h-11 px-3 text-xs sm:text-sm rounded-xl glass-input text-white bg-slate-900 border border-white/10"
                >
                  {COMMON_AYUSH_BRANCHES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes / Reference Link */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Additional Notes / Reference Link (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Listed in Maharashtra Ayush Round 2 allotment PDF"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-10 px-3.5 text-xs rounded-xl glass-input text-white placeholder-slate-500"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
              >
                {loading ? (
                  <span>Checking Code & Submitting...</span>
                ) : (
                  <>
                    <span>Verify Code & Add to My Preferences</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
