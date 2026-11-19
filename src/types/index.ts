export type Category = 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';

export type QuotaFilter = 'All' | 'AIQ' | 'State' | 'Deemed/Mgt';

export type InstitutionTypeFilter = 'All' | 'Government' | 'Private' | 'Deemed';

export type ChanceLevel = 'High Chance' | 'Probable' | 'Tough Competition';

export type PredictionConfidence = 'High' | 'Moderate' | 'Borderline';

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
  stipend: string;
  stipendAmount: number;
  annualFee: string;
  closingRank: number;
  categoryClosingRanks: CategoryClosingRanks;
  hospitalBeds: number;
  opdPerDay: number;
  established: number;
  type: string;
  topBranches: string[];
  description: string;
  website: string;
  // User Requested Schema Aliases
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
  fees_approx?: string;
  source_url?: string;
}

export interface PredictionResult {
  college: College;
  category: Category;
  closingRank: number;
  userRank: number;
  rankDelta: number;
  chance: ChanceLevel;
  confidence: PredictionConfidence;
  chanceScore: number;
}

export type PreparationMethod = 
  | 'Self-Study & Standard Samhitas'
  | 'Ayush Gurukulam Coaching'
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
  official_link: string;
  summary?: string;
  source_portal?: string;
}

export interface CounsellingAlertsFeed {
  last_updated: string;
  active_session: string;
  monitoring_status?: string;
  urgent_ticker: string[];
  updates: CounsellingUpdate[];
}
