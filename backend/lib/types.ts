// Type definitions for the Reddit content calendar generator

export interface Persona {
  id?: string; // Optional - can be auto-generated
  username: string; // Reddit username
  info: string; // Persona description/background (required)
  // Optional persona traits for more detailed persona voice
  attitude?: string;
  tone?: string;
  style?: string;
  emotionalManifestation?: string;
}

export interface TargetQuery {
  keyword_id: string; // e.g., "K1", "K2"
  keyword: string; // e.g., "best ai presentation maker"
}

export interface GeneratedPost {
  post_id: string;
  subreddit: string;
  title: string;
  body: string;
  author_username: string;
  author_persona_id: string;
  author_persona_name: string;
  timestamp: string;
  keywords?: string[]; // Keywords used for this post
  keyword_ids?: string[]; // Keyword IDs (K1, K2, etc.)
}

export interface GeneratedComment {
  comment_id: string;
  post_id: string;
  parent_comment_id: string | null;
  comment_text: string;
  username: string;
  persona_id: string;
  timestamp: string;
}

export interface CompanyInfo {
  name: string;
  website?: string;
  description: string;
}

export interface GenerateCalendarInput {
  company: CompanyInfo;
  personas: Persona[];
  subreddits: string[]; // Array of subreddit names (without r/ prefix)
  targetQueries: TargetQuery[]; // K1-K16 format queries to target
  postsPerWeek: number;
  startDate?: string;
  weekOffset?: number; // 0 = current week, 1 = next week, etc.
}

export interface GenerateCalendarOutput {
  weekStart: string;
  weekEnd: string;
  posts: GeneratedPost[];
  comments: GeneratedComment[];
}

