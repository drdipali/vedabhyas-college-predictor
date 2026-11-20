import React, { useState } from 'react';
import type { StudentProfile } from '../types';
import { BookOpen, ExternalLink, Menu, X, User, LogOut, Lock, MessageCircle, BellRing, Building2 } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onOpenGuide: () => void;
  onOpenAuth: () => void;
  onOpenAdminLogin: () => void;
  onOpenLiveAlerts: () => void;
  onOpenCollegePortal: () => void;
  currentStudent: StudentProfile | null;
  onLogout: () => void;
  activeAlertCount?: number;
}

const WHATSAPP_NUMBER = '8208506052';
const WHATSAPP_URL = `https://wa.me/91${WHATSAPP_NUMBER}?text=Hello%20Vedabhyas,%20I%20need%20quick%20help%20with%20AIAPGET%20College%20Predictor.`;

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenGuide, 
  onOpenAuth, 
  onOpenAdminLogin,
  onOpenLiveAlerts,
  onOpenCollegePortal,
  currentStudent,
  onLogout,
  activeAlertCount = 0
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0B1120]/90 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name: Compact single line with whitespace-nowrap */}
          <div 
            className="flex items-center gap-2.5 group cursor-pointer shrink-0 select-none" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-white/20 shadow-sm shrink-0">
              <BrandLogo 
                alt="Vedabhyas Logo" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Outfit']">
                Vedabhyas
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">
                Predictor
              </span>
            </div>
          </div>

          {/* Desktop Navigation: Exactly 3 clean items */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* 1. Roadmap */}
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Roadmap</span>
            </button>

            {/* 2. College Portal */}
            <button
              onClick={onOpenCollegePortal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>College Portal</span>
            </button>

            {/* 3. Primary Student Login */}
            {currentStudent ? (
              <div className="flex items-center gap-2 ml-1">
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs text-white transition-colors cursor-pointer shadow-sm"
                  title="View or update your profile"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-semibold text-emerald-300 max-w-[130px] truncate">
                    {currentStudent.fullName.startsWith('Dr.') ? currentStudent.fullName : `Dr. ${currentStudent.fullName}`}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-mono text-[10px] font-bold">
                    AIR #{currentStudent.aiapgetRank}
                  </span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-950 bg-[#10B981] hover:bg-[#0ea572] shadow-sm transition-all cursor-pointer ml-1"
              >
                <User className="w-4 h-4" />
                <span>Student Login</span>
              </button>
            )}

          </div>

          {/* Mobile Right Controls (< 768px): Logo + Login + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {currentStudent ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-300 min-h-[44px]"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-semibold max-w-[90px] truncate">
                  AIR #{currentStudent.aiapgetRank}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-slate-950 bg-[#10B981] hover:bg-[#0ea572] transition-colors min-h-[44px]"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Slide-down Drawer (< 768px) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0B1120]/98 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2.5 animate-fadeIn">
          
          {/* Active Student Card if logged in */}
          {currentStudent && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">
                  {currentStudent.fullName.startsWith('Dr.') ? currentStudent.fullName : `Dr. ${currentStudent.fullName}`}
                </span>
                <span className="text-xs text-emerald-300">
                  AIR #{currentStudent.aiapgetRank} • {currentStudent.bamsCollege}
                </span>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-semibold min-h-[44px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Roadmap */}
          <button
            onClick={() => {
              onOpenGuide();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 min-h-[44px]"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Counseling Roadmap</span>
            </div>
          </button>

          {/* College Portal */}
          <button
            onClick={() => {
              onOpenCollegePortal();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 min-h-[44px]"
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>College Administrator Portal</span>
            </div>
          </button>

          {/* Live Alerts */}
          <button
            onClick={() => {
              onOpenLiveAlerts();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 min-h-[44px]"
          >
            <div className="flex items-center gap-2.5">
              <BellRing className="w-4 h-4 text-rose-400" />
              <span>Live Counselling Alerts</span>
            </div>
            {activeAlertCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {activeAlertCount}
              </span>
            )}
          </button>

          {/* WhatsApp Support */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#25D366]/20 border border-[#25D366]/40 min-h-[44px]"
          >
            <div className="flex items-center gap-2.5">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Support ({WHATSAPP_NUMBER})</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          {/* Admin Access */}
          <button
            onClick={() => {
              onOpenAdminLogin();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-amber-300/90 bg-amber-500/10 border border-amber-500/20 min-h-[44px]"
          >
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Super Admin Portal</span>
            </div>
          </button>

          {/* AACCC Link */}
          <a
            href="https://aaccc.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 min-h-[44px]"
          >
            <span>Official AACCC Portal (aaccc.gov.in)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

        </div>
      )}
    </header>
  );
};
