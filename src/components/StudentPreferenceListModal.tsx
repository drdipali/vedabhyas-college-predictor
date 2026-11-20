import React, { useState, useEffect } from 'react';
import { 
  ListOrdered, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Printer, 
  Download, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Share2
} from 'lucide-react';
import { 
  fetchStudentPreferences, 
  updatePreferenceOrder, 
  removeStudentPreference 
} from '../lib/supabase';
import type { StudentProfile, StudentPreference } from '../types';

interface StudentPreferenceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: StudentProfile | null;
  onOpenAddMissing: () => void;
  onOpenAuth?: () => void;
  onPreferencesUpdated?: () => void;
}

export const StudentPreferenceListModal: React.FC<StudentPreferenceListModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onOpenAddMissing,
  onOpenAuth,
  onPreferencesUpdated,
}) => {
  const [preferences, setPreferences] = useState<StudentPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedNotice, setCopiedNotice] = useState(false);

  useEffect(() => {
    if (isOpen && currentStudent) {
      loadPreferences();
    }
  }, [isOpen, currentStudent]);

  const loadPreferences = async () => {
    if (!currentStudent) return;
    setLoading(true);
    const list = await fetchStudentPreferences(currentStudent.id);
    setPreferences(list);
    setLoading(false);
  };

  if (!isOpen) return null;

  // Move priority up (index to index - 1)
  const handleMoveUp = async (index: number) => {
    if (index === 0 || !currentStudent) return;
    const updated = [...preferences];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;

    // renumber priorities
    updated.forEach((p, idx) => {
      p.priority_order = idx + 1;
    });

    setPreferences(updated);
    await updatePreferenceOrder(currentStudent.id, updated.map((p) => p.id));
    if (onPreferencesUpdated) onPreferencesUpdated();
  };

  // Move priority down (index to index + 1)
  const handleMoveDown = async (index: number) => {
    if (index === preferences.length - 1 || !currentStudent) return;
    const updated = [...preferences];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;

    // renumber priorities
    updated.forEach((p, idx) => {
      p.priority_order = idx + 1;
    });

    setPreferences(updated);
    await updatePreferenceOrder(currentStudent.id, updated.map((p) => p.id));
    if (onPreferencesUpdated) onPreferencesUpdated();
  };

  // Remove item
  const handleRemove = async (prefId: string) => {
    if (!currentStudent) return;
    const updated = preferences.filter((p) => p.id !== prefId);
    updated.forEach((p, idx) => {
      p.priority_order = idx + 1;
    });
    setPreferences(updated);
    await removeStudentPreference(currentStudent.id, prefId);
    if (onPreferencesUpdated) onPreferencesUpdated();
  };

  // Export / Print formatted choice list
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!currentStudent || preferences.length === 0) return;
    const headers = ['Choice #', 'College Code', 'College Name', 'State', 'Quota', 'Branch', 'Status', 'Notes'];
    const rows = preferences.map((p) => [
      p.priority_order,
      `"${p.college_code || ''}"`,
      `"${(p.college_name || '').replace(/"/g, '""')}"`,
      `"${p.state || ''}"`,
      `"${p.quota_type || ''}"`,
      `"${p.branch}"`,
      `"${p.is_verified ? 'Verified AACCC/State' : 'Pending Crowdsourced Verification'}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `vedabhyas_aiapget_preference_list_${currentStudent.fullName.replace(/\s+/g, '_')}_AIR_${currentStudent.aiapgetRank}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyFormattedText = () => {
    if (!currentStudent || preferences.length === 0) return;
    let text = `====================================================\n`;
    text += `VEDABHYAS AIAPGET 2026 OFFICIAL CHOICE-FILLING LIST\n`;
    text += `Candidate: ${currentStudent.fullName} | AIR #${currentStudent.aiapgetRank} (${currentStudent.category})\n`;
    text += `State: ${currentStudent.bamsState} | Date: ${new Date().toLocaleDateString()}\n`;
    text += `====================================================\n\n`;

    preferences.forEach((p) => {
      text += `Preference #${p.priority_order}:\n`;
      text += `  • College: ${p.college_name} [${p.college_code || 'CODE'}]\n`;
      text += `  • Branch: ${p.branch} (${p.quota_type || 'State'})\n`;
      text += `  • Status: ${p.is_verified ? '✓ Verified in AACCC Portal' : '⏳ Pending Crowdsourced Verification'}\n\n`;
    });

    text += `Generated on Vedabhyas College Predictor (https://drdipali.github.io/vedabhyas-college-predictor/)`;

    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xl bg-black/85 animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl my-6 rounded-3xl glass-panel border border-white/20 p-5 sm:p-8 bg-[#090d16]/98 shadow-2xl text-white max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-white/10 shrink-0 pr-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <ListOrdered className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  Counselling Choice Filling
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {preferences.length} Choices Added
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
                My Counselling Preference List
              </h2>
              {currentStudent && (
                <p className="text-xs text-slate-300 mt-0.5">
                  Candidate: <strong className="text-white">{currentStudent.fullName}</strong> •{' '}
                  <span className="text-emerald-400 font-mono font-bold">AIR #{currentStudent.aiapgetRank}</span> •{' '}
                  {currentStudent.category} Category
                </p>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddMissing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors cursor-pointer min-h-[44px]"
              title="Add a college not yet in the predictor"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Missing College</span>
            </button>

            {preferences.length > 0 && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer min-h-[44px]"
                  title="Export choice list to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>

                <button
                  onClick={handleCopyFormattedText}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer min-h-[44px]"
                  title="Copy formatted choice order for AACCC portal"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedNotice ? '✓ Copied!' : 'Copy'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer min-h-[44px]"
                  title="Print official preference sheet"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sheet</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar space-y-3">
          
          {!currentStudent ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-white/10 space-y-3 my-4">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Student Sign In Required</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Please log in or register with your AIAPGET rank to save, prioritize, and print your choice list.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs hover:bg-emerald-300 cursor-pointer"
              >
                Sign In to Save Choices
              </button>
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <span className="inline-block animate-spin mr-2">⏳</span> Loading your preference list...
            </div>
          ) : preferences.length === 0 ? (
            /* Empty State */
            <div className="p-8 sm:p-12 text-center rounded-2xl bg-slate-900/50 border border-dashed border-white/15 space-y-4 my-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <ListOrdered className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Your Preference List is Empty
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Start building your personalized choice-filling order. Click <span className="text-emerald-400 font-semibold">+ Add to Preference List</span> on any college card in the predictor, or add a missing state college below.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer min-h-[44px]"
                >
                  Explore Predictor Colleges
                </button>
                <button
                  onClick={onOpenAddMissing}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
                >
                  + Add Missing College
                </button>
              </div>
            </div>
          ) : (
            /* Ordered Preference Cards */
            <div className="space-y-2.5">
              {preferences.map((pref, idx) => (
                <div
                  key={pref.id}
                  className="p-3.5 sm:p-4 rounded-2xl glass-card border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  {/* Left Priority Badge & Details */}
                  <div className="flex items-start gap-3 min-w-0">
                    
                    {/* Priority Badge */}
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-white/20 text-emerald-400 font-mono font-extrabold text-sm shrink-0 shadow-inner">
                      <span>#{pref.priority_order}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white truncate max-w-md font-['Outfit']">
                          {pref.college_name}
                        </h4>

                        {/* Status Badge: Verified vs Crowdsourced */}
                        {pref.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0" title="Crowdsourced by students, pending Super Admin approval">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Pending Admin Approval</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                        <span className="font-semibold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                          {pref.branch}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">{pref.state}</span>
                        <span>•</span>
                        <span className="text-slate-400">{pref.college_type}</span>
                        <span>•</span>
                        <span className="text-slate-400">{pref.quota_type}</span>
                        {pref.college_code && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[11px] text-slate-400">Code: {pref.college_code}</span>
                          </>
                        )}
                      </div>

                      {pref.notes && (
                        <p className="text-[11px] text-slate-400 mt-1 italic">
                          Note: {pref.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Up / Down / Remove */}
                  <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    
                    {/* Up Button */}
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Move up in priority"
                      aria-label="Move preference up"
                    >
                      <ArrowUp className="w-4 h-4 text-emerald-400" />
                    </button>

                    {/* Down Button */}
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === preferences.length - 1}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Move down in priority"
                      aria-label="Move preference down"
                    >
                      <ArrowDown className="w-4 h-4 text-teal-400" />
                    </button>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(pref.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/25 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Remove from preference list"
                      aria-label="Remove preference"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            💡 <strong>Pro Tip:</strong> Reorder your choices by priority. When AACCC choice locking opens, follow this exact list for Round 1 & Round 2.
          </p>
          <button
            onClick={onOpenAddMissing}
            className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold cursor-pointer shrink-0"
          >
            + Can't find a college? Add it here
          </button>
        </div>

      </div>
    </div>
  );
};
