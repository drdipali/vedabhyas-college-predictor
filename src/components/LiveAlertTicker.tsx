import React, { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import type { CounsellingAlertsFeed } from '../types';

interface LiveAlertTickerProps {
  feed: CounsellingAlertsFeed;
  onOpenUpdates: () => void;
}

export const LiveAlertTicker: React.FC<LiveAlertTickerProps> = ({ feed, onOpenUpdates }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const tickerItems = feed.urgent_ticker && feed.urgent_ticker.length > 0 
    ? feed.urgent_ticker 
    : [
        "🔴 AACCC / All India: AIAPGET 2026 Counselling Currently On Hold (Administrative Reasons) — Check official updates on aaccc.gov.in"
      ];

  // Auto rotate ticker message every 6 seconds
  useEffect(() => {
    if (tickerItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickerItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [tickerItems.length]);

  if (isDismissed) return null;

  return (
    <div className="w-full bg-[#1e131d]/90 border-b border-red-500/25 backdrop-blur-md text-white text-xs py-1.5 px-3 sm:px-6 relative z-30 transition-all overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        
        {/* Left Indicator: Live Status */}
        <div className="flex items-center gap-1.5 shrink-0 select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-500/20 text-red-300 border border-red-500/30">
            Alert
          </span>
        </div>

        {/* Center: Truncated Message Line */}
        <div className="flex-1 overflow-hidden min-w-0">
          <div 
            onClick={onOpenUpdates}
            className="cursor-pointer truncate hover:text-emerald-300 transition-colors font-medium text-slate-200"
            title="Click to view full AIAPGET 2026 counselling updates"
          >
            <span className="truncate">{tickerItems[currentIndex]}</span>
          </div>
        </div>

        {/* Right Actions: Live Feed Button & Dismiss */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenUpdates}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-semibold text-emerald-300 transition-colors cursor-pointer whitespace-nowrap min-h-[30px]"
          >
            <span>Live Feed ({feed.updates?.length || 0})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss Alert Ticker"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
