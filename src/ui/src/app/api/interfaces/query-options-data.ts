import { QuerySortingOptionsData } from "./query-sorting-options-data";

export interface QueryOptionsData {
  query?: string;
  count?: number;
  source?: string;
  country?: string;
  sourceUrl?: string;
  page?: number;
  sorting?: QuerySortingOptionsData;
}
