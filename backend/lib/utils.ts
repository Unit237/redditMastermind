import { Persona, GeneratedComment, CompanyInfo } from './types';
import * as gpt from './gpt';

/**
 * Generate a random timestamp between start and end dates
 */
export function randomTimestamp(start: Date, end: Date): string {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime).toISOString();
}

// Old keyword preference functions removed - now using ChatGPT for all decisions

/**
 * Generate a post title using AI
 */
export async function generateTitle(
  keyword: string,
  persona: Persona,
  subreddit: string,
  company: CompanyInfo
): Promise<string> {
  return await gpt.generatePostTitle(keyword, persona, subreddit, company);
}

/**
 * Generate post body using AI
 */
export async function generateBody(
  title: string,
  keyword: string,
  persona: Persona,
  subreddit: string,
  company: CompanyInfo
): Promise<string> {
  return await gpt.generatePostBody(title, keyword, persona, subreddit, company);
}

/**
 * Generate comment text that responds to a post using AI
 */
export async function generateCommentText(
  postTitle: string,
  postBody: string,
  persona: Persona,
  subreddit: string,
  company: CompanyInfo,
  existingComments: Array<{ username: string; comment: string }> = []
): Promise<string> {
  return await gpt.generateComment(postTitle, postBody, persona, subreddit, company, existingComments);
}

/**
 * Generate a unique ID (simple counter-based)
 * For posts: P1, P2, P3...
 * For comments: C1, C2, C3...
 */
let postCounter = 0;
let commentCounter = 0;

export function generatePostId(): string {
  postCounter++;
  return `P${postCounter}`;
}

export function generateCommentId(): string {
  commentCounter++;
  return `C${commentCounter}`;
}

// Reset counters (useful for testing or new calendar generation)
export function resetIdCounters(): void {
  postCounter = 0;
  commentCounter = 0;
}

// Legacy function kept for backwards compatibility
export function generateId(prefix: string = ''): string {
  if (prefix === 'post_') {
    return generatePostId();
  } else if (prefix === 'comment_') {
    return generateCommentId();
  }
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

