import React, { useState } from 'react';
import type { StudentProfile } from '../types';
import { Sparkles, BookOpen, ExternalLink, Menu, X, User, LogOut, Lock, MessageCircle, BellRing, Building2 } from 'lucide-react';
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
  activeAlertCount = 12
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#07090e]/85 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 border border-white/20 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform duration-300 shrink-0">
              <BrandLogo 
                alt="Vedabhyas Logo" 
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute -inset-1 rounded-2xl bg-emerald-400/20 blur-sm -z-10 group-hover:bg-emerald-400/40 transition-colors"></div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-[0.26em] font-bold text-emerald-400">
                  AIAPGET 2026
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
            <button
              onClick={onOpenLiveAlerts}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-xs font-medium text-slate-300 shadow-inner cursor-pointer transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>AIAPGET 2026 Live Updates</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Govt • Private • Deemed</span>
            </div>
          </div>

          {/* Right Navigation Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            
            {/* Live AIAPGET 2026 Alerts Button */}
            <button
              onClick={onOpenLiveAlerts}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.25)] transition-all cursor-pointer relative"
              title="View Live AIAPGET 2026 Counselling Alerts & Portal Updates"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <BellRing className="w-3.5 h-3.5 text-rose-400" />
              <span>Live Alerts 2026</span>
              {activeAlertCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white font-mono">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {/* Direct WhatsApp Quick Help Button */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20bd5a] shadow-[0_0_15px_rgba(37,211,102,0.35)] transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              title="Quick Help on WhatsApp: 8208506052"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Help: {WHATSAPP_NUMBER}</span>
            </a>

            {/* Student Auth / Profile Button */}
            {currentStudent ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs text-white transition-all cursor-pointer group shadow-sm"
                  title="Click to view or update your BAMS college & preparation data"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-semibold text-emerald-300 group-hover:text-emerald-200">
                    {currentStudent.fullName.startsWith('Dr.') ? currentStudent.fullName : `Dr. ${currentStudent.fullName}`}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 font-mono text-[10px] font-bold">
                    AIR #{currentStudent.aiapgetRank}
                  </span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  title="Sign Out & Lock Predictor"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
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

            {/* For Colleges / Update Data Button */}
            <button
              onClick={onOpenCollegePortal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-indigo-300 hover:text-white bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 hover:border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all cursor-pointer"
              title="For AYUSH Colleges & Universities: Submit Official Fees, Stipends & Seat Matrix"
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>For Colleges / Update Data</span>
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer shadow-sm"
              title="Admin & Faculty Access"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>

          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenLiveAlerts}
              className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 relative"
              title="Live AIAPGET 2026 Alerts"
            >
              <BellRing className="w-4 h-4 text-rose-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#25D366] text-white"
              title="WhatsApp: 8208506052"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
            </a>
            <button
              onClick={onOpenAdminLogin}
              className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300"
              title="Staff Access"
            >
              <Lock className="w-4 h-4" />
            </button>
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
          
          {/* Mobile Live Alerts Button */}
          <button
            onClick={() => {
              onOpenLiveAlerts();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-200 bg-rose-500/20 border border-rose-500/40 shadow-sm"
          >
            <BellRing className="w-4 h-4 text-rose-400" />
            <span>🔴 Live AIAPGET 2026 Counselling Alerts ({activeAlertCount})</span>
          </button>
          
          {/* Mobile WhatsApp Quick Help */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#25D366]"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>WhatsApp Quick Help ({WHATSAPP_NUMBER})</span>
          </a>

          {currentStudent ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">
                    {currentStudent.fullName.startsWith('Dr.') ? currentStudent.fullName : `Dr. ${currentStudent.fullName}`}
                  </span>
                  <span className="text-xs text-emerald-300">
                    AIR #{currentStudent.aiapgetRank} • {currentStudent.bamsCollege}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold">
                  Active Session
                </span>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Session</span>
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

          <button
            onClick={() => {
              onOpenCollegePortal();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-200 bg-indigo-500/20 border border-indigo-500/40"
          >
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>For Colleges / Update Data</span>
          </button>

          <button
            onClick={() => {
              onOpenAdminLogin();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Admin & Faculty Portal</span>
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
