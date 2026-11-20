import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Share2,
  Search,
  GripVertical,
  ChevronDown
} from 'lucide-react';
import { 
  fetchStudentPreferences, 
  updatePreferenceOrder, 
  removeStudentPreference,
  addStudentPreference,
  updateStudentPreferenceBranch
} from '../lib/supabase';
import { collegesData, COMMON_AYUSH_BRANCHES } from '../data/colleges';
import type { StudentProfile, StudentPreference, College } from '../types';

interface StudentPreferenceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: StudentProfile | null;
  liveColleges?: College[];
  onOpenAddMissing: (initialName?: string) => void;
  onOpenAuth?: () => void;
  onPreferencesUpdated?: () => void;
}

export const StudentPreferenceListModal: React.FC<StudentPreferenceListModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  liveColleges,
  onOpenAddMissing,
  onOpenAuth,
  onPreferencesUpdated,
}) => {
  const [preferences, setPreferences] = useState<StudentPreference[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Quick-Add state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('Kayachikitsa');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'warning' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  useEffect(() => {
    if (isOpen && currentStudent) {
      loadPreferences();
    }
  }, [isOpen, currentStudent]);

  // Click outside to close search auto-complete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPreferences = async () => {
    if (!currentStudent) return;
    setLoading(true);
    const list = await fetchStudentPreferences(currentStudent.id);
    setPreferences(list);
    setLoading(false);
  };

  // College pool from live colleges or bundled data
  const collegePool = useMemo(() => {
    return liveColleges && liveColleges.length > 0 ? liveColleges : collegesData;
  }, [liveColleges]);

  // Auto-complete filtered results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return collegePool
      .filter((c) => {
        const name = (c.name || '').toLowerCase();
        const code = (c.ncism_code || c.id || '').toLowerCase();
        const state = (c.state || '').toLowerCase();
        const city = (c.city || '').toLowerCase();
        return name.includes(q) || code.includes(q) || state.includes(q) || city.includes(q);
      })
      .slice(0, 10);
  }, [searchQuery, collegePool]);

  if (!isOpen) return null;

  // Add a choice from the Quick-Add Bar
  const handleAddChoice = async () => {
    if (!currentStudent) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!selectedCollege) {
      showToast('warning', 'Please select a college from the search dropdown first.');
      return;
    }

    // Check duplicate (same college code / id AND same branch)
    const isDuplicate = preferences.some((p) => {
      const matchId = p.college_id && selectedCollege.id && p.college_id === selectedCollege.id;
      const matchCode = p.college_code && selectedCollege.ncism_code && 
        p.college_code.trim().toUpperCase() === selectedCollege.ncism_code.trim().toUpperCase();
      const matchName = p.college_name && selectedCollege.name && 
        p.college_name.trim().toLowerCase() === selectedCollege.name.trim().toLowerCase();

      return (matchId || matchCode || matchName) && p.branch.trim().toLowerCase() === selectedBranch.trim().toLowerCase();
    });

    if (isDuplicate) {
      showToast(
        'warning', 
        `⚠️ Duplicate Choice: "${selectedCollege.shortName || selectedCollege.name}" for ${selectedBranch} is already in your preference list!`
      );
      return;
    }

    try {
      const collegeCode = selectedCollege.ncism_code || selectedCollege.id || 'AYU';
      const newPref = await addStudentPreference({
        user_id: currentStudent.id,
        college_id: selectedCollege.id,
        college_code: collegeCode.toUpperCase(),
        college_name: selectedCollege.name,
        state: selectedCollege.state,
        quota_type: selectedCollege.quota_type || selectedCollege.quota || 'State Quota',
        college_type: selectedCollege.institutionType || selectedCollege.college_type || 'Government',
        branch: selectedBranch,
        priority_order: preferences.length + 1,
        is_verified: true,
        notes: `Selected from live directory (${selectedCollege.quota_type || selectedCollege.quota || 'AIQ'})`
      });

      setPreferences((prev) => [...prev, newPref]);
      setSelectedCollege(null);
      setSearchQuery('');
      setIsSearchOpen(false);

      showToast('success', `✓ Added #${preferences.length + 1}: ${selectedCollege.shortName || selectedCollege.name} (${selectedBranch})`);
      if (onPreferencesUpdated) onPreferencesUpdated();
    } catch (err: any) {
      showToast('warning', err.message || 'Failed to add choice to preference list.');
    }
  };

  // Inline branch update
  const handleBranchChange = async (prefId: string, newBranch: string) => {
    if (!currentStudent) return;

    const targetPref = preferences.find((p) => p.id === prefId);
    if (!targetPref || targetPref.branch === newBranch) return;

    // Duplicate check for changed branch
    const isDuplicate = preferences.some(
      (p) =>
        p.id !== prefId &&
        ((p.college_id && targetPref.college_id && p.college_id === targetPref.college_id) ||
         (p.college_code && targetPref.college_code && p.college_code === targetPref.college_code)) &&
        p.branch.trim().toLowerCase() === newBranch.trim().toLowerCase()
    );

    if (isDuplicate) {
      showToast('warning', `⚠️ Duplicate Choice: A preference for this college with ${newBranch} already exists!`);
      return;
    }

    const updated = preferences.map((p) => (p.id === prefId ? { ...p, branch: newBranch } : p));
    setPreferences(updated);
    await updateStudentPreferenceBranch(currentStudent.id, prefId, newBranch);
    showToast('success', `✓ Branch changed to ${newBranch}`);
    if (onPreferencesUpdated) onPreferencesUpdated();
  };

  // Move priority up
  const handleMoveUp = async (index: number) => {
    if (index === 0 || !currentStudent) return;
    const updated = [...preferences];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;

    updated.forEach((p, idx) => {
      p.priority_order = idx + 1;
    });

    setPreferences(updated);
    await updatePreferenceOrder(currentStudent.id, updated.map((p) => p.id));
    if (onPreferencesUpdated) onPreferencesUpdated();
  };

  // Move priority down
  const handleMoveDown = async (index: number) => {
    if (index === preferences.length - 1 || !currentStudent) return;
    const updated = [...preferences];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;

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
    showToast('info', 'Choice removed from preference list.');
    if (onPreferencesUpdated) onPreferencesUpdated();
  };

  // Drag and Drop reordering handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex || !currentStudent) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...preferences];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    updated.forEach((p, idx) => {
      p.priority_order = idx + 1;
    });

    setPreferences(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);

    await updatePreferenceOrder(currentStudent.id, updated.map((p) => p.id));
    showToast('success', `✓ Moved to Choice #${targetIndex + 1}`);
    if (onPreferencesUpdated) onPreferencesUpdated();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Copy List to clipboard
  const handleCopyList = () => {
    if (!currentStudent || preferences.length === 0) return;
    let text = `VEDABHYAS AIAPGET 2026 OFFICIAL CHOICE-FILLING LIST\n`;
    text += `Candidate: ${currentStudent.fullName} | AIR #${currentStudent.aiapgetRank} (${currentStudent.category})\n`;
    text += `Total Choices: ${preferences.length}\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n`;
    text += `--------------------------------------------------------\n`;

    preferences.forEach((p) => {
      text += `#${p.priority_order} | Code: ${p.college_code || 'CODE'} | ${p.college_name}\n`;
      text += `     Branch: ${p.branch} | Quota: ${p.quota_type || 'State Quota'} | Status: ${p.is_verified ? 'Verified' : 'Pending Verification'}\n`;
    });

    text += `--------------------------------------------------------\n`;
    text += `Official AACCC Portal: https://aaccc.gov.in`;

    navigator.clipboard.writeText(text);
    showToast('success', '✓ Copied numbered choice list to clipboard!');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!currentStudent || preferences.length === 0) return;
    const headers = ['Priority', 'College Code', 'College Name', 'State', 'Quota', 'College Type', 'Branch', 'Verification Status', 'Notes'];
    const rows = preferences.map((p) => [
      p.priority_order,
      `"${p.college_code || ''}"`,
      `"${(p.college_name || '').replace(/"/g, '""')}"`,
      `"${p.state || ''}"`,
      `"${p.quota_type || ''}"`,
      `"${p.college_type || ''}"`,
      `"${p.branch}"`,
      `"${p.is_verified ? 'Verified in AACCC/State' : 'Pending Crowdsourced Verification'}"`,
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
    showToast('success', '✓ Downloaded preference list CSV');
  };

  // Print Sheet
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-xl bg-black/85 animate-fadeIn overflow-y-auto print:p-0 print:bg-white print:static"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Print-specific style definitions */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-preference-workspace, #print-preference-workspace * {
            visibility: visible;
          }
          #print-preference-workspace {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            color: black !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #cbd5e1 !important;
            padding: 8px !important;
            color: black !important;
            font-size: 11px !important;
          }
          .print-badge {
            border: 1px solid #334155 !important;
            color: black !important;
            background: none !important;
          }
        }
      `}</style>

      <div
        id="print-preference-workspace"
        className="relative w-full max-w-6xl my-4 sm:my-6 rounded-3xl border border-white/20 p-4 sm:p-6 md:p-8 bg-[#0B1120]/98 shadow-2xl text-white max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Toast Notification */}
        {toast && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 animate-fadeIn pointer-events-none">
            <div className={`px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold border backdrop-blur-xl ${
              toast.type === 'success' 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                : toast.type === 'warning'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                : 'bg-teal-500/20 border-teal-500/40 text-teal-200'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Modal Close Button (no-print) */}
        <button
          onClick={onClose}
          className="no-print absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center z-20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* =====================================================================
            1. HEADER & COMPACT ACTION BAR
           ===================================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10 shrink-0 pr-12 lg:pr-0">
          
          {/* Candidate & Workspace Title */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <ListOrdered className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  Ayurveda PG Counselling Workspace
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  [{preferences.length}] Choices Added
                </span>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-['Outfit'] text-white">
                My Counselling Preference List
              </h2>
              {currentStudent ? (
                <p className="text-xs text-slate-300 mt-0.5">
                  Candidate: <strong className="text-white">{currentStudent.fullName}</strong> •{' '}
                  <span className="text-emerald-400 font-mono font-bold">AIR #{currentStudent.aiapgetRank}</span> •{' '}
                  <span className="text-slate-300">{currentStudent.category} Category</span>
                  {currentStudent.bamsState && (
                    <span className="hidden sm:inline text-slate-400"> • Domicile: {currentStudent.bamsState}</span>
                  )}
                </p>
              ) : (
                <p className="text-xs text-amber-300 mt-0.5">
                  Guest preview mode. Sign in to save, reorder, and sync your choice list.
                </p>
              )}
            </div>
          </div>

          {/* 4 Compact Action Buttons (no-print) */}
          <div className="no-print flex flex-wrap items-center gap-2 shrink-0">
            {/* 1. + Missing College */}
            <button
              onClick={() => onOpenAddMissing()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors cursor-pointer min-h-[44px]"
              title="Add a college not yet in the system"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Missing College</span>
            </button>

            {/* 2. Copy List */}
            <button
              onClick={handleCopyList}
              disabled={preferences.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer min-h-[44px]"
              title="Copy numbered list with codes and branches to clipboard"
            >
              <Share2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Copy List</span>
            </button>

            {/* 3. Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={preferences.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer min-h-[44px]"
              title="Export formatted choice list to CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            {/* 4. Print Sheet */}
            <button
              onClick={handlePrint}
              disabled={preferences.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#10B981] hover:bg-[#0ea572] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer min-h-[44px] shadow-sm"
              title="Print official counselling choice sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
          </div>

        </div>

        {/* Scrollable Workspace Container */}
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar space-y-4">
          
          {/* =====================================================================
              2. LIVE PREFERENCE COLLEGE SEARCH & QUICK-ADD BAR (no-print)
             ===================================================================== */}
          <div className="no-print p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-white/10 shadow-lg">
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Search className="w-3.5 h-3.5" />
                <span>Search & Quick-Add Choice to List</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Search from 50+ Ayurveda colleges & NCISM codes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
              
              {/* College Search Autocomplete Input */}
              <div ref={searchContainerRef} className="relative md:col-span-6">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by college name, code (e.g. AIIA-01, AYU0014), or state..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                      if (selectedCollege && e.target.value !== selectedCollege.name) {
                        setSelectedCollege(null);
                      }
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    className="w-full h-11 pl-10 pr-9 text-xs sm:text-sm rounded-xl glass-input text-white placeholder-slate-500 focus:border-emerald-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCollege(null);
                        setIsSearchOpen(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Auto-complete Dropdown */}
                {isSearchOpen && searchQuery.trim().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-2xl bg-[#090d16] border border-white/20 shadow-2xl z-40 p-1.5 divide-y divide-white/5">
                    {searchResults.length > 0 ? (
                      searchResults.map((col) => (
                        <div
                          key={col.id}
                          onClick={() => {
                            setSelectedCollege(col);
                            setSearchQuery(col.name);
                            setIsSearchOpen(false);
                            if (col.topBranches && col.topBranches.length > 0) {
                              setSelectedBranch(col.topBranches[0]);
                            }
                          }}
                          className="p-2.5 rounded-xl hover:bg-emerald-500/10 cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-white truncate font-['Outfit']">
                              {col.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="font-mono text-emerald-400 uppercase font-bold">
                                {col.ncism_code || col.id}
                              </span>
                              <span>•</span>
                              <span>{col.state}</span>
                              <span>•</span>
                              <span className="text-slate-500">{col.quota_type || col.quota}</span>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 shrink-0 font-medium">
                            Select
                          </span>
                        </div>
                      ))
                    ) : (
                      /* No matches found: Show inline + Add Missing College */
                      <div className="p-3 text-center space-y-2">
                        <p className="text-xs text-slate-400">
                          No matching college found for <strong className="text-white">"{searchQuery}"</strong>
                        </p>
                        <button
                          onClick={() => {
                            setIsSearchOpen(false);
                            onOpenAddMissing(searchQuery);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Missing College "{searchQuery}"</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Branch Selector Dropdown */}
              <div className="md:col-span-4">
                <div className="relative">
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-xl glass-input text-white bg-slate-900 border border-white/15 focus:border-emerald-400 appearance-none pr-8 cursor-pointer"
                  >
                    {COMMON_AYUSH_BRANCHES.map((b) => (
                      <option key={b} value={b} className="bg-slate-900 text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* + Add Choice Button */}
              <div className="md:col-span-2">
                <button
                  onClick={handleAddChoice}
                  className="w-full h-11 px-4 rounded-xl bg-[#10B981] hover:bg-[#0ea572] text-slate-950 font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Choice</span>
                </button>
              </div>

            </div>

            {selectedCollege && (
              <div className="mt-2 text-[11px] text-emerald-300 flex items-center gap-2 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Selected: <strong>{selectedCollege.name}</strong> ({selectedCollege.ncism_code || selectedCollege.id})</span>
              </div>
            )}
          </div>

          {/* =====================================================================
              3. PROMINENT OFFICIAL VERIFICATION NOTE BANNER
             ===================================================================== */}
          <div className="rounded-2xl p-3.5 sm:p-4 bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-200/95 leading-relaxed font-medium">
              <span className="font-bold text-amber-300">Important Note:</span> Always double-check the exact College Code and Seat Matrix on the official AACCC (
              <a
                href="https://aaccc.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold text-amber-300 hover:text-white transition-colors"
              >
                https://aaccc.gov.in
              </a>
              ) or respective State Counselling website before locking your final choices.
            </div>
          </div>

          {/* =====================================================================
              4. STRUCTURED COLUMNAR PREFERENCE TABLE WITH DRAG-AND-SLIDE
             ===================================================================== */}
          {!currentStudent ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-white/10 space-y-3 my-4">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Student Sign In Required</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Please log in or register with your AIAPGET rank to prioritize, reorder, and save your counselling choices.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs hover:bg-emerald-300 cursor-pointer min-h-[44px]"
              >
                Sign In to Save Choices
              </button>
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <span className="inline-block animate-spin mr-2">⏳</span> Loading your preference choices...
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
                  Start building your personalized choice-filling order. Use the search bar above to quick-add choices, click <span className="text-emerald-400 font-semibold">+ Add to Preference List</span> on any predictor card, or submit a missing college.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#0ea572] text-slate-950 font-bold text-xs transition-colors cursor-pointer min-h-[44px]"
                >
                  Explore Predictor Colleges
                </button>
                <button
                  onClick={() => onOpenAddMissing()}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
                >
                  + Add Missing College
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              
              {/* DESKTOP 5-COLUMN TABLE (>= 768px) */}
              <div className="hidden md:block rounded-2xl border border-white/10 overflow-hidden bg-slate-900/40">
                <table className="w-full text-left border-collapse print-table">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4 text-center w-24">Priority</th>
                      <th className="py-3 px-4 text-center w-36">College Code</th>
                      <th className="py-3 px-4">College Name & Institution Details</th>
                      <th className="py-3 px-4 w-60">Target Branch</th>
                      <th className="py-3 px-4 text-center w-36 no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {preferences.map((pref, idx) => {
                      const isDragOver = dragOverIndex === idx;
                      const isDragged = draggedIndex === idx;

                      return (
                        <tr
                          key={pref.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={handleDragEnd}
                          className={`transition-all select-none ${
                            isDragged ? 'opacity-40 bg-slate-800/40' : 'hover:bg-white/[0.03]'
                          } ${
                            isDragOver ? 'bg-emerald-500/15 border-t-2 border-emerald-400' : ''
                          }`}
                        >
                          {/* 1. Priority: Grip Handle + #1 Badge */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span 
                                className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-emerald-400 p-1 no-print"
                                title="Click and drag to reorder priority"
                              >
                                <GripVertical className="w-4 h-4" />
                              </span>
                              <span className="w-8 h-8 rounded-lg bg-slate-900 border border-white/20 text-emerald-400 font-mono font-extrabold text-xs flex items-center justify-center shadow-inner">
                                #{pref.priority_order}
                              </span>
                            </div>
                          </td>

                          {/* 2. College Code */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/15 font-mono text-xs font-bold text-emerald-400 tracking-wider uppercase inline-block print-badge">
                              {pref.college_code || 'CODE'}
                            </span>
                          </td>

                          {/* 3. College Name + Status */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-bold text-white font-['Outfit']">
                                  {pref.college_name}
                                </h4>

                                {pref.is_verified ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Verified</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0" title="Pending Super Admin verification">
                                    <Clock className="w-3 h-3 text-amber-400" />
                                    <span>Pending Admin Verification</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                                <span>{pref.state}</span>
                                <span>•</span>
                                <span>{pref.college_type}</span>
                                <span>•</span>
                                <span>{pref.quota_type}</span>
                              </div>
                            </div>
                          </td>

                          {/* 4. Branch (Inline Select Dropdown) */}
                          <td className="py-3.5 px-4">
                            <div className="relative">
                              <select
                                value={pref.branch}
                                onChange={(e) => handleBranchChange(pref.id, e.target.value)}
                                className="w-full h-9 px-2.5 text-xs rounded-xl glass-input text-emerald-300 bg-slate-900 border border-emerald-500/30 focus:border-emerald-400 appearance-none pr-7 cursor-pointer font-medium"
                                title="Change branch choice without deleting row"
                              >
                                {COMMON_AYUSH_BRANCHES.map((b) => (
                                  <option key={b} value={b} className="bg-slate-900 text-white">
                                    {b}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            </div>
                          </td>

                          {/* 5. Actions (Up, Down, Delete) */}
                          <td className="py-3.5 px-4 text-center no-print">
                            <div className="flex items-center justify-center gap-1">
                              {/* Up Button */}
                              <button
                                onClick={() => handleMoveUp(idx)}
                                disabled={idx === 0}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                                title="Move up in priority"
                              >
                                <ArrowUp className="w-4 h-4 text-emerald-400" />
                              </button>

                              {/* Down Button */}
                              <button
                                onClick={() => handleMoveDown(idx)}
                                disabled={idx === preferences.length - 1}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                                title="Move down in priority"
                              >
                                <ArrowDown className="w-4 h-4 text-teal-400" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleRemove(pref.id)}
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/25 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ml-0.5"
                                title="Delete choice"
                              >
                                <Trash2 className="w-4 h-4 text-rose-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE RESPONSIVE STACKED CARDS (< 768px) */}
              <div className="md:hidden space-y-3">
                {preferences.map((pref, idx) => {
                  const isDragOver = dragOverIndex === idx;

                  return (
                    <div
                      key={pref.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`p-4 rounded-2xl glass-card border transition-all ${
                        isDragOver
                          ? 'border-emerald-400 bg-emerald-500/15'
                          : 'border-white/10 hover:border-emerald-500/30'
                      }`}
                    >
                      {/* Top Bar: Handle + Priority + Code + Status */}
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-emerald-400 p-1 no-print">
                            <GripVertical className="w-4 h-4" />
                          </span>
                          <span className="w-7 h-7 rounded-lg bg-slate-900 border border-white/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                            #{pref.priority_order}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-white/15 font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                            {pref.college_code || 'CODE'}
                          </span>
                        </div>

                        {pref.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Pending</span>
                          </span>
                        )}
                      </div>

                      {/* College Name & Meta */}
                      <h4 className="text-sm font-bold text-white mb-1 font-['Outfit']">
                        {pref.college_name}
                      </h4>
                      <p className="text-xs text-slate-400 mb-3">
                        {pref.state} • {pref.college_type} • {pref.quota_type}
                      </p>

                      {/* Branch Inline Select */}
                      <div className="mb-3">
                        <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                          Selected Branch:
                        </label>
                        <div className="relative">
                          <select
                            value={pref.branch}
                            onChange={(e) => handleBranchChange(pref.id, e.target.value)}
                            className="w-full h-11 px-3 text-xs rounded-xl glass-input text-emerald-300 bg-slate-900 border border-emerald-500/30 font-semibold appearance-none pr-8 cursor-pointer"
                          >
                            {COMMON_AYUSH_BRANCHES.map((b) => (
                              <option key={b} value={b} className="bg-slate-900 text-white">
                                {b}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Mobile Actions: Move Up / Down / Delete (min 44px) */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 no-print">
                        <span className="text-[11px] text-slate-400">
                          Priority Actions:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleMoveUp(idx)}
                            disabled={idx === 0}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-white/10"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4 text-emerald-400" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(idx)}
                            disabled={idx === preferences.length - 1}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-white/10"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4 text-teal-400" />
                          </button>
                          <button
                            onClick={() => handleRemove(pref.id)}
                            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-rose-500/25 ml-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-rose-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer (no-print) */}
        <div className="no-print mt-3 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>
            💡 <strong>Pro Tip:</strong> Click and drag rows with <GripVertical className="w-3.5 h-3.5 inline text-slate-400" /> or use Up/Down buttons to adjust order. Always verify the college code on the official portal before final locking.
          </p>
          <button
            onClick={() => onOpenAddMissing()}
            className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold cursor-pointer shrink-0"
          >
            + Can't find a college? Add it here
          </button>
        </div>

      </div>
    </div>
  );
};
