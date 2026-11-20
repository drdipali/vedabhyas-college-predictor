export type Category = 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';

export type QuotaFilter = 'All' | 'AIQ' | 'State' | 'Deemed/Mgt';

export type InstitutionTypeFilter = 'All' | 'Government' | 'Private' | 'Deemed';

export type ChanceLevel = 'High Chance' | 'Moderate' | 'Borderline' | 'Very Low';

export type PredictionConfidence = 'High' | 'Moderate' | 'Borderline' | 'Low';

export interface CategoryClosingRanks {
  General: number;
  OBC: number;
  SC: number;
  ST: number;
  EWS: number;
}

export interface College {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  quota: 'AIQ' | 'State' | 'Deemed/Mgt';
  institutionType: 'Government' | 'Private' | 'Deemed';
  closingRank: number;
  categoryClosingRanks: CategoryClosingRanks;
  type: string;
  topBranches: string[];
  website?: string;
  college_name?: string;
  quota_type?: string;
  college_type?: string;
  branches?: string[];
  last_year_closing_rank?: {
    UR?: number;
    OBC?: number;
    EWS?: number;
    SC?: number;
    ST?: number;
  };
  source_url?: string;
  ncism_code?: string;
  is_verified?: boolean;
  verified_at?: string;
  verified_by?: string;
  annual_fee?: string;
  monthly_stipend?: string;
  // Optional legacy fields for backward compatibility
  stipend?: string | null;
  stipendAmount?: number;
  annualFee?: string;
  hospitalBeds?: number;
  opdPerDay?: number;
  established?: number;
  description?: string;
}

export interface PredictionResult {
  college: College;
  category: Category;
  closingRank: number;
  userRank: number;
  rankDelta: number;
  chance: ChanceLevel;
  confidence?: PredictionConfidence;
  chanceScore?: number;
}

export type PreparationMethod = 
  | 'Self-Study & Standard Samhitas'
  | 'Vedabhyas Coaching'
  | 'External Coaching Institute'
  | 'Online Test Series & Q-Bank'
  | 'Combined Group Study & Mentorship';

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  bamsCollege: string;
  bamsState: string;
  passingYear: number;
  bamsScore: string;
  aiapgetRank: number;
  category: Category;
  prepMethod: PreparationMethod;
  dailyStudyHours: number;
  prepDurationMonths: number;
  targetSpecialty: string;
  counselingAssistanceRequired: boolean;
  password?: string;
  registeredAt: string;
}

export type UpdateCategory = 
  | 'Registration' 
  | 'Choice Filling' 
  | 'Result' 
  | 'Schedule Change' 
  | 'Seat Matrix' 
  | 'Notice';

export interface CounsellingUpdate {
  id: string;
  state: string;
  title: string;
  date: string;
  category: UpdateCategory;
  is_urgent: boolean;
  is_pinned?: boolean;
  official_link: string;
  summary?: string;
  description?: string;
  source_portal?: string;
}

export interface CounsellingAlertsFeed {
  last_updated: string;
  active_session: string;
  monitoring_status?: string;
  active_portals_count?: number;
  total_portals_monitored?: number;
  urgent_ticker: string[];
  updates: CounsellingUpdate[];
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface CollegeSubmission {
  id: string;
  submitted_by_user_id?: string;
  college_name: string;
  ncism_code?: string;
  state: string;
  college_type: string;
  quota_type: string;
  departments: string[];
  annual_fee?: string;
  monthly_stipend?: string;
  contact_person_name: string;
  designation: string;
  contact_phone: string;
  official_email: string;
  proof_url?: string;
  status: SubmissionStatus;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface CollegeAdminProfile {
  id: string;
  email: string;
  collegeName?: string;
  contactPersonName?: string;
  designation?: string;
  phone?: string;
}

export interface StudentPreference {
  id: string;
  user_id: string;
  college_id?: string | null;
  suggestion_id?: string | null;
  branch: string;
  priority_order: number;
  notes?: string;
  created_at: string;
  // Joined or resolved fields for UI rendering:
  college_name?: string;
  college_code?: string;
  state?: string;
  college_type?: string;
  quota_type?: string;
  is_verified?: boolean; // true if approved live college, false if pending suggestion
  status?: 'verified' | 'pending' | 'approved' | 'rejected';
}

export interface StudentSuggestionPayload {
  user_id: string;
  student_name?: string;
  student_rank?: number;
  branch?: string;
  notes?: string;
  submitted_at: string;
}

export interface StudentCollegeSuggestion {
  id: string;
  college_code: string;
  college_name: string;
  state: string;
  college_type: string;
  quota_type: string;
  branches: string[];
  submitted_by_user_ids: string[];
  verification_count: number;
  submitted_payloads: StudentSuggestionPayload[];
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}
