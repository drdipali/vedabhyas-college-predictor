import type { 
  College, 
  Category, 
  PredictionResult, 
  ChanceLevel, 
  PredictionConfidence, 
  QuotaFilter, 
  InstitutionTypeFilter 
} from '../types';

/**
 * Predict admission chances for a student based on AIAPGET rank, category, branch and filters
 */
export function predictCollegeChances(
  colleges: College[],
  userRank: number,
  category: Category,
  quotaFilter: QuotaFilter = 'All',
  institutionTypeFilter: InstitutionTypeFilter = 'All',
  stateFilter: string = 'All',
  searchQuery: string = '',
  branchFilter: string = 'All'
): PredictionResult[] {
  if (!userRank || userRank <= 0) {
    return [];
  }

  const query = searchQuery.trim().toLowerCase();
  const branchQuery = branchFilter.trim().toLowerCase();

  return colleges
    .filter((college) => {
      // Quota filter
      if (quotaFilter !== 'All' && college.quota !== quotaFilter) {
        return false;
      }

      // Institution type filter (Government vs Private vs Deemed)
      if (institutionTypeFilter !== 'All' && college.institutionType !== institutionTypeFilter) {
        return false;
      }

      // State filter
      if (stateFilter !== 'All' && college.state !== stateFilter) {
        return false;
      }

      // Branch filter (e.g. Kayachikitsa, Shalya, Panchakarma, etc.)
      if (branchFilter !== 'All' && branchQuery) {
        const branches = college.topBranches || college.branches || [];
        // Split options like "Prasuti Tantra / Stri Roga" into tokens
        const tokens = branchQuery
          .split(/[\/\&]/)
          .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
          .filter(Boolean);

        const hasBranch = branches.some((b) => {
          const normBranch = b.toLowerCase().replace(/[^a-z0-9]/g, '');
          return tokens.some((token) => normBranch.includes(token));
        });

        if (!hasBranch) {
          return false;
        }
      }

      // Search query (name, city, state, branch, type)
      if (query) {
        const matchesName = college.name.toLowerCase().includes(query);
        const matchesShort = college.shortName.toLowerCase().includes(query);
        const matchesCity = college.city.toLowerCase().includes(query);
        const matchesState = college.state.toLowerCase().includes(query);
        const matchesType = college.type.toLowerCase().includes(query);
        const branches = college.topBranches || college.branches || [];
        const matchesBranch = branches.some((b) =>
          b.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesShort && !matchesCity && !matchesState && !matchesType && !matchesBranch) {
          return false;
        }
      }

      return true;
    })
    .map((college) => {
      // Category closing rank
      const closingRank =
        college.categoryClosingRanks?.[category] ?? 
        college.last_year_closing_rank?.[category === 'General' ? 'UR' : category] ?? 
        college.closingRank;
        
      const rankDelta = closingRank - userRank;

      let chance: ChanceLevel;
      let confidence: PredictionConfidence;
      let chanceScore: number;

      // High Chance / High Confidence: User's rank is <= last year's closing rank
      if (userRank <= closingRank) {
        chance = 'High Chance';
        confidence = 'High';
        const bonus = Math.min(24, Math.round((rankDelta / closingRank) * 40));
        chanceScore = Math.min(99, 75 + bonus);
      } 
      // Moderate / Probable / Medium Confidence: Within 18% margin of last year cutoff
      else if (userRank <= Math.round(closingRank * 1.18)) {
        chance = 'Probable';
        confidence = 'Moderate';
        const overRatio = (userRank - closingRank) / (closingRank * 0.18);
        chanceScore = Math.max(40, Math.round(74 - overRatio * 34));
      } 
      // Borderline / Tough Competition: Greater than 18% margin
      else {
        chance = 'Tough Competition';
        confidence = 'Borderline';
        const overRatio = (userRank - closingRank) / closingRank;
        chanceScore = Math.max(5, Math.round(39 - overRatio * 20));
      }

      return {
        college,
        category,
        closingRank,
        userRank,
        rankDelta,
        chance,
        confidence,
        chanceScore,
      };
    })
    .sort((a, b) => {
      // Priority sorting: High Chance first, then score, then closing rank
      const chanceWeight: Record<ChanceLevel, number> = {
        'High Chance': 3,
        'Probable': 2,
        'Tough Competition': 1,
      };

      if (chanceWeight[a.chance] !== chanceWeight[b.chance]) {
        return chanceWeight[b.chance] - chanceWeight[a.chance];
      }
      if (b.chanceScore !== a.chanceScore) {
        return b.chanceScore - a.chanceScore;
      }
      return a.closingRank - b.closingRank;
    });
}
