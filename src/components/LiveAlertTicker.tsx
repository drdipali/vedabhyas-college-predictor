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
        "🔴 AACCC PG Round 2 Registration & Choice Locking Active",
        "🔴 Maharashtra State CET Cell AYUSH PG CAP Round 1 Allotment Published",
        "🔴 UP AYUSH PG 2026 State Quota Merit List Released"
      ];

  // Auto rotate ticker message every 5.5 seconds
  useEffect(() => {
    if (tickerItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickerItems.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [tickerItems.length]);

  if (isDismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-red-950/90 via-slate-900/95 to-amber-950/90 border-b border-red-500/30 backdrop-blur-md text-white text-xs py-2 px-3 sm:px-6 relative z-30 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left Badge: Live Status */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-extrabold text-[10px] tracking-wider uppercase border border-red-500/30">
            Live Alert
          </span>
        </div>

        {/* Center: Dynamic Cycling Ticker Message */}
        <div className="flex-1 overflow-hidden min-w-0">
          <div 
            onClick={onOpenUpdates}
            className="cursor-pointer truncate hover:text-emerald-300 transition-colors font-medium flex items-center gap-2"
            title="Click to view full AIAPGET 2026 counselling updates"
          >
            <span className="truncate">{tickerItems[currentIndex]}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenUpdates}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-semibold text-emerald-300 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            <span>Live Feed ({feed.updates?.length || 0})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss Alert Ticker"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
