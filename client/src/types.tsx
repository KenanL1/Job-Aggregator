export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  job_url: string;
  site: string;
  posted_date: string;
  date_posted?: string;
  visited?: boolean;
}

export interface JobFilters {
  keywords?: string;
  exclude?: string;
  location?: string;
  posted_within?: string;
  site_names?: string[];
  page?: number;
  limit?: number;
}
