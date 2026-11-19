import type { College } from '../types';
import collegesJson from './colleges.json';

export const collegesData: College[] = collegesJson.map((item) => ({
  ...item,
  quota: item.quota as 'AIQ' | 'State' | 'Deemed/Mgt',
  institutionType: item.institutionType as 'Government' | 'Private' | 'Deemed',
  type: item.type,
}));

export const getAllStates = (): string[] => {
  const states = Array.from(new Set(collegesData.map((c) => c.state)));
  return states.sort();
};
