import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';

interface CounselingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CounselingGuide: React.FC<CounselingGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-xl bg-black/75 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl glass-panel border border-white/20 p-6 sm:p-8 bg-[#0c1220]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-label="Close counseling guide"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Ayush Admissions Central Counseling Committee (AACCC)</span>
          </div>
          <h3 id="guide-title" className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
            AIAPGET MD/MS Ayurveda Counseling Roadmap
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Complete step-by-step guidance for choice locking, round transitions, and mandatory document verification.
          </p>
        </div>

        {/* Counseling Rounds Stepper */}
        <div className="space-y-4 mb-8">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Counseling Stages & Round Progression
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">Round 1 (Free Exit)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                  Initial Round
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Register on aaccc.gov.in and fill choices. If allotted a seat, you can report and take admission or avail "Free Exit" without losing your security deposit.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">Round 2 (Exit with Forfeiture)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300">
                  Crucial Round
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Fresh choice filling is allowed. Candidates who did not get a seat in Round 1 or opted for willingness to upgrade participate here. Non-joining forfeits security deposit.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-400">Round 3 / Mop-Up Round</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300">
                  High Yield
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Unfilled AIQ seats from Round 2 revert here. Candidates not holding any seat across AIQ or State quota can participate for premier central seats.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-400">Stray Vacancy Round</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300">
                  Final Chance
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Conducted in online mode without fresh registration. Ten times the number of vacant seats are forwarded to participating deemed/central institutes.
              </p>
            </div>
          </div>
        </div>

        {/* Required Documents Checklist */}
        <div className="mb-8">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Essential Verification Documents (Checklist)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              'AIAPGET 2024 Admit Card & Official Scorecard',
              'BAMS Provisional / Degree Certificate',
              'BAMS 1st to 4th Professional Marksheets',
              'Compulsory Rotatory Internship Completion Certificate',
              'State Ayurvedic Council / CCIM / NCISM Permanent Registration',
              '10th & 12th Certificate for Proof of Date of Birth',
              'Valid Category Certificate (SC/ST/OBC-NCL/EWS in Central Format)',
              'Government Photo ID Proof (Aadhaar / Voter ID / Passport)',
            ].map((doc, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-200">{doc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Counseling Tips */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4" />
            <span>Vedabhyasa Choice Filling Strategy</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
            <li>Always place dream choices (AIIA, BHU, NIA) at top priority even if rank is slightly higher.</li>
            <li>Keep safe "High Chance" colleges in middle priority to ensure guaranteed seat retention.</li>
            <li>Double-check state quota eligibility rules if applying outside domicile state.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            Understood, Return to Predictor
          </button>
        </div>

      </div>
    </div>
  );
};
