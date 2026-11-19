import React, { useState, useMemo } from 'react';
import type { StudentProfile, Category, PreparationMethod } from '../types';
import { getStoredStudents, saveStudentProfile } from '../data/mockStudents';
import { 
  Users, 
  Search, 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  TrendingUp, 
  FileSpreadsheet, 
  RotateCcw,
  UserPlus,
  Plus,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrandLogo } from './BrandLogo';
import { CollegeApprovalsDashboard } from './CollegeApprovalsDashboard';

interface AdminPortalProps {
  onBackToPredictor: () => void;
}

const PREPARATION_METHODS: PreparationMethod[] = [
  'Self-Study & Standard Samhitas',
  'Ayush Gurukulam Coaching',
  'External Coaching Institute',
  'Online Test Series & Q-Bank',
  'Combined Group Study & Mentorship'
];

const SPECIALTIES = [
  'Kayachikitsa (Internal Medicine)',
  'Shalya Tantra (Surgery)',
  'Panchakarma (Detoxification & Purification)',
  'Prasuti Tantra & Stri Roga (Obstetrics & Gynecology)',
  'Kaumarbhritya (Pediatrics)',
  'Dravyaguna Vigyana (Pharmacology & Herbology)',
  'Shalakya Tantra (ENT & Ophthalmology)',
  'Rasa Shastra & Bhaishajya Kalpana (Pharmaceutics)',
  'Roga Nidana (Pathology & Diagnostics)',
  'Agada Tantra (Toxicology & Forensic Medicine)',
  'Swasthavritta (Preventive & Social Medicine)',
  'Samhita & Siddhanta (Basic Principles)'
];

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToPredictor }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'students' | 'colleges'>('colleges');
  const [students, setStudents] = useState<StudentProfile[]>(() => getStoredStudents());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedPrepMethod, setSelectedPrepMethod] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  // Manual Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCollege, setNewCollege] = useState('');
  const [newState, setNewState] = useState('Maharashtra');
  const [newPassingYear, setNewPassingYear] = useState<number>(2024);
  const [newScore, setNewScore] = useState('70%');
  const [newRank, setNewRank] = useState<number | ''>(320);
  const [newCategory, setNewCategory] = useState<Category>('General');
  const [newPrepMethod, setNewPrepMethod] = useState<PreparationMethod>('Ayush Gurukulam Coaching');
  const [newDailyHours, setNewDailyHours] = useState<number>(7);
  const [newDuration, setNewDuration] = useState<number>(12);
  const [newSpecialty, setNewSpecialty] = useState('Kayachikitsa (Internal Medicine)');
  const [newAssistance, setNewAssistance] = useState(true);

  const handleRefresh = () => {
    setStudents(getStoredStudents());
  };

  // Add new candidate manually
  const handleAddNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newMobile || !newEmail || !newCollege || !newRank) return;

    const newProfile: StudentProfile = {
      id: `std-${Date.now()}`,
      fullName: newFullName.trim(),
      email: newEmail.trim().toLowerCase(),
      mobileNumber: newMobile.trim(),
      bamsCollege: newCollege.trim(),
      bamsState: newState,
      passingYear: Number(newPassingYear),
      bamsScore: newScore.trim(),
      aiapgetRank: Number(newRank),
      category: newCategory,
      prepMethod: newPrepMethod,
      dailyStudyHours: Number(newDailyHours),
      prepDurationMonths: Number(newDuration),
      targetSpecialty: newSpecialty,
      counselingAssistanceRequired: newAssistance,
      registeredAt: new Date().toISOString(),
    };

    saveStudentProfile(newProfile);
    setStudents((prev) => [newProfile, ...prev]);
    setIsAddModalOpen(false);

    // Reset form
    setNewFullName('');
    setNewMobile('');
    setNewEmail('');
    setNewCollege('');

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b'],
      });
    } catch (e) {
      // ignore
    }
  };

  // States list from registered students
  const studentStates = useMemo(() => {
    const states = Array.from(new Set(students.map((s) => s.bamsState)));
    return states.sort();
  }, [students]);

  // Analytics Metrics
  const analytics = useMemo(() => {
    const total = students.length;
    if (total === 0) {
      return { total: 0, avgRank: 0, topSpecialty: 'N/A', assistanceReq: 0, topPrep: 'N/A' };
    }

    const avgRank = Math.round(students.reduce((acc, s) => acc + s.aiapgetRank, 0) / total);
    const assistanceReq = students.filter((s) => s.counselingAssistanceRequired).length;

    // Tally specialties
    const specCounts: Record<string, number> = {};
    students.forEach((s) => {
      const sp = s.targetSpecialty.split('(')[0].trim();
      specCounts[sp] = (specCounts[sp] || 0) + 1;
    });
    const topSpecialty = Object.entries(specCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Kayachikitsa';

    // Tally prep methods
    const prepCounts: Record<string, number> = {};
    students.forEach((s) => {
      prepCounts[s.prepMethod] = (prepCounts[s.prepMethod] || 0) + 1;
    });
    const topPrep = Object.entries(prepCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Ayush Gurukulam Coaching';

    return { total, avgRank, topSpecialty, assistanceReq, topPrep };
  }, [students]);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return students.filter((student) => {
      if (selectedState !== 'All' && student.bamsState !== selectedState) {
        return false;
      }
      if (selectedPrepMethod !== 'All' && student.prepMethod !== selectedPrepMethod) {
        return false;
      }
      if (q) {
        const matchName = student.fullName.toLowerCase().includes(q);
        const matchEmail = student.email.toLowerCase().includes(q);
        const matchPhone = student.mobileNumber.toLowerCase().includes(q);
        const matchCollege = student.bamsCollege.toLowerCase().includes(q);
        const matchSpecialty = student.targetSpecialty.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchCollege && !matchSpecialty) {
          return false;
        }
      }
      return true;
    });
  }, [students, searchQuery, selectedState, selectedPrepMethod]);

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = [
      'Student ID',
      'Full Name',
      'Mobile Number',
      'Email ID',
      'BAMS College',
      'State',
      'Passing Year',
      'BAMS Score',
      'AIAPGET AIR',
      'Category',
      'Preparation Method',
      'Daily Study Hours',
      'Prep Duration (Months)',
      'Target Specialty',
      'Counseling Mentorship Requested',
      'Registration Date'
    ];

    const rows = filteredStudents.map((s) => [
      `"${s.id}"`,
      `"${s.fullName}"`,
      `"${s.mobileNumber}"`,
      `"${s.email}"`,
      `"${s.bamsCollege.replace(/"/g, '""')}"`,
      `"${s.bamsState}"`,
      s.passingYear,
      `"${s.bamsScore}"`,
      s.aiapgetRank,
      `"${s.category}"`,
      `"${s.prepMethod}"`,
      s.dailyStudyHours,
      s.prepDurationMonths,
      `"${s.targetSpecialty.replace(/"/g, '""')}"`,
      s.counselingAssistanceRequired ? 'Yes' : 'No',
      `"${s.registeredAt}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vedabhyas_student_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0a0f1d]/90 border-b border-white/10 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPredictor}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to Predictor</span>
            </button>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20 bg-slate-900 shrink-0">
                <BrandLogo alt="Vedabhyas" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit'] flex items-center gap-1.5">
                  Ayush Gurukulam
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Admin Portal
                  </span>
                </h2>
                <span className="text-[11px] text-slate-400">
                  {activeAdminTab === 'colleges'
                    ? 'College Administrator Submissions & Live Approval Workflow (Supabase)'
                    : 'Registered BAMS Student Directory & Live Lead Database'}
                </span>
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center rounded-2xl bg-white/5 p-1 border border-white/10">
            <button
              onClick={() => setActiveAdminTab('colleges')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'colleges'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>College Approvals</span>
            </button>
            <button
              onClick={() => setActiveAdminTab('students')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'students'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Leads ({students.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {activeAdminTab === 'students' && (
              <>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:opacity-95 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Candidate</span>
                </button>

                <button
                  onClick={handleRefresh}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Refresh list"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Export ({filteredStudents.length})</span>
                </button>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        {activeAdminTab === 'colleges' ? (
          <CollegeApprovalsDashboard />
        ) : (
          <>
            {/* Analytics Highlights Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
          
          <div className="p-4 rounded-2xl glass-panel border border-white/10">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Registered Leads</span>
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {analytics.total}
            </div>
            <span className="text-[10px] text-emerald-400">Real-time candidate records</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-white/10">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
              <span>Average AIAPGET AIR</span>
            </span>
            <div className="text-2xl font-bold font-mono text-teal-300 mt-1">
              #{analytics.avgRank}
            </div>
            <span className="text-[10px] text-slate-400">Range: AIR #95 to #2100+</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-white/10">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Desired Specialty</span>
            </span>
            <div className="text-sm font-bold text-amber-300 mt-1.5 truncate">
              {analytics.topSpecialty}
            </div>
            <span className="text-[10px] text-slate-400">Most preferred MD/MS branch</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-white/10">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Leading Prep Mode</span>
            </span>
            <div className="text-xs font-bold text-purple-300 mt-1.5 truncate">
              {analytics.topPrep}
            </div>
            <span className="text-[10px] text-slate-400">Study strategy distribution</span>
          </div>

          <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl glass-panel border border-white/10">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Counseling Mentorship</span>
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {analytics.assistanceReq} <span className="text-xs font-normal text-slate-400">Students</span>
            </div>
            <span className="text-[10px] text-slate-400">Requested 1-on-1 assistance</span>
          </div>

        </div>

        {/* Filter & Search Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Doctor's Name, Mobile, Email, College..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-3 text-xs sm:text-sm rounded-xl glass-input text-white placeholder-slate-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* State filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="h-11 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
            >
              <option value="All">All States ({studentStates.length})</option>
              {studentStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Prep Method Filter */}
            <select
              value={selectedPrepMethod}
              onChange={(e) => setSelectedPrepMethod(e.target.value)}
              className="h-11 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer max-w-[200px]"
            >
              <option value="All">All Preparation Modes</option>
              <option value="Ayush Gurukulam Coaching">Ayush Gurukulam</option>
              <option value="Self-Study & Standard Samhitas">Self-Study</option>
              <option value="Online Test Series & Q-Bank">Online Test Series</option>
              <option value="External Coaching Institute">External Coaching</option>
              <option value="Combined Group Study & Mentorship">Group Study</option>
            </select>
          </div>

        </div>

        {/* Student Records Table */}
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Contact (Mobile & Email)</th>
                  <th className="py-3.5 px-4">AIAPGET AIR</th>
                  <th className="py-3.5 px-4">UG BAMS College</th>
                  <th className="py-3.5 px-4">Preparation Mode</th>
                  <th className="py-3.5 px-4">Target Specialty</th>
                  <th className="py-3.5 px-4 text-center">Mentorship</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No student records match your query. Click "Add Candidate Lead" to add one!
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudent(student)}
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                            {student.fullName.charAt(3) || 'D'}
                          </div>
                          <div>
                            <span className="block font-['Outfit'] font-bold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors">
                              {student.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              BAMS ({student.passingYear}) • {student.bamsScore}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <a
                            href={`tel:${student.mobileNumber}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-300 font-mono"
                          >
                            <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{student.mobileNumber}</span>
                          </a>
                          <a
                            href={`mailto:${student.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-teal-300 truncate max-w-[180px]"
                          >
                            <Mail className="w-3 h-3 text-teal-400 shrink-0" />
                            <span>{student.email}</span>
                          </a>
                        </div>
                      </td>

                      {/* Rank & Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            AIR #{student.aiapgetRank}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-slate-300 font-semibold">
                            {student.category}
                          </span>
                        </div>
                      </td>

                      {/* College */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <span className="block font-medium text-slate-200 truncate" title={student.bamsCollege}>
                          {student.bamsCollege}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-teal-400" />
                          <span>{student.bamsState}</span>
                        </span>
                      </td>

                      {/* Prep Mode */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300">
                          {student.prepMethod}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {student.dailyStudyHours} hrs/day • {student.prepDurationMonths} mos
                        </span>
                      </td>

                      {/* Target Specialty */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-amber-300 text-xs">
                          {student.targetSpecialty.split('(')[0]}
                        </span>
                      </td>

                      {/* Mentorship Requested */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {student.counselingAssistanceRequired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Requested</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Self Counseling</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(student);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 text-xs font-medium border border-white/10 transition-colors"
                        >
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}
  </main>

      {/* Manual Add Candidate Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-xl bg-black/80 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl glass-panel border border-white/20 p-6 sm:p-8 bg-[#0b101c]/95 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Add Real-Time Candidate Record
                </h3>
                <span className="text-xs text-slate-400">Enter walk-in or phone counseling inquiry lead</span>
              </div>
            </div>

            <form onSubmit={handleAddNewStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Candidate Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Varun Nair"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl glass-input text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    required
                    className="w-full h-10 px-3 font-mono rounded-xl glass-input text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Email ID *</label>
                  <input
                    type="email"
                    placeholder="varun@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl glass-input text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Undergraduate BAMS College *</label>
                <input
                  type="text"
                  placeholder="e.g. Govt Ayurveda College, Tripunithura"
                  value={newCollege}
                  onChange={(e) => setNewCollege(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl glass-input text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">College State</label>
                  <select
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl glass-input text-white bg-slate-900 border border-white/15"
                  >
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">AIAPGET AIR *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="320"
                    value={newRank}
                    onChange={(e) => setNewRank(e.target.value ? Number(e.target.value) : '')}
                    required
                    className="w-full h-10 px-3 font-mono font-bold text-emerald-400 rounded-xl glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Category)}
                    className="w-full h-10 px-2 rounded-xl glass-input text-white bg-slate-900 border border-white/15"
                  >
                    {(['General', 'OBC', 'SC', 'ST', 'EWS'] as Category[]).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Passing Year & Score</label>
                  <div className="grid grid-cols-2 gap-1">
                    <select
                      value={newPassingYear}
                      onChange={(e) => setNewPassingYear(Number(e.target.value))}
                      className="h-10 px-1 rounded-xl glass-input text-white bg-slate-900"
                    >
                      {[2024, 2023, 2022, 2021].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                      className="h-10 px-2 text-center rounded-xl glass-input text-white"
                      placeholder="70%"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Daily Study Hours</label>
                  <select
                    value={newDailyHours}
                    onChange={(e) => setNewDailyHours(Number(e.target.value))}
                    className="w-full h-10 px-2 rounded-xl glass-input text-white bg-slate-900 border border-white/15"
                  >
                    {[4, 5, 6, 7, 8, 9, 10, 12].map((h) => (
                      <option key={h} value={h}>{h} hrs/day</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Prep Duration</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full h-10 px-2 rounded-xl glass-input text-white bg-slate-900 border border-white/15"
                  >
                    {[3, 6, 9, 12, 18, 24].map((d) => (
                      <option key={d} value={d}>{d} months</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Exam Preparation Method</label>
                <select
                  value={newPrepMethod}
                  onChange={(e) => setNewPrepMethod(e.target.value as PreparationMethod)}
                  className="w-full h-10 px-2 rounded-xl glass-input text-white bg-slate-900 border border-white/15"
                >
                  {PREPARATION_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Target Specialty</label>
                <select
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  className="w-full h-10 px-2 rounded-xl glass-input text-white bg-slate-900 border border-white/15"
                >
                  {SPECIALTIES.map((sp) => (
                    <option key={sp} value={sp}>{sp}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="lead-assist"
                  checked={newAssistance}
                  onChange={(e) => setNewAssistance(e.target.checked)}
                  className="rounded text-emerald-400"
                />
                <label htmlFor="lead-assist" className="text-slate-300">
                  Mark as requesting Choice-Locking Mentorship
                </label>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold"
                >
                  Save Lead to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Dossier Detail Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-xl bg-black/80 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="relative w-full max-w-xl rounded-3xl glass-panel border border-white/20 p-6 sm:p-8 bg-[#0b101c]/95 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl">
                {selectedStudent.fullName.charAt(3) || 'D'}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Verified Candidate Dossier
                </span>
                <h3 className="text-xl font-bold text-white font-['Outfit']">
                  {selectedStudent.fullName}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Registered: {new Date(selectedStudent.registeredAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Contact Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/10 space-y-2">
                <span className="font-semibold text-slate-300 block text-[11px] uppercase tracking-wider">
                  Candidate Contact Information
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Mobile Number:</span>
                    <a href={`tel:${selectedStudent.mobileNumber}`} className="font-mono text-emerald-400 font-bold">
                      {selectedStudent.mobileNumber}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email ID:</span>
                    <a href={`mailto:${selectedStudent.email}`} className="text-teal-300 font-medium">
                      {selectedStudent.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* AIAPGET & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">AIAPGET All India Rank:</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    AIR #{selectedStudent.aiapgetRank}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Reservation Category:</span>
                  <span className="text-lg font-bold text-white">
                    {selectedStudent.category}
                  </span>
                </div>
              </div>

              {/* BAMS College Background */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="font-semibold text-slate-300 block text-[11px] uppercase tracking-wider">
                  Undergraduate (BAMS) Details
                </span>
                <p className="text-sm font-bold text-white">
                  {selectedStudent.bamsCollege}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-slate-400 pt-1 text-[11px]">
                  <span>State: <strong className="text-white">{selectedStudent.bamsState}</strong></span>
                  <span>•</span>
                  <span>Passing Year: <strong className="text-white">{selectedStudent.passingYear}</strong></span>
                  <span>•</span>
                  <span>Aggregate: <strong className="text-emerald-400">{selectedStudent.bamsScore}</strong></span>
                </div>
              </div>

              {/* Preparation & Strategy */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="font-semibold text-slate-300 block text-[11px] uppercase tracking-wider">
                  AIAPGET Exam Preparation Method
                </span>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/10">
                  <span className="text-emerald-300 font-semibold block text-xs">
                    {selectedStudent.prepMethod}
                  </span>
                  <span className="text-slate-400 text-[11px] mt-0.5 block">
                    Studied {selectedStudent.dailyStudyHours} hours daily over {selectedStudent.prepDurationMonths} months.
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Target Specialization:</span>
                  <span className="font-bold text-amber-300 text-xs">
                    {selectedStudent.targetSpecialty}
                  </span>
                </div>
              </div>

              {/* Mentorship Status */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-emerald-300 font-bold block text-xs">
                    Counseling Mentorship Request:
                  </span>
                  <span className="text-slate-300 text-[11px]">
                    {selectedStudent.counselingAssistanceRequired 
                      ? 'Candidate requested free Ayush Gurukulam choice filling guidance.' 
                      : 'Candidate opting for independent counseling.'}
                  </span>
                </div>
                <div className="text-emerald-400 font-bold">
                  {selectedStudent.counselingAssistanceRequired ? 'Active Lead' : 'Self-Serve'}
                </div>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-2">
              <a
                href={`tel:${selectedStudent.mobileNumber}`}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Candidate</span>
              </a>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
