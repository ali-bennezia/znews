import { NewsSourceData } from "./news-source-data";

export interface NewsArticleData {
  source: NewsSourceData | null;
  url: string;
  authors: string[];
  title: string;
  description: string;
  images: string[];
  tags: string[];
  createdAt: Date;
}
