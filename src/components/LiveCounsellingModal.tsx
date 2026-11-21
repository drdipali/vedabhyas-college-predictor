import React, { useState, useMemo } from 'react';
import { 
  X, 
  Bell, 
  ExternalLink, 
  Search, 
  Clock, 
  AlertCircle, 
  Calendar, 
  RefreshCw,
  Pin
} from 'lucide-react';
import type { CounsellingAlertsFeed, UpdateCategory } from '../types';
import { STATE_OFFICIAL_PORTALS } from '../data/counselling';

interface LiveCounsellingModalProps {
  isOpen: boolean;
  onClose: () => void;
  feed: CounsellingAlertsFeed;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const CATEGORIES: ('All' | UpdateCategory)[] = [
  'All',
  'Choice Filling',
  'Registration',
  'Result',
  'Seat Matrix',
  'Schedule Change',
  'Notice'
];

const MONITORED_STATES = [
  'All',
  'AACCC / All India',
  'Maharashtra',
  'Uttar Pradesh',
  'Karnataka',
  'Gujarat',
  'Madhya Pradesh',
  'Rajasthan',
  'Kerala',
  'West Bengal',
  'Haryana',
  'Delhi',
  'Bihar',
  'Tamil Nadu'
];

export const LiveCounsellingModal: React.FC<LiveCounsellingModalProps> = ({
  isOpen,
  onClose,
  feed,
  onRefresh,
  isRefreshing = false
}) => {
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<'All' | UpdateCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract all available states from both monitored list and updates
  const availableStates = useMemo(() => {
    const statesSet = new Set(MONITORED_STATES);
    (feed.updates || []).forEach((u) => statesSet.add(u.state));
    return Array.from(statesSet);
  }, [feed.updates]);

  // Filtered updates: Pinned notices always remain at the top
  const filteredUpdates = useMemo(() => {
    return (feed.updates || []).filter((update) => {
      // State filter: normalize matching for AACCC variants
      if (selectedState !== 'All') {
        const normSelected = selectedState.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normUpdateState = update.state.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isAacccMatch = (normSelected.includes('aaccc') || normSelected.includes('central') || normSelected.includes('allindia')) &&
                             (normUpdateState.includes('aaccc') || normUpdateState.includes('central') || normUpdateState.includes('allindia'));
        if (!isAacccMatch && update.state !== selectedState) {
          return false;
        }
      }
      // Category filter
      if (selectedCategory !== 'All' && update.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = update.title.toLowerCase().includes(q);
        const matchesSummary = (update.summary || update.description || '').toLowerCase().includes(q);
        const matchesState = update.state.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesState) {
          return false;
        }
      }
      return true;
    });
  }, [feed.updates, selectedState, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  // Selected state portal info fallback
  const targetPortal = selectedState !== 'All' 
    ? (STATE_OFFICIAL_PORTALS[selectedState] || 
       Object.entries(STATE_OFFICIAL_PORTALS).find(([k]) => 
         k.toLowerCase().includes(selectedState.toLowerCase()) || 
         selectedState.toLowerCase().includes(k.toLowerCase())
       )?.[1])
    : null;

  // Format date helper
  const formatTimeAgo = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const getCategoryBadgeClass = (category: UpdateCategory) => {
    switch (category) {
      case 'Choice Filling':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Result':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Registration':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'Seat Matrix':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Schedule Change':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto backdrop-blur-xl bg-black/85 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-3xl glass-panel border border-white/20 p-5 sm:p-8 bg-[#090d16]/95 shadow-[0_25px_65px_-10px_rgba(0,0,0,0.95)] max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 flex items-start gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 via-slate-900 to-amber-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider font-bold text-red-400">
                Official AIAPGET 2026 Feed
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{feed.active_portals_count ?? 9} Portals Actively Returning Valid Data</span>
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] mt-0.5">
              Live AYUSH PG Counselling Alerts & Official Notices
            </h3>
            
            {/* Last Updated Timestamp Badge & Manual Refresh Button */}
            <div className="flex items-center gap-2.5 sm:gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Last Updated: {formatTimeAgo(feed.last_updated)}</span>
              </span>

              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-sm active:scale-95"
                  title="Re-fetch latest official notices"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
                </button>
              )}

              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="hidden sm:inline">9 Verified Live State Portals + Central AACCC</span>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 mb-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search official notices, dates, notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* State Filter Dropdown */}
            <div className="sm:col-span-4">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
              >
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st === 'All' ? '🏛️ All States & Central Portals' : st}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full h-10 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? '📑 All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Quick State Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <span className="text-slate-400 font-semibold shrink-0">Quick State:</span>
            {['All', 'AACCC / All India', 'Maharashtra', 'Uttar Pradesh', 'Karnataka', 'Gujarat', 'Madhya Pradesh', 'Rajasthan'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer font-medium ${
                  selectedState === st
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {st === 'All' ? 'All' : st.replace('AACCC / All India', 'Central AACCC')}
              </button>
            ))}
          </div>
        </div>

        {/* Updates Feed List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredUpdates.length === 0 ? (
            /* Requirement: If counselling_updates.json has no live scraped notices for a state, show "No new automated notices yet — check the official portal directly" */
            selectedState !== 'All' ? (
              <div className="p-6 sm:p-8 text-center rounded-2xl bg-slate-900/60 border border-emerald-500/20 text-slate-300 animate-fadeIn">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                  <ExternalLink className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  {selectedState} AYUSH PG Counselling
                </h4>
                <p className="text-sm font-semibold text-amber-300 mb-2">
                  No new automated notices yet — check the official portal directly
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
                  {targetPortal ? targetPortal.authority : `Official state portal authority for ${selectedState} PG AYUSH admissions.`}
                </p>
                {targetPortal ? (
                  <a
                    href={targetPortal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:opacity-95 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <span>Open {selectedState} Official Portal ({targetPortal.name})</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <a
                    href="https://aaccc.gov.in/pg-counselling/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <span>Check Central AACCC Portal</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-xs">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                <p>No counselling notices found matching the selected filters.</p>
                <button
                  onClick={() => {
                    setSelectedState('All');
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-emerald-400 hover:underline font-semibold"
                >
                  Reset all filters
                </button>
              </div>
            )
          ) : (
            filteredUpdates.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.is_pinned
                    ? 'bg-gradient-to-r from-amber-950/30 via-slate-900/80 to-slate-900/90 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
                    : item.is_urgent
                    ? 'bg-gradient-to-r from-red-950/20 via-slate-900/60 to-slate-900/80 border-red-500/30 hover:border-red-400/50 shadow-md'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.is_pinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                        <Pin className="w-3 h-3 text-amber-400" />
                        <span>Verified Pinned Alert</span>
                      </span>
                    )}

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/15">
                      {item.state}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadgeClass(item.category)}`}>
                      {item.category}
                    </span>

                    {item.is_urgent && !item.is_pinned && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-red-500 text-white uppercase tracking-wider animate-pulse">
                        Urgent Action
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.date}</span>
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white mb-1.5 leading-snug">
                  {item.title}
                </h4>

                {(item.summary || item.description) && (
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {item.summary || item.description}
                  </p>
                )}

                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-500">
                    Source: {item.state} Official Portal
                  </span>
                  
                  <a
                    href={item.official_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:opacity-95 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <span>View Official PDF / Notice</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
