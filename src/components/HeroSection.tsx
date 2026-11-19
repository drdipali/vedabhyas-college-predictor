import React from 'react';
import { ShieldCheck, Banknote, Building2, MapPin } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-8 pb-8 sm:pt-14 sm:pb-12 text-center overflow-hidden">
      {/* Background Ambient Orbs (Antigravity Spatial Aesthetics) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-amber-500/15 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute top-0 right-1/4 w-[340px] h-[260px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Floating Logo & Sanskrit Shloka Badge */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative mb-4 group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden glass-panel p-1.5 border border-white/20 shadow-[0_0_35px_rgba(16,185,129,0.35)] animate-float">
              <img 
                src={logoImg} 
                alt="Vedabhyas Logo" 
                className="w-full h-full object-cover rounded-2xl" 
              />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-amber-500/20 rounded-3xl blur-md -z-10" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <span className="text-amber-400 font-serif">ॐ</span>
            <span className="tracking-wide italic opacity-95">
              "आयुः कामयमानेन धर्मार्थसुखसाधनम् | आयुर्वेदोपदेशेषु विधेयः परमादरः ||"
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 font-['Outfit'] leading-[1.15]">
          Vedabhyas{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 drop-shadow-sm">
            College Predictor
          </span>
        </h2>

        {/* Subtitle Description */}
        <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-light mb-8">
          The comprehensive AI counseling companion for <span className="font-semibold text-white">BAMS graduates</span>.
          Predict your admission chances across India's premier <span className="text-emerald-400 font-medium">Government</span>,{' '}
          <span className="text-amber-300 font-medium">Private</span>, and <span className="text-teal-300 font-medium">Deemed Ayurvedic Universities</span> across different states based on your AIAPGET rank, category, and state quota.
        </p>

        {/* Floating Feature Pills (Antigravity Weightless Layout) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 text-xs sm:text-sm text-slate-300">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-emerald-500/20 shadow-sm backdrop-blur-md">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Govt, Private & Deemed</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-teal-500/20 shadow-sm backdrop-blur-md">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>15+ States Across India</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-amber-500/20 shadow-sm backdrop-blur-md">
            <Banknote className="w-4 h-4 text-amber-400" />
            <span>₹38k – ₹1.12L/mo Stipends</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-purple-500/20 shadow-sm backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>AIQ 15%, State 85% & Mgt Quotas</span>
          </div>
        </div>

      </div>
    </section>
  );
};