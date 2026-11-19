import type { College } from '../types';
import collegesJson from './colleges.json';

export const collegesData: College[] = (collegesJson as any[]).map((item) => {
  const closingRank: number = typeof item.closingRank === 'number' 
    ? item.closingRank 
    : (item.last_year_closing_rank?.UR ?? 3000);
    
  const categoryClosingRanks = item.categoryClosingRanks ?? {
    General: item.last_year_closing_rank?.UR ?? closingRank,
    OBC: item.last_year_closing_rank?.OBC ?? Math.round(closingRank * 1.15),
    SC: item.last_year_closing_rank?.SC ?? Math.round(closingRank * 1.6),
    ST: item.last_year_closing_rank?.ST ?? Math.round(closingRank * 1.9),
    EWS: item.last_year_closing_rank?.EWS ?? Math.round(closingRank * 1.1),
  };

  return {
    ...item,
    closingRank,
    categoryClosingRanks,
    quota: (item.quota || item.quota_type || 'AIQ') as 'AIQ' | 'State' | 'Deemed/Mgt',
    institutionType: (item.institutionType || item.college_type || 'Government') as 'Government' | 'Private' | 'Deemed',
    type: item.type || (item.institutionType ? `${item.institutionType} Institute` : 'Government Institute'),
    topBranches: item.topBranches || item.branches || ['Kayachikitsa', 'Shalya Tantra', 'Prasuti & Stri Roga'],
  } as College;
});

export const getAllStates = (): string[] => {
  const states = Array.from(new Set(collegesData.map((c) => c.state)));
  return states.sort();
};

export const COMMON_AYUSH_BRANCHES = [
  'Kayachikitsa',
  'Shalya Tantra',
  'Prasuti Tantra / Stri Roga',
  'Panchakarma',
  'Kaumarbhritya / Bala Roga',
  'Shalakya Tantra',
  'Dravyaguna Vijnana',
  'Rasa Shastra & BK',
  'Roga Nidana',
  'Agada Tantra',
  'Swasthavritta',
  'Samhita & Siddhanta',
  'Kriya Sharira',
  'Rachana Sharira',
];

export const getAllBranches = (): string[] => {
  const branchSet = new Set<string>();
  COMMON_AYUSH_BRANCHES.forEach((b) => branchSet.add(b));
  return Array.from(branchSet);
};

