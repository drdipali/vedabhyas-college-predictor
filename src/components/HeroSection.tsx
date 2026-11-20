import React from 'react';
import { ShieldCheck, Building2, MapPin } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-6 pb-6 sm:pt-10 sm:pb-8 text-center overflow-hidden">
      {/* Refined subtle ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[260px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sanskrit Shloka Pill: Subtle & Responsive */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium mb-4 shadow-sm">
          <span className="text-amber-400 font-serif">ॐ</span>
          <span className="tracking-wide italic opacity-90 truncate max-w-[280px] sm:max-w-none">
            "आयुः कामयमानेन धर्मार्थसुखसाधनम् | आयुर्वेदोपदेशेषु विधेयः परमादरः ||"
          </span>
        </div>

        {/* Main Headline */}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 font-['Outfit'] leading-[1.2]">
          Vedabhyas{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            College Predictor
          </span>
        </h2>

        {/* Subtitle Description */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-light mb-6">
          AI counseling companion for <span className="font-semibold text-white">BAMS graduates</span>.
          Evaluate your admission chances across India's premier <span className="text-emerald-400 font-medium">Government</span>,{' '}
          <span className="text-slate-200 font-medium">Private</span>, and <span className="text-teal-300 font-medium">Deemed Ayurvedic Institutions</span>.
        </p>

        {/* 3 Clean Verified Trust Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-slate-300">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-emerald-500/20 shadow-sm backdrop-blur-sm">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>50+ Colleges</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-teal-500/20 shadow-sm backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>22 States</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-purple-500/20 shadow-sm backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>AACCC Reference Cutoffs</span>
          </div>
        </div>

      </div>
    </section>
  );
};
