import React, { useEffect, useRef, useState } from 'react';
import type { PredictionResult, ChanceLevel } from '../types';
import { CollegeCard } from './CollegeCard';
import { Sparkles, CheckCircle2, AlertCircle, HelpCircle, Frown, Plus } from 'lucide-react';
import gsap from 'gsap';

interface CollegeGridProps {
  predictions: PredictionResult[];
  onSelectCollege: (pred: PredictionResult) => void;
  userRank: number | '';
  category: string;
  onAddToPreference?: (pred: PredictionResult) => void;
  preferenceCollegeIds?: string[];
  onOpenAddMissing?: () => void;
}

export const CollegeGrid: React.FC<CollegeGridProps> = ({
  predictions,
  onSelectCollege,
  userRank,
  category,
  onAddToPreference,
  preferenceCollegeIds = [],
  onOpenAddMissing,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedChanceFilter, setSelectedChanceFilter] = useState<'All' | ChanceLevel>('All');

  // GSAP staggered entrance animation whenever predictions or filter changes
  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.college-card');
      if (cards.length > 0) {
        // Kill existing tweens on these elements to prevent glitching
        gsap.killTweensOf(cards);

        // Staggered zero-g floating entrance
        gsap.fromTo(
          cards,
          {
            y: 45,
            opacity: 0,
            scale: 0.96,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.55,
            stagger: 0.06,
            ease: 'power3.out',
          }
        );
      }
    }
  }, [predictions, selectedChanceFilter]);

  if (!userRank) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-['Outfit']">
            Ready to Predict Your College
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Enter your AIAPGET All India Rank above and select your counseling category to instantly unlock admission odds across India's top 12 Ayurvedic institutes.
          </p>
        </div>
      </div>
    );
  }

  // Filter predictions by selected chance filter tab
  const filteredPredictions = predictions.filter((p) => {
    if (selectedChanceFilter === 'All') return true;
    return p.chance === selectedChanceFilter;
  });

  // Calculate statistics
  const highChanceCount = predictions.filter((p) => p.chance === 'High Chance').length;
  const moderateCount = predictions.filter((p) => p.chance === 'Moderate').length;
  const borderlineCount = predictions.filter((p) => p.chance === 'Borderline').length;
  const veryLowCount = predictions.filter((p) => p.chance === 'Very Low').length;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Results Header & Summary Stats Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Summary Title & Subtitle */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              AIAPGET 2024 Prediction Analysis
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-300">
              Rank: <strong className="text-white">AIR #{userRank}</strong> ({category})
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <h3 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
              {predictions.length} Institutes Evaluated
            </h3>
            {onOpenAddMissing && (
              <button
                onClick={onOpenAddMissing}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors cursor-pointer"
                title="Can't find a college? Add it here"
              >
                <Plus className="w-3 h-3" />
                <span>+ Can't find a college? Add it here</span>
              </button>
            )}
          </div>
        </div>

        {/* Center / Right: Chance Category Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => setSelectedChanceFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedChanceFilter === 'All'
                ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            All Results ({predictions.length})
          </button>

          <button
            onClick={() => setSelectedChanceFilter('High Chance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedChanceFilter === 'High Chance'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>High Chance ({highChanceCount})</span>
          </button>

          <button
            onClick={() => setSelectedChanceFilter('Moderate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedChanceFilter === 'Moderate'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Moderate ({moderateCount})</span>
          </button>

          <button
            onClick={() => setSelectedChanceFilter('Borderline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedChanceFilter === 'Borderline'
                ? 'bg-orange-500 text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                : 'bg-orange-500/10 text-orange-300 border border-orange-500/30 hover:bg-orange-500/20'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Borderline ({borderlineCount})</span>
          </button>

          <button
            onClick={() => setSelectedChanceFilter('Very Low')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedChanceFilter === 'Very Low'
                ? 'bg-rose-500 text-white font-bold shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Very Low ({veryLowCount})</span>
          </button>

        </div>
      </div>

      {/* Grid of Cards or Empty State */}
      {filteredPredictions.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-white/10 max-w-md mx-auto">
          <Frown className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No colleges match your filter</h4>
          <p className="text-xs text-slate-400 mb-4">
            Try adjusting your search criteria, clearing the state filter, or switching back to "All Results".
          </p>
          <button
            onClick={() => setSelectedChanceFilter('All')}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredPredictions.map((pred) => (
            <CollegeCard
              key={pred.college.id}
              prediction={pred}
              onSelect={onSelectCollege}
              onAddToPreference={onAddToPreference}
              isInPreferenceList={preferenceCollegeIds.includes(pred.college.id)}
            />
          ))}
        </div>
      )}

      {/* Subtle Footer Disclaimer */}
      <div className="mt-10 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center max-w-3xl mx-auto">
        <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300">Note:</span> Cutoff ranks, fees, and stipends are indicative. Always verify on the official AACCC/State counselling portal or college website before locking choices.
        </p>
      </div>

    </section>
  );
};
