export type Persona = {
    username: string;
    name: string;
    background: string;
    attitude?: string;
    tone?: string;
    style?: string;
  };
  
  export type Post = {
    post_id: string;
    subreddit: string;
    title: string;
    body: string;
    author_username: string;
    author_persona_id: string;
    author_persona_name: string;
    timestamp: string;
    keywords?: string[];
    keyword_ids?: string[];
  };
  
  export type Comment = {
    comment_id: string;
    post_id: string;
    parent_comment_id: string | null;
    comment_text: string;
    username: string;
    persona_id: string;
    timestamp: string;
  };
  
  export type CalendarOutput = {
    weekStart: string;
    weekEnd: string;
    posts: Post[];
    comments: Comment[];
    weekOffset?: number; // Track which week this is (0 = current week)
  };
  
  export type TargetQuery = {
    keyword_id: string;
    keyword: string;
  };
  
  export type SetupConfig = {
    companyName: string;
    website: string;
    description: string;
    postsPerWeek: number;
    personas: Persona[];
    subreddits: string;
    targetQueries: TargetQuery[];
  };