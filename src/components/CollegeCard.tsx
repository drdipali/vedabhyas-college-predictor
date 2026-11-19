import React from 'react';
import type { PredictionResult } from '../types';
import { 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ArrowUpRight,
  Shield,
  GraduationCap
} from 'lucide-react';

interface CollegeCardProps {
  prediction: PredictionResult;
  onSelect: (prediction: PredictionResult) => void;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({ prediction, onSelect }) => {
  const { college, closingRank, userRank, rankDelta, chance } = prediction;

  // Simple rank comparison styling configuration (High Chance, Moderate, Borderline, Very Low)
  const chanceConfig = {
    'High Chance': {
      border: 'border-emerald-500/30 hover:border-emerald-400/60',
      glow: 'shadow-[0_20px_45px_-12px_rgba(16,185,129,0.2)]',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle2,
      label: 'High Chance',
    },
    'Moderate': {
      border: 'border-teal-500/30 hover:border-teal-400/60',
      glow: 'shadow-[0_20px_45px_-12px_rgba(20,184,166,0.18)]',
      badgeBg: 'bg-teal-500/15 text-teal-300 border-teal-500/40',
      icon: CheckCircle2,
      label: 'Moderate',
    },
    'Borderline': {
      border: 'border-amber-500/30 hover:border-amber-400/60',
      glow: 'shadow-[0_20px_45px_-12px_rgba(245,158,11,0.18)]',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      icon: AlertCircle,
      label: 'Borderline',
    },
    'Very Low': {
      border: 'border-slate-700/50 hover:border-rose-500/40',
      glow: 'shadow-[0_20px_45px_-12px_rgba(0,0,0,0.5)]',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
      icon: HelpCircle,
      label: 'Very Low',
    },
  }[chance] || {
    border: 'border-slate-700/50 hover:border-slate-600',
    glow: 'shadow-none',
    badgeBg: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
    icon: HelpCircle,
    label: chance,
  };

  const typeConfig = {
    Government: {
      tag: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      label: '🏛️ Government',
    },
    Private: {
      tag: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      label: '🏫 Private',
    },
    Deemed: {
      tag: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      label: '🎓 Deemed',
    },
  }[college.institutionType] || {
    tag: 'bg-white/10 text-slate-300 border-white/10',
    label: college.college_type || college.institutionType,
  };

  const ChanceIcon = chanceConfig.icon;
  const quotaLabel = college.quota_type || college.quota || 'AIQ';

  return (
    <div
      tabIndex={0}
      role="article"
      aria-label={`${college.name} - ${chance}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(prediction);
        }
      }}
      className={`college-card group relative flex flex-col justify-between rounded-3xl p-6 glass-card ${chanceConfig.border} ${chanceConfig.glow} focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer select-none`}
      onClick={() => onSelect(prediction)}
    >
      
      {/* Top Header Row: Quota Tag, Type Tag & Chance Pill */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Institution Type Badge */}
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${typeConfig.tag}`}>
              {typeConfig.label}
            </span>

            {/* Quota Tag (Exact quota_type from JSON, no hardcoded 15%) */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-medium text-slate-300">
              <Shield className="w-2.5 h-2.5 text-emerald-400" />
              <span>{quotaLabel}</span>
            </div>

            {/* Subtle Verified by College Badge */}
            {college.is_verified && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>✓ Verified by College</span>
              </span>
            )}
          </div>

          {/* Simple Rank Comparison Verdict Badge */}
          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${chanceConfig.badgeBg} shadow-sm`}>
            <ChanceIcon className="w-3 h-3" />
            <span>{chanceConfig.label}</span>
          </div>
        </div>

        {/* College Name & Location */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>{college.city}, {college.state}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{college.type}</span>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug font-['Outfit']">
            {college.name}
          </h3>
        </div>

        {/* Rank Comparison Metrics */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Reference Cutoff ({prediction.category}):</span>
            <span className="font-mono font-bold text-white">AIR #{closingRank}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Your AIAPGET Rank:</span>
            <span className="font-mono font-bold text-emerald-400">
              AIR #{userRank} {rankDelta >= 0 ? `(+${rankDelta} within cutoff)` : `(${rankDelta} above cutoff)`}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/5">
            <span className="text-slate-400">Prediction Assessment:</span>
            <span className={`font-semibold text-xs flex items-center gap-1 ${
              chance === 'High Chance' ? 'text-emerald-300' : chance === 'Moderate' ? 'text-teal-300' : chance === 'Borderline' ? 'text-amber-300' : 'text-rose-300'
            }`}>
              <ChanceIcon className="w-3 h-3" />
              <span>{chanceConfig.label}</span>
            </span>
          </div>
        </div>

        {/* Verified Fees & Stipend (if approved through College Portal) */}
        {(college.annual_fee || college.monthly_stipend) && (
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 mb-4 flex items-center justify-between text-[11px] shadow-sm">
            {college.annual_fee && (
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Verified Annual Fee</span>
                <span className="text-emerald-300 font-bold font-mono">{college.annual_fee}</span>
              </div>
            )}
            {college.monthly_stipend && (
              <div className="text-right">
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Verified Monthly Stipend</span>
                <span className="text-emerald-300 font-bold font-mono">{college.monthly_stipend}</span>
              </div>
            )}
          </div>
        )}

        {/* Top Clinical Specialties Chips */}
        <div className="space-y-1.5 mb-5">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-emerald-400" />
            <span>Available MD / MS Departments:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {college.topBranches.slice(0, 4).map((branch) => (
              <span
                key={branch}
                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium"
              >
                {branch}
              </span>
            ))}
            {college.topBranches.length > 4 && (
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-400">
                +{college.topBranches.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Button */}
      <div className="pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(prediction);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-all group-hover:bg-emerald-500/15"
        >
          <span>View Reference Cutoffs & Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
