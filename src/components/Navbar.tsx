import React, { useState } from 'react';
import type { StudentProfile } from '../types';
import { Sparkles, BookOpen, ExternalLink, Menu, X, User, LogOut } from 'lucide-react';

interface NavbarProps {
  onOpenGuide: () => void;
  onOpenAuth: () => void;
  currentStudent: StudentProfile | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenGuide, 
  onOpenAuth, 
  currentStudent,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#07090e]/80 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5 group cursor-pointer">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 border border-white/20 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/logo.jpg" 
                alt="Vedabhyas Logo" 
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute -inset-1 rounded-2xl bg-emerald-400/20 blur-sm -z-10 group-hover:bg-emerald-400/40 transition-colors"></div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-[0.26em] font-bold text-emerald-400">
                  Ayush Gurukulam
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Official
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5 font-['Outfit']">
                Vedabhyas
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 font-semibold">
                  College Predictor
                </span>
              </h1>
            </div>
          </div>

          {/* Center Badges / Live Counseling Status */}
          <div className="hidden xl:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-white/10 text-xs font-medium text-slate-300 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>AACCC AIAPGET Session 2024–25</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Govt • Private • Deemed</span>
            </div>
          </div>

          {/* Right Navigation Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            
            {/* Student Auth / Profile Button */}
            {currentStudent ? (
              <div className="flex items-center gap-1.5 p-1 pl-3 pr-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <button
                  onClick={onOpenAuth}
                  className="font-semibold text-emerald-300 hover:underline cursor-pointer"
                  title="Click to update your BAMS college & preparation data"
                >
                  {currentStudent.fullName.split(' ')[0]} (AIR #{currentStudent.aiapgetRank})
                </button>
                <button
                  onClick={onLogout}
                  className="p-1 rounded-lg hover:bg-emerald-500/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:opacity-95 shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Student Login</span>
              </button>
            )}

            {/* Counseling Roadmap */}
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Roadmap</span>
            </button>

            {/* AACCC Portal Link */}
            <a
              href="https://aaccc.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            >
              <span>AACCC</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#07090e]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3">
          
          {currentStudent ? (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">{currentStudent.fullName}</span>
                <span className="text-[10px] text-emerald-300">AIR #{currentStudent.aiapgetRank} • {currentStudent.bamsCollege}</span>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-rose-400 underline font-semibold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300"
            >
              <User className="w-4 h-4" />
              <span>Student Sign In / Register</span>
            </button>
          )}

          <button
            onClick={() => {
              onOpenGuide();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-white/5 border border-white/10"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Counseling Roadmap & Documents</span>
          </button>

          <a
            href="https://aaccc.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-white/5 border border-white/10"
          >
            <span>Visit Official AACCC Portal</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </header>
  );
};
