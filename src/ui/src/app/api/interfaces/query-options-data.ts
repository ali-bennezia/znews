import { QuerySortingOptionsData } from "./query-sorting-options-data";

export interface QueryOptionsData {
  query?: string;
  page?: number;
  count?: number;
  source?: string;
  country?: string;
  sourceUrl?: string;
  sorting?: QuerySortingOptionsData;
}
