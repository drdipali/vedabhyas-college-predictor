import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  RotateCcw, 
  ExternalLink, 
  MessageCircle, 
  Edit3, 
  Check, 
  X, 
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  fetchAllSubmissions, 
  updateSubmissionStatus, 
  publishApprovedCollegeLive 
} from '../lib/supabase';
import type { CollegeSubmission } from '../types';

interface CollegeApprovalsDashboardProps {
  onCollegePublished?: () => void;
}

export const CollegeApprovalsDashboard: React.FC<CollegeApprovalsDashboardProps> = ({
  onCollegePublished,
}) => {
  const [submissions, setSubmissions] = useState<CollegeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');

  // Edit / Refine Modal State
  const [editingSub, setEditingSub] = useState<CollegeSubmission | null>(null);
  const [editCollegeName, setEditCollegeName] = useState('');
  const [editAnnualFee, setEditAnnualFee] = useState('');
  const [editMonthlyStipend, setEditMonthlyStipend] = useState('');
  const [editNcismCode, setEditNcismCode] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Reject Modal State
  const [rejectingSub, setRejectingSub] = useState<CollegeSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState('Verification call unsuccessful / details could not be confirmed.');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    const data = await fetchAllSubmissions();
    setSubmissions(data);
    setLoading(false);
  };

  // ---------------------------------------------------------------------------
  // APPROVE & PUBLISH LIVE
  // ---------------------------------------------------------------------------
  const handleApprove = async (sub: CollegeSubmission) => {
    const confirmed = window.confirm(
      `Approve and publish "${sub.college_name}" live to AIAPGET candidates?\n\nThis will mark the college with "✓ Verified by College" and publish official fees & stipends.`
    );
    if (!confirmed) return;

    // 1. Update submission status in database
    await updateSubmissionStatus(sub.id, 'approved', 'Verified and approved by faculty.');

    // 2. Publish to live colleges database
    await publishApprovedCollegeLive(sub);

    // 3. Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    // 4. Reload submissions
    await loadSubmissions();

    if (onCollegePublished) onCollegePublished();
  };

  // ---------------------------------------------------------------------------
  // REJECT SUBMISSION
  // ---------------------------------------------------------------------------
  const handleConfirmReject = async () => {
    if (!rejectingSub) return;
    await updateSubmissionStatus(rejectingSub.id, 'rejected', rejectReason);
    setRejectingSub(null);
    setRejectReason('Verification call unsuccessful / details could not be confirmed.');
    await loadSubmissions();
  };

  // ---------------------------------------------------------------------------
  // EDIT SUBMISSION
  // ---------------------------------------------------------------------------
  const handleOpenEdit = (sub: CollegeSubmission) => {
    setEditingSub(sub);
    setEditCollegeName(sub.college_name);
    setEditAnnualFee(sub.annual_fee || '');
    setEditMonthlyStipend(sub.monthly_stipend || '');
    setEditNcismCode(sub.ncism_code || '');
    setEditAdminNotes(sub.admin_notes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    setSavingEdit(true);

    await updateSubmissionStatus(
      editingSub.id,
      editingSub.status,
      editAdminNotes,
      {
        college_name: editCollegeName.trim(),
        annual_fee: editAnnualFee.trim() || undefined,
        monthly_stipend: editMonthlyStipend.trim() || undefined,
        ncism_code: editNcismCode.trim() || undefined,
      }
    );

    setSavingEdit(false);
    setEditingSub(null);
    await loadSubmissions();
  };

  // ---------------------------------------------------------------------------
  // METRICS & FILTERING
  // ---------------------------------------------------------------------------
  const metrics = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter((s) => s.status === 'pending').length;
    const approved = submissions.filter((s) => s.status === 'approved').length;
    const rejected = submissions.filter((s) => s.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [submissions]);

  const states = useMemo(() => {
    const list = Array.from(new Set(submissions.map((s) => s.state)));
    return ['All', ...list.sort()];
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesState = selectedState === 'All' || s.state === selectedState;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        s.college_name.toLowerCase().includes(query) ||
        s.contact_person_name.toLowerCase().includes(query) ||
        s.contact_phone.includes(query) ||
        s.official_email.toLowerCase().includes(query);
      return matchesStatus && matchesState && matchesSearch;
    });
  }, [submissions, statusFilter, selectedState, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Metrics Highlights Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-slate-900/60">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Total Submissions</span>
          </span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {metrics.total}
          </div>
          <span className="text-[10px] text-slate-400">Institutional applications</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 bg-amber-500/5">
          <span className="text-[11px] text-amber-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Verification</span>
          </span>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            {metrics.pending}
          </div>
          <span className="text-[10px] text-amber-400">Calls scheduled for faculty</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-500/5">
          <span className="text-[11px] text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Approved & Published</span>
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
            {metrics.approved}
          </div>
          <span className="text-[10px] text-emerald-400">Live on candidate predictor</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-rose-500/20 bg-rose-500/5">
          <span className="text-[11px] text-rose-300 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Rejected / Revised</span>
          </span>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
            {metrics.rejected}
          </div>
          <span className="text-[10px] text-slate-400">Unconfirmed details</span>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search college, contact person, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl glass-input text-white placeholder-slate-500"
          />
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/10"
          >
            {states.map((st) => (
              <option key={st} value={st}>State: {st}</option>
            ))}
          </select>
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              statusFilter === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            All ({metrics.total})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Pending ({metrics.pending})</span>
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
              statusFilter === 'approved'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved ({metrics.approved})</span>
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              statusFilter === 'rejected'
                ? 'bg-rose-500 text-white font-bold'
                : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
            }`}
          >
            Rejected ({metrics.rejected})
          </button>

          <button
            onClick={loadSubmissions}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
            title="Refresh submissions"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Submissions Cards List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Loading college submissions...</span>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-white/10">
          <Building2 className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h4 className="text-base font-bold text-white mb-1">No Submissions Found</h4>
          <p className="text-xs text-slate-400">
            {statusFilter === 'pending'
              ? 'All college submissions have been processed! No pending calls.'
              : 'Try clearing your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => {
            const isPending = sub.status === 'pending';
            const isApproved = sub.status === 'approved';
            const isRejected = sub.status === 'rejected';

            const whatsappUrl = `https://wa.me/91${sub.contact_phone}?text=Hello%20Dr.%20${encodeURIComponent(
              sub.contact_person_name
            )},%20this%20is%20Ayush%20Gurukulam%20following%20up%20on%20your%20data%20submission%20for%20${encodeURIComponent(
              sub.college_name
            )}%20on%20Vedabhyas%20College%20Predictor.`;

            return (
              <div
                key={sub.id}
                className={`p-5 rounded-3xl glass-panel border transition-all ${
                  isPending
                    ? 'border-amber-500/30 bg-amber-500/[0.02]'
                    : isApproved
                    ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                
                {/* Header Strip */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {sub.college_type}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 text-slate-300 border border-white/10">
                        {sub.quota_type}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {sub.state}
                      </span>
                      {sub.ncism_code && (
                        <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          NCISM: {sub.ncism_code}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white font-['Outfit']">
                      {sub.college_name}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Call Scheduled (Pending)</span>
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Live & Verified ✓</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Rejected</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 text-xs">
                  
                  {/* Col 1: Mandatory Phone Verification Box */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                      📞 Verification Contact (Call Directly)
                    </span>
                    <div>
                      <div className="text-white font-bold text-sm">
                        {sub.contact_person_name}
                      </div>
                      <div className="text-slate-300 text-[11px]">
                        {sub.designation}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:+91${sub.contact_phone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call +91 {sub.contact_phone}</span>
                      </a>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                      </a>
                    </div>

                    <div className="text-[11px] text-slate-300 flex items-center gap-1 truncate pt-0.5">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <a href={`mailto:${sub.official_email}`} className="hover:text-amber-300 truncate">
                        {sub.official_email}
                      </a>
                    </div>
                  </div>

                  {/* Col 2: Financials & Affiliation Proof */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      💰 Financials & Documentation
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Annual Fee:</span>
                        <span className="font-bold font-mono text-white text-xs">
                          {sub.annual_fee || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Monthly Stipend:</span>
                        <span className="font-bold font-mono text-emerald-400 text-xs">
                          {sub.monthly_stipend || 'Not specified'}
                        </span>
                      </div>
                    </div>

                    {sub.proof_url ? (
                      <div className="pt-1.5 border-t border-white/5">
                        <span className="text-slate-400 block text-[10px] mb-0.5">Proof / Seat Matrix:</span>
                        <a
                          href={sub.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px] font-semibold truncate"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{sub.proof_url}</span>
                        </a>
                      </div>
                    ) : (
                      <div className="pt-1 text-[11px] text-slate-500 italic">
                        No external proof URL attached.
                      </div>
                    )}
                  </div>

                  {/* Col 3: Departments & Audit Log */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      🏥 MD/MS Departments ({sub.departments.length})
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar">
                      {sub.departments.map((dept) => (
                        <span
                          key={dept}
                          className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-200"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                    {sub.admin_notes && (
                      <div className="pt-1 text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg">
                        <strong>Faculty Note:</strong> {sub.admin_notes}
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer Action Bar */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] text-slate-400">
                    Ref ID: <code className="font-mono text-slate-300">{sub.id}</code> • Submitted:{' '}
                    {new Date(sub.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(sub)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Edit & Refine</span>
                    </button>

                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => setRejectingSub(sub)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(sub)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Publish Live</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Visible to candidates with Verified Badge</span>
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Edit & Refine Modal */}
      {editingSub && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/80 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg p-6 rounded-3xl glass-panel border border-white/20 bg-[#0c1220] shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold font-['Outfit']">
                Edit & Refine College Submission
              </h4>
              <button
                onClick={() => setEditingSub(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">College Name</label>
                <input
                  type="text"
                  required
                  value={editCollegeName}
                  onChange={(e) => setEditCollegeName(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">NCISM Code</label>
                  <input
                    type="text"
                    value={editNcismCode}
                    onChange={(e) => setEditNcismCode(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Annual Fee</label>
                  <input
                    type="text"
                    value={editAnnualFee}
                    onChange={(e) => setEditAnnualFee(e.target.value)}
                    placeholder="e.g. ₹2,50,000 / year"
                    className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Monthly PG Stipend</label>
                <input
                  type="text"
                  value={editMonthlyStipend}
                  onChange={(e) => setEditMonthlyStipend(e.target.value)}
                  placeholder="e.g. ₹55,000 / month"
                  className="w-full h-10 px-3 text-sm rounded-xl glass-input text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Faculty Verification Notes</label>
                <textarea
                  rows={2}
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  placeholder="Spoke with Dr. Sharma, confirmed 4 seats in Kayachikitsa..."
                  className="w-full p-2.5 text-xs rounded-xl glass-input text-white placeholder-slate-500"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  {savingEdit ? 'Saving...' : 'Save Refinements'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingSub && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/80 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md p-6 rounded-3xl glass-panel border border-rose-500/30 bg-[#0c1220] shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-base font-bold text-rose-300 mb-2">
              Reject College Submission
            </h4>
            <p className="text-xs text-slate-300 mb-3">
              Provide a reason for rejecting the submission for <strong>{rejectingSub.college_name}</strong>:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 text-xs rounded-xl glass-input text-white mb-4"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRejectingSub(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
