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

      // Simple, clear rank comparison (High Chance, Moderate, Borderline, Very Low)
      if (userRank <= closingRank) {
        chance = 'High Chance';
        confidence = 'High';
      } else if (userRank <= Math.round(closingRank * 1.15)) {
        chance = 'Moderate';
        confidence = 'Moderate';
      } else if (userRank <= Math.round(closingRank * 1.35)) {
        chance = 'Borderline';
        confidence = 'Borderline';
      } else {
        chance = 'Very Low';
        confidence = 'Low';
      }

      return {
        college,
        category,
        closingRank,
        userRank,
        rankDelta,
        chance,
        confidence,
      };
    })
    .sort((a, b) => {
      // Priority sorting: High Chance first, then rank delta, then closing rank
      const chanceWeight: Record<ChanceLevel, number> = {
        'High Chance': 4,
        'Moderate': 3,
        'Borderline': 2,
        'Very Low': 1,
      };

      if (chanceWeight[a.chance] !== chanceWeight[b.chance]) {
        return chanceWeight[b.chance] - chanceWeight[a.chance];
      }
      if (b.rankDelta !== a.rankDelta) {
        return b.rankDelta - a.rankDelta;
      }
      return a.closingRank - b.closingRank;
    });
}
