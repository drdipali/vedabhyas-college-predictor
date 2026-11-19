import React from 'react';
import type { PredictionResult } from '../types';
import { 
  MapPin, 
  Banknote, 
  Bed, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ArrowUpRight,
  Shield,
  GraduationCap,
  Receipt
} from 'lucide-react';

interface CollegeCardProps {
  prediction: PredictionResult;
  onSelect: (prediction: PredictionResult) => void;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({ prediction, onSelect }) => {
  const { college, closingRank, userRank, rankDelta, chance, chanceScore, confidence } = prediction;

  // Chance styling configuration
  const chanceConfig = {
    'High Chance': {
      border: 'border-emerald-500/30 hover:border-emerald-400/60',
      glow: 'shadow-[0_20px_45px_-12px_rgba(16,185,129,0.2)]',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle2,
      label: 'High Chance',
    },
    'Probable': {
      border: 'border-amber-500/30 hover:border-amber-400/60',
      glow: 'shadow-[0_20px_45px_-12px_rgba(245,158,11,0.18)]',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      icon: AlertCircle,
      label: 'Moderate / Borderline',
    },
    'Tough Competition': {
      border: 'border-slate-700/50 hover:border-rose-500/40',
      glow: 'shadow-[0_20px_45px_-12px_rgba(0,0,0,0.5)]',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
      icon: HelpCircle,
      label: 'Borderline / Tough',
    },
  }[chance];

  const confidenceConfig = {
    High: {
      label: 'High Confidence',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      dot: 'bg-emerald-400',
    },
    Moderate: {
      label: 'Moderate Confidence',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      dot: 'bg-amber-400',
    },
    Borderline: {
      label: 'Borderline Chance',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      dot: 'bg-rose-400',
    },
  }[confidence || 'Moderate'];

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
      label: '🎓 Deemed Univ',
    },
  }[college.institutionType];

  const ChanceIcon = chanceConfig.icon;

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
          
          <div className="flex items-center gap-1.5">
            {/* Institution Type Badge */}
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${typeConfig.tag}`}>
              {typeConfig.label}
            </span>

            {/* Quota Tag */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-medium text-slate-300">
              <Shield className="w-2.5 h-2.5 text-emerald-400" />
              <span>{college.quota}</span>
            </div>
          </div>

          {/* Chance & Confidence Badges */}
          <div className="flex items-center gap-1.5">
            <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${confidenceConfig.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${confidenceConfig.dot}`} />
              <span>{confidenceConfig.label}</span>
            </span>
            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${chanceConfig.badgeBg} shadow-sm`}>
              <ChanceIcon className="w-3 h-3" />
              <span>{chanceConfig.label}</span>
            </div>
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
            <span className="text-slate-400">AACCC R3 Cutoff ({prediction.category}):</span>
            <span className="font-mono font-bold text-white">AIR #{closingRank}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Your AIAPGET Rank:</span>
            <span className="font-mono font-bold text-emerald-400">
              AIR #{userRank} {rankDelta >= 0 ? `(+${rankDelta} safe)` : `(${rankDelta})`}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5 border-t border-white/5">
            <span className="text-slate-400">Prediction Confidence:</span>
            <span className={`font-semibold text-xs flex items-center gap-1 ${
              confidence === 'High' ? 'text-emerald-400' : confidence === 'Moderate' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${confidenceConfig.dot}`} />
              <span>{confidenceConfig.label}</span>
            </span>
          </div>

          {/* Progress / Margin Bar */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400">Admission Probability</span>
              <span className="font-mono font-semibold text-slate-300">{chanceScore}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  chance === 'High Chance'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : chance === 'Probable'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-rose-500 to-pink-500'
                }`}
                style={{ width: `${chanceScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stipend, Annual Fee & Bed Strength */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-center">
            <span className="text-slate-400 flex items-center gap-1 text-[10px]">
              <Banknote className="w-3 h-3 text-amber-400" />
              <span>Stipend</span>
            </span>
            <span className="font-bold text-emerald-300 text-xs mt-0.5 font-mono truncate">
              {college.stipend.split('/')[0]}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-center">
            <span className="text-slate-400 flex items-center gap-1 text-[10px]">
              <Receipt className="w-3 h-3 text-teal-400" />
              <span>Annual Fee</span>
            </span>
            <span className="font-bold text-slate-200 text-xs mt-0.5 font-mono truncate">
              {college.annualFee.split('/')[0]}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-center">
            <span className="text-slate-400 flex items-center gap-1 text-[10px]">
              <Bed className="w-3 h-3 text-purple-400" />
              <span>Beds</span>
            </span>
            <span className="font-bold text-white text-xs mt-0.5 font-mono">
              {college.hospitalBeds}+
            </span>
          </div>
        </div>

        {/* Top Clinical Specialties Chips */}
        <div className="space-y-1.5 mb-5">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-emerald-400" />
            <span>Notable PG Specializations:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {college.topBranches.slice(0, 3).map((branch) => (
              <span
                key={branch}
                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium"
              >
                {branch}
              </span>
            ))}
            {college.topBranches.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-400">
                +{college.topBranches.length - 3} more
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
          <span>View Profile, Fees & Cutoffs</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
