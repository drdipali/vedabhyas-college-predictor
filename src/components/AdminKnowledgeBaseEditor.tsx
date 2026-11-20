import React, { useState } from 'react';
import { 
  BookOpen, 
  Save, 
  RotateCcw, 
  Download, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  ShieldAlert,
  Building,
  HelpCircle,
  Clock
} from 'lucide-react';
import { 
  getStoredKnowledgeBase, 
  saveKnowledgeBase, 
  resetKnowledgeBaseToDefault,
  type CounsellingKnowledgeBase,
  type GeneralFAQKB
} from '../lib/knowledgeBase';

export const AdminKnowledgeBaseEditor: React.FC = () => {
  const [kb, setKb] = useState<CounsellingKnowledgeBase>(() => getStoredKnowledgeBase());
  const [activeSubTab, setActiveSubTab] = useState<'aaccc' | 'states' | 'faqs'>('aaccc');
  const [selectedStateKey, setSelectedStateKey] = useState<string>('Maharashtra');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  // States list in KB
  const stateKeys = Object.keys(kb.states || {}).sort();

  const handleSave = () => {
    const ok = saveKnowledgeBase(kb);
    if (ok) {
      setSaveSuccess('Knowledge base saved successfully! AI Counselor is now using these guidelines.');
      setTimeout(() => setSaveSuccess(null), 4000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the entire Knowledge Base back to default official guidelines? Any custom edits will be reverted.')) {
      const def = resetKnowledgeBaseToDefault();
      setKb({ ...def });
      setSaveSuccess('Knowledge base reset to official default values.');
      setTimeout(() => setSaveSuccess(null), 4000);
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(kb, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `counselling_knowledge_base_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleStateChange = (field: string, value: string) => {
    setKb(prev => ({
      ...prev,
      states: {
        ...prev.states,
        [selectedStateKey]: {
          ...prev.states[selectedStateKey],
          [field]: value
        }
      }
    }));
  };

  const handleAacccChange = (path: string[], value: string) => {
    setKb(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let cur = next.aaccc_central;
      for (let i = 0; i < path.length - 1; i++) {
        cur = cur[path[i]];
      }
      cur[path[path.length - 1]] = value;
      return next;
    });
  };

  const handleAddFaq = () => {
    const newFaq: GeneralFAQKB = {
      id: `faq-custom-${Date.now()}`,
      topic: 'General Counselling',
      question: 'New AIAPGET Counselling Question',
      answer: 'Detailed official answer with guidelines and precautions.'
    };
    setKb(prev => ({
      ...prev,
      general_faqs: [newFaq, ...prev.general_faqs]
    }));
    setEditingFaqId(newFaq.id);
  };

  const handleDeleteFaq = (id: string) => {
    if (window.confirm('Delete this FAQ from the AI counselor knowledge base?')) {
      setKb(prev => ({
        ...prev,
        general_faqs: prev.general_faqs.filter(f => f.id !== id)
      }));
    }
  };

  const currentState = kb.states[selectedStateKey] || {
    authority_name: '',
    official_portal: '',
    domicile_eligibility: '',
    quota_types: '',
    security_deposit: '',
    free_exit_and_forfeiture: '',
    upgradation_rules: '',
    bond_policy: '',
    last_verified_date: ''
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <BookOpen className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
              AI Counselor Knowledge Base & Rule Editor
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
              v{kb.version || '2.0.0'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Edit AACCC central exit/forfeiture rules, circular notices, and 13 state counselling guidelines. The AI Counselor references these rules live to advise students without hallucinating.
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>Last Synced: {new Date(kb.last_updated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            title="Download JSON to commit to repository"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export JSON</span>
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-300 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
            title="Revert to bundled default guidelines"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Live Knowledge Base</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Sub Tabs Selector */}
      <div className="flex border-b border-white/10 gap-2 pb-px overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('aaccc')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'aaccc'
              ? 'border-blue-400 text-blue-400 bg-blue-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Module A: AACCC Central Rules</span>
        </button>

        <button
          onClick={() => setActiveSubTab('states')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'states'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Module B: State Guidelines ({stateKeys.length} States)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('faqs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'faqs'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Module C: Counselling FAQs ({kb.general_faqs?.length || 0})</span>
        </button>
      </div>

      {/* MODULE A: AACCC CENTRAL */}
      {activeSubTab === 'aaccc' && (
        <div className="space-y-6">
          {/* Latest Circular 2026 */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Official AACCC 2026 Circular & Schedule (Delhi High Court Order)
              </h4>
              <span className="text-[11px] text-slate-400">Used for Latest Notice Q&A</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Circular Date</label>
                <input
                  type="text"
                  value={kb.aaccc_central.latest_official_circular_2026.date}
                  onChange={(e) => handleAacccChange(['latest_official_circular_2026', 'date'], e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  value={kb.aaccc_central.latest_official_circular_2026.subject}
                  onChange={(e) => handleAacccChange(['latest_official_circular_2026', 'subject'], e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Circular Details & Directions</label>
                <textarea
                  rows={3}
                  value={kb.aaccc_central.latest_official_circular_2026.details}
                  onChange={(e) => handleAacccChange(['latest_official_circular_2026', 'details'], e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Key Schedule Dates</label>
                <input
                  type="text"
                  value={kb.aaccc_central.latest_official_circular_2026.schedule}
                  onChange={(e) => handleAacccChange(['latest_official_circular_2026', 'schedule'], e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Fees & Security Deposit */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Registration Fees & Security Deposit
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-3">
                <div className="text-xs font-semibold text-emerald-300">AIQ Govt & Central Institutes</div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Non-Refundable Fee</label>
                  <input
                    type="text"
                    value={kb.aaccc_central.fees_and_security_deposit.aiq_govt_central_national.non_refundable_registration_fee}
                    onChange={(e) => handleAacccChange(['fees_and_security_deposit', 'aiq_govt_central_national', 'non_refundable_registration_fee'], e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Refundable Security Deposit</label>
                  <input
                    type="text"
                    value={kb.aaccc_central.fees_and_security_deposit.aiq_govt_central_national.refundable_security_deposit}
                    onChange={(e) => handleAacccChange(['fees_and_security_deposit', 'aiq_govt_central_national', 'refundable_security_deposit'], e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-3">
                <div className="text-xs font-semibold text-purple-300">Deemed Universities</div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Non-Refundable Fee</label>
                  <input
                    type="text"
                    value={kb.aaccc_central.fees_and_security_deposit.deemed_universities.non_refundable_registration_fee}
                    onChange={(e) => handleAacccChange(['fees_and_security_deposit', 'deemed_universities', 'non_refundable_registration_fee'], e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Refundable Security Deposit</label>
                  <input
                    type="text"
                    value={kb.aaccc_central.fees_and_security_deposit.deemed_universities.refundable_security_deposit}
                    onChange={(e) => handleAacccChange(['fees_and_security_deposit', 'deemed_universities', 'refundable_security_deposit'], e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Strict Refund Policy & Cyber Café Warning</label>
                <textarea
                  rows={2}
                  value={kb.aaccc_central.fees_and_security_deposit.refund_rule}
                  onChange={(e) => handleAacccChange(['fees_and_security_deposit', 'refund_rule'], e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Round Exit & Forfeiture Rules */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Round-by-Round Exit, Forfeiture & Debarment Rules
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Round 1 Rule (Free Exit)</label>
                <textarea
                  rows={2}
                  value={kb.aaccc_central.exit_and_forfeiture_rules.round_1}
                  onChange={(e) => handleAacccChange(['exit_and_forfeiture_rules', 'round_1'], e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Round 2 Rule (No Free Exit)</label>
                <textarea
                  rows={2}
                  value={kb.aaccc_central.exit_and_forfeiture_rules.round_2}
                  onChange={(e) => handleAacccChange(['exit_and_forfeiture_rules', 'round_2'], e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Round 3 Rule (Mandatory Joining)</label>
                <textarea
                  rows={2}
                  value={kb.aaccc_central.exit_and_forfeiture_rules.round_3}
                  onChange={(e) => handleAacccChange(['exit_and_forfeiture_rules', 'round_3'], e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Stray Vacancy Round (SVR)</label>
                <textarea
                  rows={2}
                  value={kb.aaccc_central.exit_and_forfeiture_rules.stray_vacancy_round}
                  onChange={(e) => handleAacccChange(['exit_and_forfeiture_rules', 'stray_vacancy_round'], e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Seat Conversion Algorithm (Round 3)</label>
                <textarea
                  rows={2}
                  value={kb.aaccc_central.seat_conversion_algorithm}
                  onChange={(e) => handleAacccChange(['seat_conversion_algorithm'], e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE B: STATE GUIDELINES */}
      {activeSubTab === 'states' && (
        <div className="space-y-6">
          {/* State Selector Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-xs font-semibold text-slate-400 mr-1">Select State:</span>
            {stateKeys.map((state) => (
              <button
                key={state}
                onClick={() => setSelectedStateKey(state)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedStateKey === state
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {state}
              </button>
            ))}
          </div>

          {/* Selected State Form */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  {selectedStateKey} AYUSH PG Counselling Guidelines
                </h4>
                <p className="text-xs text-slate-400">Authority: {currentState.authority_name || 'Official State Authority'}</p>
              </div>

              {currentState.official_portal && (
                <a
                  href={currentState.official_portal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs hover:bg-blue-500/30 transition-colors w-fit"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Portal</span>
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Authority Name</label>
                <input
                  type="text"
                  value={currentState.authority_name}
                  onChange={(e) => handleStateChange('authority_name', e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Official Portal URL</label>
                <input
                  type="text"
                  value={currentState.official_portal}
                  onChange={(e) => handleStateChange('official_portal', e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Domicile & Eligibility Criteria</label>
                <textarea
                  rows={2}
                  value={currentState.domicile_eligibility}
                  onChange={(e) => handleStateChange('domicile_eligibility', e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Quota Types Covered</label>
                <input
                  type="text"
                  value={currentState.quota_types}
                  onChange={(e) => handleStateChange('quota_types', e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Security Deposit</label>
                <input
                  type="text"
                  value={currentState.security_deposit}
                  onChange={(e) => handleStateChange('security_deposit', e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Free Exit & Forfeiture Policy</label>
                <textarea
                  rows={2}
                  value={currentState.free_exit_and_forfeiture}
                  onChange={(e) => handleStateChange('free_exit_and_forfeiture', e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Upgradation Rules</label>
                <textarea
                  rows={2}
                  value={currentState.upgradation_rules}
                  onChange={(e) => handleStateChange('upgradation_rules', e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Mandatory Service Bond & Penalty Policy</label>
                <textarea
                  rows={2}
                  value={currentState.bond_policy}
                  onChange={(e) => handleStateChange('bond_policy', e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Last Verified / Reference Date</label>
                <input
                  type="text"
                  value={currentState.last_verified_date}
                  onChange={(e) => handleStateChange('last_verified_date', e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE C: COUNSELLING FAQS */}
      {activeSubTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Universal AIAPGET Counselling FAQs ({kb.general_faqs?.length || 0})</span>
            </h4>

            <button
              onClick={handleAddFaq}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New FAQ</span>
            </button>
          </div>

          <div className="space-y-3">
            {(kb.general_faqs || []).map((faq) => {
              const isEditing = editingFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 transition-colors hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                          {faq.topic}
                        </span>
                        <span className="text-[10px] text-slate-500">ID: {faq.id}</span>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2 mt-2">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const val = e.target.value;
                              setKb(prev => ({
                                ...prev,
                                general_faqs: prev.general_faqs.map(f => f.id === faq.id ? { ...f, question: val } : f)
                              }));
                            }}
                            className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                            placeholder="Question"
                          />
                          <textarea
                            rows={3}
                            value={faq.answer}
                            onChange={(e) => {
                              const val = e.target.value;
                              setKb(prev => ({
                                ...prev,
                                general_faqs: prev.general_faqs.map(f => f.id === faq.id ? { ...f, answer: val } : f)
                              }));
                            }}
                            className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                            placeholder="Answer"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-white mb-1">
                            {faq.question}
                          </div>
                          <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingFaqId(isEditing ? null : faq.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 transition-colors cursor-pointer"
                      >
                        {isEditing ? 'Done' : 'Edit'}
                      </button>

                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
  );
};
