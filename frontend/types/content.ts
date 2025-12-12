export type Post = {
    id: string;
    subreddit: string;
    title: string;
    body: string;
    author: string;
    timestamp: string;
    keywords: string[];
  };
  
  export type Comment = {
    id: string;
    postId: string;
    parentId?: string;
    username: string;
    text: string;
    timestamp: string;
  };
  
  export type Persona = {
    username: string;
    name: string;
    background: string;
    attitude?: string;
    tone?: string;
    style?: string;
  };
  