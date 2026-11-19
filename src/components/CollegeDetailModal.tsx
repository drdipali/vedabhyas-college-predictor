import React, { useEffect } from 'react';
import type { PredictionResult } from '../types';
import { 
  X, 
  MapPin, 
  Banknote, 
  Bed, 
  ExternalLink, 
  GraduationCap, 
  Activity,
  Calendar,
  Receipt
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

  const { college, closingRank, userRank, chance, chanceScore, category, confidence } = prediction;

  const typeConfig = {
    Government: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    Private: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Deemed: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  }[college.institutionType];

  const confidenceBadge = {
    High: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    Moderate: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    Borderline: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  }[confidence || 'Moderate'];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-xl bg-black/70 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/20 p-6 sm:p-8 bg-[#0c1220]/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto"
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

        {/* Header Section */}
        <div className="pr-10 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${typeConfig}`}>
              {college.institutionType === 'Government' ? '🏛️ Government College' : college.institutionType === 'Private' ? '🏫 Private Institution' : '🎓 Deemed University'}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white/5 text-slate-300 border border-white/10">
              {college.quota === 'AIQ' ? 'All India Quota (15%)' : college.quota === 'State' ? 'State Quota (85%)' : 'Deemed / Management Quota'}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Est. {college.established}</span>
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

        {/* Admission Verdict Banner */}
        <div className={`p-4 rounded-2xl border mb-6 flex items-center justify-between ${
          chance === 'High Chance'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : chance === 'Probable'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold">Prediction Assessment</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${confidenceBadge}`}>
                {confidence || 'Moderate'} Confidence
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10">
                {chanceScore}% Odds
              </span>
            </div>
            <p className="text-sm font-semibold mt-1">
              {chance === 'High Chance'
                ? `High Chance of allotment in ${college.shortName} (Your AIR: #${userRank})`
                : chance === 'Probable'
                ? `Borderline safe for Round 2 or Mop-Up rounds (Your AIR: #${userRank})`
                : `Aspirational choice. Keep in upper tier choices. (Your AIR: #${userRank})`}
            </p>
          </div>
          <div className="text-right font-mono shrink-0 pl-3">
            <div className="text-[11px] text-slate-400">Closing Cutoff</div>
            <div className="text-base font-bold text-white">#{closingRank}</div>
          </div>
        </div>

        {/* Institutional Overview */}
        <div className="space-y-6 text-sm text-slate-300">
          
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
              About the Institution
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 bg-white/5 p-3.5 rounded-xl border border-white/5">
              {college.description}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Banknote className="w-3 h-3 text-amber-400" />
                <span>Monthly Stipend</span>
              </span>
              <p className="text-sm font-bold text-emerald-400 font-mono mt-1">
                {college.stipend}
              </p>
              <span className="text-[10px] text-slate-500">PG Resident Pay</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Receipt className="w-3 h-3 text-teal-400" />
                <span>Annual Tuition Fee</span>
              </span>
              <p className="text-sm font-bold text-slate-200 font-mono mt-1">
                {college.annualFee}
              </p>
              <span className="text-[10px] text-slate-500">Govt/Mgt Approved</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Bed className="w-3 h-3 text-purple-400" />
                <span>Hospital Beds</span>
              </span>
              <p className="text-sm font-bold text-white font-mono mt-1">
                {college.hospitalBeds}+ Beds
              </p>
              <span className="text-[10px] text-slate-500">In-patient strength</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>OPD Footfall</span>
              </span>
              <p className="text-sm font-bold text-white font-mono mt-1">
                ~{college.opdPerDay} / day
              </p>
              <span className="text-[10px] text-slate-500">Clinical exposures</span>
            </div>
          </div>

          {/* All Category Cutoffs Breakdown */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span>Official AACCC Last Year (Round 3) Cutoffs</span>
              <span className="text-[10px] text-emerald-400 font-normal">All India PG Counseling</span>
            </h4>
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
          </div>

          {/* Top Departments */}
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

          {/* Action buttons */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <a
              href={college.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/15 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              Back to Predictor Results
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
