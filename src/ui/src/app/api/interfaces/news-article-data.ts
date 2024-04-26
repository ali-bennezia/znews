import { NewsSourceData } from "./news-source-data";

export interface NewsArticleData {
  id: string;
  source: NewsSourceData | null;
  url: string;
  authors: string[];
  title: string;
  description: string;
  images: string[];
  tags: string[];
  createdAt: Date;
  reportedAt?: Date;
}
