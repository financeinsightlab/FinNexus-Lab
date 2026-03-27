export interface ResearchPost {
  slug: string;
  title: string;
  date: string;
  sector: string;
  tags: string[];
  summary: string;
  pageCount: number;
  author: string;
  featured: boolean;
  coverImage?: string;
  content?: string;
}

export interface InsightPost {
  slug: string;
  title: string;
  date: string;
  category: 'Strategy Note' | 'Sector Analysis' | 'Company Note' | 'Market Update';
  readingTime: number;
  thesis: string;
  author: string;
  featured: boolean;
  content?: string;
}

export interface Tool {
  id: string;
  title: string;
  category: string;
  tool: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  desc: string;
  includes: string[];
  gated: boolean;
  price?: string;
  icon: string;
}

export interface Service {
  icon: string;
  title: string;
  price: string;
  timeline: string;
  desc: string;
  includes: string[];
  for: string;
}

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface DataLabProject {
  slug:             string
  title:            string
  date:             string
  tools:            string[]
  sector:           string
  businessQuestion: string
  duration:         string
  featured:         boolean
  content?:         string
}

export interface CaseStudy {
  slug:           string
  title:          string
  date:           string
  clientType:     string  // e.g. 'Startup', 'PE Firm', 'Platform Builder'
  engagementType: string  // e.g. 'Market Research', 'Financial Modelling'
  outcome:        string  // 1-2 sentence summary of result
  featured:       boolean
  content?:       string
}

export interface PodcastEpisode {
  slug:         string
  title:        string
  date:         string
  episodeNumber: number
  duration:     string  // e.g. '32:14'
  format:       'Solo Analysis' | 'Expert Interview' | 'Quarterly Tracker' | 'Research Summary'
  guestName?:   string
  guestRole?:   string
  description:  string  // 2-3 sentences
  audioUrl?:    string  // Spotify/Apple Podcasts URL or direct MP3
  featured:     boolean
  content?:     string  // show notes + transcript
}