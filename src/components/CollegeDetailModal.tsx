import React, { useEffect } from 'react';
import type { PredictionResult } from '../types';
import { 
  X, 
  MapPin, 
  ExternalLink, 
  GraduationCap, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface CollegeDetailModalProps {
  prediction: PredictionResult | null;
  onClose: () => void;
}

export const CollegeDetailModal: React.FC<CollegeDetailModalProps> = ({
  prediction,
  onClose,
}) => {
  // Handle keyboard ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!prediction) return null;

  const { college, closingRank, userRank, chance, category } = prediction;

  const typeConfig = {
    Government: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    Private: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Deemed: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  }[college.institutionType] || 'bg-white/10 text-slate-300 border-white/10';

  const chanceBadgeConfig = {
    'High Chance': {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle2,
      label: 'High Chance',
      desc: `Your AIR #${userRank} is within the closing cutoff (#${closingRank}). Favorable allotment probability.`,
    },
    'Moderate': {
      bg: 'bg-teal-500/15 border-teal-500/30 text-teal-300',
      pill: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      icon: CheckCircle2,
      label: 'Moderate Chance',
      desc: `Your AIR #${userRank} is close to last year's cutoff (#${closingRank}). Good choice for Round 1 & Round 2.`,
    },
    'Borderline': {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      pill: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: AlertCircle,
      label: 'Borderline Chance',
      desc: `Your AIR #${userRank} is slightly above the closing cutoff (#${closingRank}). Possible in Mop-Up or Stray Vacancy rounds.`,
    },
    'Very Low': {
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      pill: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: HelpCircle,
      label: 'Very Low Chance',
      desc: `Your AIR #${userRank} is significantly higher than closing cutoff (#${closingRank}). Keep as an aspirational top-tier preference.`,
    },
  }[chance] || {
    bg: 'bg-slate-800/40 border-slate-700 text-slate-300',
    pill: 'bg-slate-700/40 text-slate-300 border-slate-600',
    icon: HelpCircle,
    label: chance,
    desc: `Your AIR: #${userRank} | Closing Cutoff: #${closingRank}`,
  };

  const ChanceIcon = chanceBadgeConfig.icon;
  const quotaLabel = college.quota_type || college.quota || 'AIQ';
  const verifyUrl = college.source_url || 'https://aaccc.gov.in/pg-counselling/';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-xl bg-black/75 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/20 p-6 sm:p-8 bg-[#0c1220]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto"
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

        {/* 1. Header Section: Name, Location, College Type & Quota Type */}
        <div className="pr-10 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* College Type Badge */}
            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${typeConfig}`}>
              {college.college_type ? `${college.college_type} Institute` : college.institutionType === 'Government' ? '🏛️ Government' : college.institutionType === 'Private' ? '🏫 Private' : '🎓 Deemed'}
            </span>
            
            {/* Exact Quota Type Badge from JSON (No hardcoded 15%) */}
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white/5 text-slate-200 border border-white/10 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{quotaLabel}</span>
            </span>
          </div>

          <h3 id="modal-title" className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] leading-snug">
            {college.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>{college.city}, {college.state}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{college.type}</span>
          </div>
        </div>

        {/* Verified by College Administration Banner */}
        {college.is_verified && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">✓ Officially Verified by College Administration</span>
                <span className="text-[11px] text-emerald-300/90">
                  {college.verified_by ? `Confirmed by ${college.verified_by}. ` : ''}
                  Fees and stipends have been reviewed and approved.
                </span>
              </div>
            </div>
            {college.verified_at && (
              <span className="hidden sm:inline-block text-[10px] text-emerald-400/80 font-mono bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                Verified: {new Date(college.verified_at).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Verified Financial Details (if present) */}
        {(college.annual_fee || college.monthly_stipend) && (
          <div className="grid grid-cols-2 gap-3 mb-5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            {college.annual_fee && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Approved Annual Fee</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{college.annual_fee}</span>
              </div>
            )}
            {college.monthly_stipend && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Approved Monthly Stipend</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{college.monthly_stipend}</span>
              </div>
            )}
          </div>
        )}

        {/* 2. Prediction Assessment (Your Rank vs. Closing Cutoff) - No fake percentages */}
        <div className={`p-4 rounded-2xl border mb-6 flex items-center justify-between ${chanceBadgeConfig.bg}`}>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold">Prediction Assessment</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${chanceBadgeConfig.pill}`}>
                <ChanceIcon className="w-3 h-3" />
                <span>{chanceBadgeConfig.label}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-200 mt-1.5 leading-relaxed">
              {chanceBadgeConfig.desc}
            </p>
          </div>
          <div className="text-right font-mono shrink-0 pl-3">
            <div className="text-[11px] text-slate-400">Closing Cutoff</div>
            <div className="text-base font-bold text-white">#{closingRank}</div>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-300">
          
          {/* 3. Category-wise Closing Cutoffs */}
          <div>
            <div className="mb-2 flex items-center justify-between flex-wrap gap-1">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Reference Cutoffs — Verify on Official Portal
              </h4>
              <span className="text-[10px] text-amber-400 font-mono">
                Baseline Ranks
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center">
              {Object.entries(college.categoryClosingRanks).map(([cat, rankVal]) => {
                const isUserCat = cat === category;
                return (
                  <div
                    key={cat}
                    className={`p-2 rounded-xl border ${
                      isUserCat
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="text-[10px] font-semibold uppercase">{cat}</div>
                    <div className="text-xs sm:text-sm font-mono font-bold mt-0.5">#{rankVal}</div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              * Indicative historical cutoff benchmark. Actual 2026 cutoffs depend on official seat matrix and category reservations.
            </p>
          </div>

          {/* 4. Available MD / MS Ayurveda Departments */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Available MD / MS Ayurveda Departments</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {college.topBranches.map((branch) => (
                <span
                  key={branch}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-200"
                >
                  {branch}
                </span>
              ))}
            </div>
          </div>

          {/* 5. Action buttons & Official Verification Link */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <a
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:opacity-95 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <span>Verify Official Fees, Stipend & Seat Matrix</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
            </a>

            {college.website && (
              <a
                href={college.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/15 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>College Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
