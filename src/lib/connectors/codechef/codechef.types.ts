// CodeChef raw API response types
// Source: CodeChef's public user profile API endpoint

export interface CodeChefUserProfile {
  success: boolean;
  status: string;
  /** Error message when success is false */
  message?: string;

  // Basic profile
  username?: string;
  name?: string;
  currentRating?: number;
  highestRating?: number;
  countryFlag?: string;
  countryName?: string;
  city?: string;
  globalRank?: number;
  countryRank?: number;
  stars?: string; // e.g. "5★"

  // Problem solving
  userDetails?: {
    totalProblems?: number;
    fullySolved?: number;
    partiallySolved?: number;
  } | null;

  // Ratings history
  ratingData?: {
    code: string;
    getyear: string;
    getmonth: string;
    getday: string;
    reason: string | null;
    penalised_in: string | null;
    rating: string;
    rank: string;
    name: string;
    end_date: string;
    color: string;
  }[];
}
