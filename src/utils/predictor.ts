import type { College, Category, PredictionResult, ChanceLevel, QuotaFilter, InstitutionTypeFilter } from '../types';

/**
 * Predict admission chances for a student based on AIAPGET rank, category, and filters
 */
export function predictCollegeChances(
  colleges: College[],
  userRank: number,
  category: Category,
  quotaFilter: QuotaFilter = 'All',
  institutionTypeFilter: InstitutionTypeFilter = 'All',
  stateFilter: string = 'All',
  searchQuery: string = ''
): PredictionResult[] {
  if (!userRank || userRank <= 0) {
    return [];
  }

  const query = searchQuery.trim().toLowerCase();

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

      // Search query (name, city, state, branch, type)
      if (query) {
        const matchesName = college.name.toLowerCase().includes(query);
        const matchesShort = college.shortName.toLowerCase().includes(query);
        const matchesCity = college.city.toLowerCase().includes(query);
        const matchesState = college.state.toLowerCase().includes(query);
        const matchesType = college.type.toLowerCase().includes(query);
        const matchesBranch = college.topBranches.some((b) =>
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
        college.categoryClosingRanks?.[category] ?? college.closingRank;
      const rankDelta = closingRank - userRank;

      let chance: ChanceLevel;
      let chanceScore: number;

      // Rule: If user's rank is lower than or equal to closing rank, categorize as "High Chance"
      if (userRank <= closingRank) {
        chance = 'High Chance';
        // Between 75% and 99%
        const bonus = Math.min(24, Math.round((rankDelta / closingRank) * 40));
        chanceScore = Math.min(99, 75 + bonus);
      } else if (userRank <= Math.round(closingRank * 1.18)) {
        chance = 'Probable';
        // Between 40% and 74%
        const overRatio = (userRank - closingRank) / (closingRank * 0.18);
        chanceScore = Math.max(40, Math.round(74 - overRatio * 34));
      } else {
        chance = 'Tough Competition';
        // Below 40%
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

      return b.chanceScore - a.chanceScore;
    });
}
