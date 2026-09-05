// CodeChef user profile types

export interface CodeChefUserProfile {
  success: boolean;
  status: string;
  message?: string;

  username?: string;
  name?: string;
  avatarUrl?: string;
  currentRating?: number;
  highestRating?: number;
  countryFlag?: string;
  countryName?: string;
  city?: string;
  globalRank?: number;
  countryRank?: number;
  stars?: string; // e.g. "5★"

  userDetails?: {
    totalProblems?: number;
    fullySolved?: number;
    partiallySolved?: number;
  } | null;

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
