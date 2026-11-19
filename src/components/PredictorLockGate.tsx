import React from 'react';
import { Lock, UserCheck, ShieldCheck, Sparkles, Building2, Banknote, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PredictorLockGateProps {
  onOpenAuth: () => void;
  onOpenAdminLogin?: () => void;
}

export const PredictorLockGate: React.FC<PredictorLockGateProps> = ({ onOpenAuth, onOpenAdminLogin }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-10">
      <div className="relative glass-panel rounded-3xl p-8 sm:p-12 border border-emerald-500/30 shadow-[0_25px_60px_-15px_rgba(16,185,129,0.25)] backdrop-blur-2xl text-center overflow-hidden">
        
        {/* Decorative corner ambient glows */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Icon Emblem */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-amber-500/20 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-6 animate-float">
          <Lock className="w-10 h-10 text-emerald-400" />
          <div className="absolute -inset-1 rounded-3xl bg-emerald-400/20 blur-md -z-10" />
        </div>

        {/* Heading */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Student Authentication Required</span>
        </div>

        <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit'] mb-4">
          Unlock the Vedabhyas College Predictor
        </h3>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-light mb-8">
          To protect candidate privacy and provide tailored counseling calculations, students must sign in using their{' '}
          <strong className="text-emerald-400 font-semibold">Mobile Number</strong> and{' '}
          <strong className="text-teal-300 font-semibold">Email ID</strong> alongside basic UG BAMS college details.
        </p>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left max-w-2xl mx-auto mb-8">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>50+ Premier Colleges</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-snug">
              Compare All India Quota & State cutoffs across 22 states using official AACCC Round 3 data.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Banknote className="w-4 h-4 text-amber-400" />
              <span>Stipends & Fees</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-snug">
              Inspect verified stipends (up to ₹1.12L/mo) and annual fee structures across 22 states.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Choice-Locking Mentorship</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-snug">
              Get personalized Ayush Gurukulam counseling guidance for Round 1, Round 2, and Mop-Up.
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div>
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 text-slate-950 font-bold text-base sm:text-lg tracking-wide hover:opacity-95 shadow-[0_15px_35px_rgba(52,211,153,0.35)] hover:shadow-[0_20px_45px_rgba(52,211,153,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
            <span>Sign In / Register with Mobile & Email to Unlock</span>
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 mt-4">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Free For BAMS Doctors</span>
            </span>
            <span>•</span>
            <span>Verified AIAPGET Counseling Data</span>
          </div>
        </div>

        {/* Dedicated Admin Portal Direct Link */}
        {onOpenAdminLogin && (
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-400">
            <span>Faculty or Counselor at Ayush Gurukulam?</span>
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-semibold transition-all cursor-pointer"
              title="Passcode: ayushadmin"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Faculty Admin Portal Login</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};