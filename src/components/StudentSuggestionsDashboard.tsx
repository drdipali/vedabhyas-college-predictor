import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  Search, 
  RotateCcw, 
  Edit3, 
  Check, 
  X, 
  Users, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  fetchStudentSuggestions, 
  approveStudentSuggestion, 
  rejectStudentSuggestion 
} from '../lib/supabase';
import type { StudentCollegeSuggestion } from '../types';

interface StudentSuggestionsDashboardProps {
  onCollegePublished?: () => void;
}

export const StudentSuggestionsDashboard: React.FC<StudentSuggestionsDashboardProps> = ({
  onCollegePublished,
}) => {
  const [suggestions, setSuggestions] = useState<StudentCollegeSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');

  // Expanded payloads card state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit / Refine Modal State
  const [editingSug, setEditingSug] = useState<StudentCollegeSuggestion | null>(null);
  const [editCollegeName, setEditCollegeName] = useState('');
  const [editCollegeCode, setEditCollegeCode] = useState('');
  const [editState, setEditState] = useState('');
  const [editCollegeType, setEditCollegeType] = useState('Government');
  const [editQuotaType, setEditQuotaType] = useState('State Quota');
  const [editBranches, setEditBranches] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Reject Modal State
  const [rejectingSug, setRejectingSug] = useState<StudentCollegeSuggestion | null>(null);
  const [rejectReason, setRejectReason] = useState('Duplicate entry or college code not listed in NCISM directory.');

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    const data = await fetchStudentSuggestions();
    setSuggestions(data);
    setLoading(false);
  };

  // ---------------------------------------------------------------------------
  // APPROVE & PUBLISH LIVE
  // ---------------------------------------------------------------------------
  const handleApprove = async (sug: StudentCollegeSuggestion) => {
    const confirmed = window.confirm(
      `Approve and publish "${sug.college_name}" live to AIAPGET candidates?\n\nThis will insert the college into the live database and automatically link all ${sug.verification_count} student preference lists to the verified college!`
    );
    if (!confirmed) return;

    await approveStudentSuggestion(sug.id);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#38bdf8', '#f59e0b'],
      });
    } catch {}

    await loadSuggestions();
    if (onCollegePublished) onCollegePublished();
  };

  const handleOpenEditModal = (sug: StudentCollegeSuggestion) => {
    setEditingSug(sug);
    setEditCollegeName(sug.college_name);
    setEditCollegeCode(sug.college_code);
    setEditState(sug.state);
    setEditCollegeType(sug.college_type);
    setEditQuotaType(sug.quota_type);
    setEditBranches(sug.branches.join(', '));
  };

  const handleSaveEditAndApprove = async () => {
    if (!editingSug) return;
    setSavingEdit(true);

    const branchesList = editBranches
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    await approveStudentSuggestion(editingSug.id, {
      college_name: editCollegeName.trim(),
      college_code: editCollegeCode.trim().toUpperCase(),
      state: editState,
      college_type: editCollegeType,
      quota_type: editQuotaType,
      branches: branchesList,
    });

    setSavingEdit(false);
    setEditingSug(null);

    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    await loadSuggestions();
    if (onCollegePublished) onCollegePublished();
  };

  // ---------------------------------------------------------------------------
  // REJECT SUGGESTION
  // ---------------------------------------------------------------------------
  const handleConfirmReject = async () => {
    if (!rejectingSug) return;
    await rejectStudentSuggestion(rejectingSug.id, rejectReason);
    setRejectingSug(null);
    await loadSuggestions();
  };

  // States List
  const allStates = useMemo(() => {
    const s = Array.from(new Set(suggestions.map((item) => item.state)));
    return ['All', ...s.sort()];
  }, [suggestions]);

  // Filtered & Sorted Suggestions
  const filteredSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return suggestions
      .filter((sug) => {
        if (statusFilter !== 'all' && sug.status !== statusFilter) return false;
        if (selectedState !== 'All' && sug.state !== selectedState) return false;
        if (q) {
          const matchCode = sug.college_code.toLowerCase().includes(q);
          const matchName = sug.college_name.toLowerCase().includes(q);
          const matchState = sug.state.toLowerCase().includes(q);
          return matchCode || matchName || matchState;
        }
        return true;
      })
      .sort((a, b) => b.verification_count - a.verification_count);
  }, [suggestions, statusFilter, selectedState, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    return {
      total: suggestions.length,
      pending: suggestions.filter((s) => s.status === 'pending').length,
      approved: suggestions.filter((s) => s.status === 'approved').length,
      rejected: suggestions.filter((s) => s.status === 'rejected').length,
      totalStudentRequests: suggestions.reduce((sum, s) => sum + s.verification_count, 0),
    };
  }, [suggestions]);

  return (
    <div className="space-y-6">
      
      {/* Header Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass-card border border-amber-500/30 bg-amber-950/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-amber-300">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-['Outfit']">
            {counts.pending}
          </div>
          <span className="text-[10px] text-slate-400">Crowdsourced by students</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 bg-emerald-950/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-300">Published Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-['Outfit']">
            {counts.approved}
          </div>
          <span className="text-[10px] text-slate-400">Added to live database</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-teal-500/30 bg-teal-950/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-teal-300">Total Student Requests</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-['Outfit']">
            {counts.totalStudentRequests}
          </div>
          <span className="text-[10px] text-slate-400">Combined student votes</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 bg-slate-900/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-300">Total Unique Colleges</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-['Outfit']">
            {counts.total}
          </div>
          <span className="text-[10px] text-slate-400">Distinct college codes</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-card border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center rounded-xl bg-white/5 p-1 border border-white/10 w-full md:w-auto">
          {(['pending', 'all', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st} {st === 'pending' ? `(${counts.pending})` : ''}
            </button>
          ))}
        </div>

        {/* Search & State Filter */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code or college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-xl glass-input text-white placeholder-slate-500"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/10"
          >
            {allStates.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button
            onClick={loadSuggestions}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Refresh suggestions"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggestion Cards List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          <span className="inline-block animate-spin mr-2">⏳</span> Loading crowdsourced suggestions...
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-white/15">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
          <h4 className="text-base font-bold text-white">No College Suggestions Match Filter</h4>
          <p className="text-xs text-slate-400 mt-1">
            All student-suggested colleges have been reviewed, or no submissions match your search.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredSuggestions.map((sug) => {
            const isExpanded = expandedId === sug.id;
            return (
              <div
                key={sug.id}
                className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 hover:border-amber-500/30 transition-all space-y-3.5"
              >
                {/* Top Row: College Code, Name, Verification Count Badge, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {sug.college_code.slice(0, 4)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-white/10 text-emerald-300 border border-white/10">
                          {sug.college_code}
                        </span>

                        {/* Verification Count Badge */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>Verified by {sug.verification_count} students</span>
                        </span>

                        {/* Status */}
                        {sug.status === 'approved' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✓ Published Live
                          </span>
                        )}
                        {sug.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Rejected
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white font-['Outfit']">
                        {sug.college_name}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center gap-2">
                        <span>{sug.state}</span>
                        <span>•</span>
                        <span>{sug.college_type}</span>
                        <span>•</span>
                        <span>{sug.quota_type}</span>
                        <span>•</span>
                        <span className="text-emerald-400">
                          {sug.branches.length} Branches: {sug.branches.join(', ')}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {sug.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(sug)}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 min-h-[40px]"
                          title="Edit details before publishing"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setRejectingSug(sug)}
                          className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/25 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 min-h-[40px]"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => handleApprove(sug)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 min-h-[40px]"
                        >
                          <Check className="w-4 h-4 stroke-[2.5]" />
                          <span>Approve & Publish Live</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Inspect Student Submissions Accordion Toggle */}
                {sug.submitted_payloads && sug.submitted_payloads.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : sug.id)}
                      className="text-xs text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>
                        {isExpanded ? 'Hide' : 'Inspect'} Student Submissions ({sug.submitted_payloads.length} verified candidate records)
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs animate-fadeIn">
                        {sug.submitted_payloads.map((payload, pIdx) => (
                          <div
                            key={pIdx}
                            className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-white">{payload.student_name}</strong>
                                {payload.student_rank && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                                    AIR #{payload.student_rank}
                                  </span>
                                )}
                                <span className="text-slate-400 font-medium">Branch: {payload.branch || 'Kayachikitsa'}</span>
                              </div>
                              {payload.notes && (
                                <p className="text-[11px] text-slate-400 mt-1 italic">
                                  "{payload.notes}"
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {new Date(payload.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Edit & Approve Modal */}
      {editingSug && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/85 animate-fadeIn overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl glass-panel border border-white/20 p-6 bg-[#0b101c]/98 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Edit & Approve Suggested College
              </h3>
              <button
                onClick={() => setEditingSug(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  College Code (NCISM / State Code)
                </label>
                <input
                  type="text"
                  value={editCollegeCode}
                  onChange={(e) => setEditCollegeCode(e.target.value.toUpperCase())}
                  className="w-full h-10 px-3 text-xs font-mono uppercase rounded-xl glass-input text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Full College Name
                </label>
                <input
                  type="text"
                  value={editCollegeName}
                  onChange={(e) => setEditCollegeName(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl glass-input text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">State</label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded-xl glass-input text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Type</label>
                  <select
                    value={editCollegeType}
                    onChange={(e) => setEditCollegeType(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/10"
                  >
                    <option value="Government">Government</option>
                    <option value="Govt-Aided">Govt-Aided</option>
                    <option value="Private">Private</option>
                    <option value="Deemed">Deemed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Branches (comma-separated)
                </label>
                <input
                  type="text"
                  value={editBranches}
                  onChange={(e) => setEditBranches(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl glass-input text-white"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/10">
              <button
                onClick={() => setEditingSug(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditAndApprove}
                disabled={savingEdit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-md hover:opacity-95 cursor-pointer disabled:opacity-50"
              >
                {savingEdit ? 'Publishing...' : 'Save & Publish Live'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingSug && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/85 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl glass-panel border border-white/20 p-6 bg-[#0b101c]/98 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Reject Suggestion: {rejectingSug.college_code}
            </h3>
            <p className="text-xs text-slate-300">
              Provide a reason for rejecting this crowdsourced submission:
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-xl glass-input text-white"
            />
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setRejectingSug(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
