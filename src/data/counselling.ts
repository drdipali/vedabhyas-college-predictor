import counsellingData from '../../public/data/counselling_updates.json';
import manualNoticesData from './manual_notices.json';
import type { CounsellingAlertsFeed, CounsellingUpdate } from '../types';

export const manualNotices: CounsellingUpdate[] = manualNoticesData as CounsellingUpdate[];

export const STATE_OFFICIAL_PORTALS: Record<string, { name: string; url: string; authority: string }> = {
  'Central (AACCC)': {
    name: 'AACCC PG Counseling Portal',
    url: 'https://aaccc.gov.in/pg-counselling/',
    authority: 'Ayush Admissions Central Counseling Committee (Ministry of Ayush)',
  },
  'AACCC / All India': {
    name: 'AACCC PG Counseling Portal',
    url: 'https://aaccc.gov.in/pg-counselling/',
    authority: 'Ayush Admissions Central Counseling Committee (Ministry of Ayush)',
  },
  'Maharashtra': {
    name: 'Maharashtra State CET Cell AYUSH PG',
    url: 'https://cetcell.mahacet.org/',
    authority: 'Government of Maharashtra State Common Entrance Test Cell',
  },
  'Uttar Pradesh': {
    name: 'UP Ayush Counseling Board',
    url: 'https://upayushcounseling.upsdc.gov.in/',
    authority: 'Department of AYUSH, Government of Uttar Pradesh',
  },
  'Karnataka': {
    name: 'Karnataka Examinations Authority (KEA PGET)',
    url: 'https://cetonline.karnataka.gov.in/kea/',
    authority: 'Karnataka Examination Authority (Govt. of Karnataka)',
  },
  'Gujarat': {
    name: 'ACPUGMEC Gujarat AYUSH PG',
    url: 'https://www.medadmgujarat.org/',
    authority: 'Admission Committee for Professional Post-Graduate Medical Courses',
  },
  'Madhya Pradesh': {
    name: 'MP Online AYUSH PG Portal',
    url: 'https://ayush.mponline.gov.in/',
    authority: 'Department of AYUSH & MPOnline Portal (Govt. of MP)',
  },
  'Rajasthan': {
    name: 'Rajasthan AYUSH PG Counseling (DSRRAU)',
    url: 'https://rajayushcounselling.com/',
    authority: 'Dr. Sarvepalli Radhakrishnan Rajasthan Ayurved University, Jodhpur',
  },
  'Kerala': {
    name: 'CEE Kerala AYUSH PG Portal',
    url: 'https://cee.kerala.gov.in/',
    authority: 'Commissioner for Entrance Examinations, Thiruvananthapuram',
  },
  'West Bengal': {
    name: 'WBMCC Ayush PG Counseling',
    url: 'https://wbmcc.nic.in/',
    authority: 'West Bengal Medical & AYUSH Counseling Committee',
  },
  'Haryana': {
    name: 'SKAU Kurukshetra AYUSH Portal',
    url: 'https://skau.ac.in/',
    authority: 'Shri Krishna AYUSH University, Kurukshetra',
  },
  'Delhi': {
    name: 'AACCC / IP University Ayush Counseling',
    url: 'https://aaccc.gov.in/pg-counselling/',
    authority: 'AACCC Central & GGSIPU Delhi',
  },
  'Bihar': {
    name: 'BCECEB Bihar Ayush PG',
    url: 'https://bceceboard.bihar.gov.in/',
    authority: 'Bihar Combined Entrance Competitive Examination Board',
  },
  'Tamil Nadu': {
    name: 'Tamil Nadu AYUSH PG Selection Committee',
    url: 'https://tnhealth.tn.gov.in/',
    authority: 'Directorate of Indian Medicine and Homoeopathy, Chennai',
  },
};

/**
 * Merge manual pinned notices (always kept at the top) with verified live scraped updates.
 */
export function mergeCounsellingFeeds(
  scrapedFeed: CounsellingAlertsFeed,
  manualList: CounsellingUpdate[] = manualNotices
): CounsellingAlertsFeed {
  const manualIds = new Set(manualList.map((m) => m.id));
  
  // Filter out any duplicate scraped item if it shares an ID
  const freshScraped = (scrapedFeed.updates || []).filter((u) => !manualIds.has(u.id));

  // Manual notices always pinned first
  const mergedUpdates = [...manualList, ...freshScraped];

  // Derive urgent ticker notices
  const urgentItems = mergedUpdates.filter((u) => u.is_urgent);
  const tickerList = urgentItems.map(
    (u) => `🔴 ${u.state}: ${u.title}`
  );

  return {
    ...scrapedFeed,
    urgent_ticker: tickerList.length > 0 ? tickerList : [
      "🔴 AACCC / All India: AIAPGET 2026 Counselling Currently On Hold (Administrative Reasons) — Check official updates on aaccc.gov.in"
    ],
    updates: mergedUpdates,
  };
}

export const initialCounsellingData: CounsellingAlertsFeed = mergeCounsellingFeeds(
  counsellingData as CounsellingAlertsFeed,
  manualNotices
);

export const defaultCounsellingFeed: CounsellingAlertsFeed = initialCounsellingData;


