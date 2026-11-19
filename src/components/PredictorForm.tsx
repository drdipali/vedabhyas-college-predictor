import React, { useState } from 'react';
import type { Category, QuotaFilter, InstitutionTypeFilter } from '../types';
import { Search, SlidersHorizontal, Sparkles, ChevronRight, Hash, Users, MapPin, Building2, Landmark, GraduationCap, Stethoscope } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PredictorFormProps {
  rank: number | '';
  setRank: (rank: number | '') => void;
  category: Category;
  setCategory: (category: Category) => void;
  quotaFilter: QuotaFilter;
  setQuotaFilter: (quota: QuotaFilter) => void;
  institutionTypeFilter: InstitutionTypeFilter;
  setInstitutionTypeFilter: (type: InstitutionTypeFilter) => void;
  stateFilter: string;
  setStateFilter: (state: string) => void;
  branchFilter: string;
  setBranchFilter: (branch: string) => void;
  availableBranches: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  availableStates: string[];
  sortBy: 'chance' | 'rank' | 'name';
  setSortBy: (sort: 'chance' | 'rank' | 'name') => void;
  onPredict: () => void;
}

const CATEGORIES: Category[] = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const PRESET_RANKS = [95, 240, 580, 1450, 2600];

export const PredictorForm: React.FC<PredictorFormProps> = ({
  rank,
  setRank,
  category,
  setCategory,
  quotaFilter,
  setQuotaFilter,
  institutionTypeFilter,
  setInstitutionTypeFilter,
  stateFilter,
  setStateFilter,
  branchFilter,
  setBranchFilter,
  availableBranches,
  searchQuery,
  setSearchQuery,
  availableStates,
  sortBy,
  setSortBy,
  onPredict,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof rank === 'number' && rank > 0) {
      onPredict();
      // Trigger subtle particle burst
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#34d399', '#f59e0b', '#38bdf8', '#8b5cf6'],
        });
      } catch (err) {
        // ignore if canvas not supported
      }
    }
  };

  const handleRankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (val === '') {
      setRank('');
    } else {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        setRank(parsed);
      }
    }
  };

  const handlePresetClick = (presetRank: number) => {
    setRank(presetRank);
    onPredict();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <div className="relative glass-panel rounded-3xl p-6 sm:p-8 border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        
        {/* Decorative corner glows */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Main Input Row: AIAPGET Rank & Category */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            
            {/* Rank Input Field */}
            <div className="md:col-span-6 space-y-2">
              <label 
                htmlFor="aiapget-rank-input" 
                className="flex items-center justify-between text-sm font-medium text-slate-200"
              >
                <span className="flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-emerald-400" />
                  <span>AIAPGET All India Rank (AIR)</span>
                </span>
                <span className="text-xs text-emerald-400/90 font-mono">Any Rank (1 to 15,000+)</span>
              </label>

              <div className="relative">
                <input
                  id="aiapget-rank-input"
                  type="number"
                  min="1"
                  max="100000"
                  placeholder="e.g. 350"
                  value={rank}
                  onChange={handleRankChange}
                  required
                  aria-describedby="rank-helper"
                  className="w-full h-14 pl-4 pr-12 text-xl font-bold font-mono tracking-wider rounded-2xl glass-input text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-400"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 rounded-md bg-white/10 text-slate-400 uppercase tracking-wider pointer-events-none">
                  AIR
                </div>
              </div>
            </div>

            {/* Category Select Radio Group */}
            <div className="md:col-span-6 space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-200">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Counseling Category</span>
              </label>

              <div 
                role="radiogroup" 
                aria-label="Counseling Category"
                className="grid grid-cols-5 gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10"
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      type="button"
                      key={cat}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => setCategory(cat)}
                      className={`h-11 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.4)] scale-[1.02]'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Quick Preset Rank Chips with Category Context */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
            <span className="font-medium text-slate-400">Quick Test Ranks:</span>
            {PRESET_RANKS.map((preset) => {
              const label =
                preset <= 100
                  ? 'Apex Central'
                  : preset <= 300
                  ? 'National'
                  : preset <= 700
                  ? 'State Govt'
                  : preset <= 1500
                  ? 'Top Private'
                  : 'Deemed Univ';
              return (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  className={`px-2.5 py-1 rounded-lg border transition-all text-xs font-mono cursor-pointer flex items-center gap-1 ${
                    rank === preset
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="font-bold">#{preset}</span>
                  <span className="text-[10px] opacity-70">({label})</span>
                </button>
              );
            })}
          </div>

          {/* Institution Type Selector (Government vs Private vs Deemed) */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>College Type Filter:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'All', label: 'All Colleges', icon: Building2 },
                { id: 'Government', label: '🏛️ Government', icon: Landmark },
                { id: 'Private', label: '🏫 Private', icon: Building2 },
                { id: 'Deemed', label: '🎓 Deemed Univ', icon: GraduationCap },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setInstitutionTypeFilter(t.id as InstitutionTypeFilter)}
                  className={`h-10 px-3 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    institutionTypeFilter === t.id
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Button */}
          <div>
            <button
              type="submit"
              disabled={!rank}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 text-slate-950 font-bold text-base sm:text-lg tracking-wide hover:opacity-95 shadow-[0_10px_30px_rgba(52,211,153,0.3)] hover:shadow-[0_15px_40px_rgba(52,211,153,0.45)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Predict Ayurvedic Colleges</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Advanced Filter Toggle & Inline Controls */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              {/* Quota Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-white/10 text-xs">
                {(['All', 'AIQ', 'State', 'Deemed/Mgt'] as QuotaFilter[]).map((q) => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => setQuotaFilter(q)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      quotaFilter === q
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {q === 'All' ? 'All Quotas' : q === 'AIQ' ? 'AIQ' : q === 'State' ? 'State Quota' : 'Deemed / Management'}
                  </button>
                ))}
              </div>

              {/* Toggle Filters Button */}
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>
                  {showAdvancedFilters 
                    ? 'Hide Advanced Filters' 
                    : `Filter by State (${availableStates.length}), Branch (${availableBranches.length}) & Sort`}
                </span>
                {(branchFilter !== 'All' || stateFilter !== 'All' || searchQuery) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
                )}
              </button>
            </div>

            {/* Expandable Advanced Filters */}
            {showAdvancedFilters && (
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fadeIn">
                
                {/* Search query input */}
                <div>
                  <label htmlFor="search-input" className="block text-xs text-slate-400 mb-1">
                    Search Keyword / City / College
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="search-input"
                      type="text"
                      placeholder="e.g. Pune, SDM, IPGT..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 pl-8 pr-3 text-xs rounded-xl glass-input text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* State dropdown */}
                <div>
                  <label htmlFor="state-select" className="block text-xs text-slate-400 mb-1">
                    State / Union Territory
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      id="state-select"
                      value={stateFilter}
                      onChange={(e) => setStateFilter(e.target.value)}
                      className="w-full h-10 pl-8 pr-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                    >
                      <option value="All">All States ({availableStates.length} States)</option>
                      {availableStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Branch / Specialty Dropdown */}
                <div>
                  <label htmlFor="branch-select" className="block text-xs text-slate-400 mb-1">
                    MD / MS Ayurveda Branch
                  </label>
                  <div className="relative">
                    <Stethoscope className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                    <select
                      id="branch-select"
                      value={branchFilter}
                      onChange={(e) => setBranchFilter(e.target.value)}
                      className="w-full h-10 pl-8 pr-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                    >
                      <option value="All">All Branches (All Specialities)</option>
                      {availableBranches.map((br) => (
                        <option key={br} value={br}>
                          {br}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sort dropdown */}
                <div>
                  <label htmlFor="sort-select" className="block text-xs text-slate-400 mb-1">
                    Sort Results By
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full h-10 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                  >
                    <option value="chance">Best Admission Chance</option>
                    <option value="rank">Lowest Closing Rank (Top Tier)</option>
                    <option value="name">College Name (A–Z)</option>
                  </select>
                </div>

              </div>
            )}

          </div>

        </form>

      </div>
    </div>
  );
};
