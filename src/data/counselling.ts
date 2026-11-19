import counsellingData from '../../public/data/counselling_updates.json';
import type { CounsellingAlertsFeed } from '../types';

export const initialCounsellingData: CounsellingAlertsFeed = counsellingData as CounsellingAlertsFeed;
export const defaultCounsellingFeed: CounsellingAlertsFeed = initialCounsellingData;

