// src/interfaces/types.ts
export type SortBy = "name" | "newest" | "popular";

export interface Filters {
  // multi-select lists
  countries: string[];
  roles: string[];
  industries: string[]; // optional, may be empty
  // sorting
  sortBy: SortBy;
}
