// types/calendar.ts

export type CompanyInfo = {
  name: string;
  description: string;
  valueProps: string[];
  competitors: string[];
};

export type Persona = {
  id: string;
  username: string;
  tone: string;
  expertise: string;
};

export type Comment = {
  id: string;
  postId: string;
  parentCommentId?: string;
  body: string;
  persona: string;
  timestamp: string;
  delay: number; // minutes after post/parent
};

export type Post = {
  id: string;
  subreddit: string;
  title: string;
  body: string;
  persona: string;
  timestamp: string;
  status: 'planned' | 'scheduled' | 'posted';
  keywords: string[];
  comments: Comment[];
  targetQuery: string;
};

export type CalendarState = {
  posts: Post[];
  currentWeek: number;
  companyInfo: CompanyInfo;
  personas: Persona[];
  subreddits: string[];
  targetQueries: string[];
  postsPerWeek: number;
};