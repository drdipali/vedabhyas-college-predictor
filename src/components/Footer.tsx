import React from 'react';
import { Heart, BookOpen, ExternalLink, Lock } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

interface FooterProps {
  onOpenGuide: () => void;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGuide, onOpenAdminLogin }) => {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#06080d]/90 backdrop-blur-xl relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border border-white/20 bg-slate-900 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                <img src={logoImg} alt="Vedabhyas" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-emerald-400">
                  Ayush Gurukulam
                </span>
                <h4 className="text-lg font-bold text-white font-['Outfit']">
                  Vedabhyas College Predictor
                </h4>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Empowering BAMS doctors and Ayurveda scholars across Bharat with spatial data intelligence, clear closing cutoffs, stipends, and fee structures for Government, Private, and Deemed colleges.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400">
              <span className="text-amber-300 font-serif">सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <h5 className="text-xs uppercase tracking-wider font-semibold text-slate-300">
              Counseling Portals
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <a
                  href="https://aaccc.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <span>AACCC Central Counseling</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://aiapget.nta.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <span>NTA AIAPGET Official</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://ncismindia.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <span>NCISM Regulatory Body</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://ayush.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <span>Ministry of Ayush</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Technology & Principles */}
          <div className="md:col-span-3 space-y-2">
            <h5 className="text-xs uppercase tracking-wider font-semibold text-slate-300">
              Candidate Security & Roadmap
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Featuring 50+ top Government, Private, and Deemed colleges across 22 Indian states calibrated with official AACCC Round 3 allotment data.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={onOpenGuide}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Roadmap & Checklist</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar, Disclaimer & Discreet Admin Access */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Ayush Gurukulam • All Rights Reserved. Candidate data is encrypted and confidential.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-slate-400">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>for Ayurvedic Scholars</span>
            </div>

            {/* Clear Staff / Admin Portal Access Button */}
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-medium transition-all cursor-pointer shadow-sm"
              title="Restricted Faculty & Counselor Access (Passcode: ayushadmin)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Faculty Admin Portal</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};