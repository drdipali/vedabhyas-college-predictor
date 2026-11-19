import React, { useState } from 'react';
import type { StudentProfile, Category, PreparationMethod } from '../types';
import { saveStudentProfile } from '../data/mockStudents';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  GraduationCap, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Clock, 
  Sparkles, 
  Award,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import logoImg from '../assets/logo.jpg';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: StudentProfile) => void;
  existingStudent: StudentProfile | null;
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

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingStudent,
}) => {
  const [fullName, setFullName] = useState(existingStudent?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(existingStudent?.mobileNumber || '');
  const [email, setEmail] = useState(existingStudent?.email || '');
  const [bamsCollege, setBamsCollege] = useState(existingStudent?.bamsCollege || '');
  const [bamsState, setBamsState] = useState(existingStudent?.bamsState || 'Maharashtra');
  const [passingYear, setPassingYear] = useState<number>(existingStudent?.passingYear || 2024);
  const [bamsScore, setBamsScore] = useState(existingStudent?.bamsScore || '68%');
  const [aiapgetRank, setAiapgetRank] = useState<number | ''>(existingStudent?.aiapgetRank || 240);
  const [category, setCategory] = useState<Category>(existingStudent?.category || 'General');
  const [prepMethod, setPrepMethod] = useState<PreparationMethod>(
    existingStudent?.prepMethod || 'Ayush Gurukulam Coaching'
  );
  const [dailyStudyHours, setDailyStudyHours] = useState<number>(existingStudent?.dailyStudyHours || 7);
  const [prepDurationMonths, setPrepDurationMonths] = useState<number>(
    existingStudent?.prepDurationMonths || 12
  );
  const [targetSpecialty, setTargetSpecialty] = useState(
    existingStudent?.targetSpecialty || 'Kayachikitsa (Internal Medicine)'
  );
  const [counselingAssistanceRequired, setCounselingAssistanceRequired] = useState(
    existingStudent?.counselingAssistanceRequired ?? true
  );

  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleNextOrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Step 1 Validation
    if (activeStep === 1) {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name');
        return;
      }
      if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, '').length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number for login verification');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address');
        return;
      }
      if (!bamsCollege.trim()) {
        setErrorMsg('Please enter your BAMS College / Institute name');
        return;
      }
      setActiveStep(2);
      return;
    }

    // Step 2 Submission
    if (!aiapgetRank || aiapgetRank <= 0) {
      setErrorMsg('Please enter a valid AIAPGET Rank');
      return;
    }

    const newProfile: StudentProfile = {
      id: existingStudent?.id || `std-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      bamsCollege: bamsCollege.trim(),
      bamsState,
      passingYear: Number(passingYear),
      bamsScore: bamsScore.trim(),
      aiapgetRank: Number(aiapgetRank),
      category,
      prepMethod,
      dailyStudyHours: Number(dailyStudyHours),
      prepDurationMonths: Number(prepDurationMonths),
      targetSpecialty,
      counselingAssistanceRequired,
      registeredAt: existingStudent?.registeredAt || new Date().toISOString(),
    };

    saveStudentProfile(newProfile);
    onSuccess(newProfile);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#38bdf8', '#f59e0b'],
      });
    } catch (e) {
      // ignore
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-xl bg-black/80 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/20 p-6 sm:p-8 bg-[#0b101c]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 flex items-start gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 border border-white/20 shadow-md shrink-0">
            <img src={logoImg} alt="Vedabhyas" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
                Ayush Gurukulam Student Network
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-300">
                Verified Sign In
              </span>
            </div>
            <h3 id="auth-modal-title" className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
              {existingStudent ? 'Update Your Student Profile' : 'Student Login & Profile Setup'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Enter your mobile, email, BAMS college background, and exam preparation details for customized AIAPGET college predictions.
            </p>
          </div>
        </div>

        {/* Multi-Step Indicator */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-xl bg-slate-900/60 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeStep === 1
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
            <span>Contact & BAMS College</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (fullName && mobileNumber && email) setActiveStep(2);
            }}
            className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeStep === 2
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
            <span>AIAPGET & Prep Strategy</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium animate-fadeIn">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleNextOrSubmit} className="space-y-4">
          
          {/* STEP 1: Contact & BAMS College Details */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Full Name (with Dr. prefix) *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ananya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                />
              </div>

              {/* Mobile Number & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mobile Number (Login ID) *</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 text-sm font-mono rounded-xl glass-input text-white placeholder-slate-500"
                  />
                  <span className="text-[10px] text-slate-400">Used for login and counseling SMS alerts</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-400" />
                    <span>Email Address (Official Login) *</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ananya.ayur@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                  />
                  <span className="text-[10px] text-slate-400">Used for seat allotment report delivery</span>
                </div>
              </div>

              {/* BAMS College Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                  <span>Undergraduate (BAMS) College Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. R.A. Podar Medical College (Ayurvedic), Mumbai"
                  value={bamsCollege}
                  onChange={(e) => setBamsCollege(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                />
              </div>

              {/* State of College, Passing Year & Score */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>College State *</span>
                  </label>
                  <select
                    value={bamsState}
                    onChange={(e) => setBamsState(e.target.value)}
                    className="w-full h-11 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                  >
                    {STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Internship / Passing Year</span>
                  </label>
                  <select
                    value={passingYear}
                    onChange={(e) => setPassingYear(Number(e.target.value))}
                    className="w-full h-11 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                  >
                    {[2025, 2024, 2023, 2022, 2021, 2020].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-teal-400" />
                    <span>BAMS Overall %</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 68.5%"
                    value={bamsScore}
                    onChange={(e) => setBamsScore(e.target.value)}
                    className="w-full h-11 px-3 text-sm rounded-xl glass-input text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 hover:opacity-95 shadow-md cursor-pointer"
                >
                  <span>Continue to Exam Preparation Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: AIAPGET Preparation & Target Details */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Rank & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your AIAPGET All India Rank (AIR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 240"
                    value={aiapgetRank}
                    onChange={(e) => setAiapgetRank(e.target.value ? Number(e.target.value) : '')}
                    required
                    className="w-full h-11 px-3.5 text-base font-bold font-mono rounded-xl glass-input text-emerald-400 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Counseling Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full h-11 px-3 text-sm rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                  >
                    {(['General', 'OBC', 'SC', 'ST', 'EWS'] as Category[]).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* How did you prepare for the exam? */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>How did you prepare for AIAPGET? *</span>
                </label>
                <select
                  value={prepMethod}
                  onChange={(e) => setPrepMethod(e.target.value as PreparationMethod)}
                  className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                >
                  {PREPARATION_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Study Hours & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Average Daily Study Hours</span>
                  </label>
                  <select
                    value={dailyStudyHours}
                    onChange={(e) => setDailyStudyHours(Number(e.target.value))}
                    className="w-full h-11 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                  >
                    {[3, 4, 5, 6, 7, 8, 9, 10, 12].map((hr) => (
                      <option key={hr} value={hr}>
                        {hr} hours / day
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>Preparation Duration</span>
                  </label>
                  <select
                    value={prepDurationMonths}
                    onChange={(e) => setPrepDurationMonths(Number(e.target.value))}
                    className="w-full h-11 px-3 text-xs rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                  >
                    {[3, 6, 9, 12, 18, 24].map((m) => (
                      <option key={m} value={m}>
                        {m} months
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Specialty */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Target MD/MS Ayurveda Branch / Specialty</span>
                </label>
                <select
                  value={targetSpecialty}
                  onChange={(e) => setTargetSpecialty(e.target.value)}
                  className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-xl glass-input text-white bg-slate-900 border border-white/15 cursor-pointer"
                >
                  {SPECIALTIES.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Counseling Assistance Checkbox */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="assistance-check"
                  checked={counselingAssistanceRequired}
                  onChange={(e) => setCounselingAssistanceRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 mt-0.5 cursor-pointer"
                />
                <label htmlFor="assistance-check" className="text-xs text-slate-300 cursor-pointer">
                  <strong className="text-white block font-medium">Request Free Ayush Gurukulam Choice-Locking Mentorship</strong>
                  Receive personal guidance on Round 1 and Round 2 choices, security deposit forfeiture prevention, and fee concessions.
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 cursor-pointer"
                >
                  ← Back to Contact
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition-all cursor-pointer"
                >
                  Save Profile & Unlock Custom Predictions
                </button>
              </div>

            </div>
          )}

        </form>

      </div>
    </div>
  );
};
