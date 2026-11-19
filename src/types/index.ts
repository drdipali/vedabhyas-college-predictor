export type Category = 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';

export type QuotaFilter = 'All' | 'AIQ' | 'State' | 'Deemed/Mgt';

export type InstitutionTypeFilter = 'All' | 'Government' | 'Private' | 'Deemed';

export type ChanceLevel = 'High Chance' | 'Probable' | 'Tough Competition';

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
}

export interface PredictionResult {
  college: College;
  category: Category;
  closingRank: number;
  userRank: number;
  rankDelta: number;
  chance: ChanceLevel;
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
  registeredAt: string;
}
