import {
  GenerateCalendarInput,
  GenerateCalendarOutput,
  GeneratedPost,
  GeneratedComment,
  Persona,
} from '../types';
import {
  generateTitle,
  generateBody,
  generateCommentText,
  generatePostId,
  generateCommentId,
  resetIdCounters,
  randomTimestamp,
} from '../utils';
import {
  filterRelevantSubreddits,
  matchSubredditToContent,
  assignPersonaToPost,
} from '../gpt-keywords';

/**
 * Select personas for comments (excluding the post author)
 */
function selectCommentPersonas(
  personas: Persona[],
  excludeUsername: string,
  count: number
): Persona[] {
  const available = personas.filter(p => p.username !== excludeUsername);
  
  if (available.length === 0) {
    return [];
  }

  // Shuffle and select
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, available.length));
}

/**
 * Generate a weekly calendar with posts and comments
 * Now uses ChatGPT for all decisions: keywords, subreddit matching, persona assignment
 */
export async function generateWeeklyCalendar(
  input: GenerateCalendarInput
): Promise<GenerateCalendarOutput> {
  const {
    company,
    personas,
    subreddits,
    postsPerWeek,
    startDate,
  } = input;

  // Calculate week start date
  const weekOffset = input.weekOffset || 0;
  let weekStartDate: Date;
  
  if (startDate) {
    // Start from the provided date
    const baseDate = new Date(startDate);
    // Get the Monday of that week
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    weekStartDate = new Date(baseDate.setDate(diff));
    weekStartDate.setHours(0, 0, 0, 0);
    // Add weeks based on offset
    weekStartDate.setDate(weekStartDate.getDate() + (weekOffset * 7));
  } else {
    // Start from current week's Monday
    weekStartDate = getCurrentWeekStart();
    // Add weeks based on offset
    weekStartDate.setDate(weekStartDate.getDate() + (weekOffset * 7));
  }
  
          const weekEndDate = new Date(weekStartDate);
          weekEndDate.setDate(weekEndDate.getDate() + 6);
          weekEndDate.setHours(23, 59, 59, 999);

          // Reset ID counters for a fresh calendar
          resetIdCounters();

  // Step 1: Filter subreddits to only include relevant ones using ChatGPT
  console.log('Filtering relevant subreddits based on company info...');
  const relevantSubreddits = await filterRelevantSubreddits(company, subreddits);
  console.log(`Relevant subreddits selected: ${relevantSubreddits.join(', ')}`);

  // Step 2: Use target queries (user-provided keywords)
  console.log(`Using ${input.targetQueries.length} target queries...`);
  const keywords = input.targetQueries.map(q => q.keyword);

  const posts: GeneratedPost[] = [];
  const comments: GeneratedComment[] = [];
  const usedTitles = new Set<string>();
  const personaPostCounts = new Map<string, number>();
  const subredditPostCounts = new Map<string, number>();
  
  // NEW: Track keyword usage to ensure variety
  const keywordUsageCounts = new Map<string, number>();
  keywords.forEach(k => keywordUsageCounts.set(k, 0));
  
  // NEW: Track persona-subreddit combinations to prevent repeats
  const personaSubredditCombos = new Set<string>(); // Format: "username:subreddit"
  
  // NEW: Track last post timestamp per persona for minimum spacing
  const personaLastPostTime = new Map<string, Date>();
  const MIN_HOURS_BETWEEN_POSTS = 6; // Minimum 6 hours between posts from same persona

  // Initialize persona counts
  personas.forEach(p => {
    personaPostCounts.set(p.username, 0);
    personaLastPostTime.set(p.username, new Date(0)); // Initialize to epoch
  });

  // Initialize subreddit counts
  relevantSubreddits.forEach(s => {
    subredditPostCounts.set(s, 0);
  });

  // Step 2: Generate posts
  for (let i = 0; i < postsPerWeek; i++) {
    // Ensure no persona exceeds 40% of posts
    const maxPostsPerPersona = Math.ceil(postsPerWeek * 0.4);
    let availablePersonas = personas.filter(
      p => (personaPostCounts.get(p.username) || 0) < maxPostsPerPersona
    );
    
    // NEW: Further filter to avoid persona-subreddit repeats for this iteration
    // We'll filter by subreddit after we know which subreddit we're targeting

    if (availablePersonas.length === 0) {
      // Reset if all personas hit limit
      personas.forEach(p => personaPostCounts.set(p.username, 0));
      // Re-filter after reset
      const resetPersonas = personas.filter(
        p => (personaPostCounts.get(p.username) || 0) < maxPostsPerPersona
      );
      if (resetPersonas.length > 0) {
        availablePersonas.push(...resetPersonas);
      } else {
        // If still empty, use all personas
        availablePersonas.push(...personas);
      }
    }

    // Ensure we have personas
    if (availablePersonas.length === 0) {
      throw new Error('No personas available for post generation');
    }

    // Select a keyword for this post - prioritize least used keywords
    if (keywords.length === 0) {
      throw new Error('No keywords generated from company information');
    }
    
    // Find least used keywords for better distribution
    const minKeywordUsage = Math.min(...Array.from(keywordUsageCounts.values()));
    const leastUsedKeywords = keywords.filter(k => 
      (keywordUsageCounts.get(k) || 0) <= minKeywordUsage + 1
    );
    
    // Prefer least used, but allow some randomness
    const keywordPool = leastUsedKeywords.length > 0 ? leastUsedKeywords : keywords;
    const keyword = keywordPool[Math.floor(Math.random() * keywordPool.length)];

    // Step 3: Use ChatGPT to match subreddit to this keyword/content, but balance distribution
    console.log(`Matching subreddit for keyword: ${keyword}...`);
    
    // Find subreddits with least usage to balance distribution
    const minPosts = Math.min(...Array.from(subredditPostCounts.values()));
    const leastUsedSubreddits = relevantSubreddits.filter(s => 
      (subredditPostCounts.get(s) || 0) <= minPosts + 1
    );
    
    // Use least used subreddits for better balance, but still let ChatGPT choose
    const subredditsToConsider = leastUsedSubreddits.length > 0 
      ? leastUsedSubreddits 
      : relevantSubreddits;
    
    const subreddit = await matchSubredditToContent(company, subredditsToConsider, keyword);

    // NEW: Filter personas to avoid persona-subreddit repeats (unless we have to)
    const comboKey = (username: string, sub: string) => `${username}:${sub}`;
    let personasForThisPost = availablePersonas.filter(p => 
      !personaSubredditCombos.has(comboKey(p.username, subreddit))
    );
    
    // If filtering removes all personas, allow repeats (better than failing)
    if (personasForThisPost.length === 0) {
      console.log(`All personas have already posted in r/${subreddit}, allowing repeat`);
      personasForThisPost = availablePersonas;
    }

    // Step 4: Use ChatGPT to assign persona to this post
    console.log(`Assigning persona for keyword: ${keyword}, subreddit: r/${subreddit}...`);
    const assignedPersona = await assignPersonaToPost(company, personasForThisPost, keyword, subreddit);
    
    // Find full persona object
    let authorPersona = personas.find(p => 
      p.username === assignedPersona?.username
    );
    
    // Fallback if not found
    if (!authorPersona) {
      authorPersona = availablePersonas.find(p => 
        p.username === assignedPersona?.username
      );
    }
    
    // Final fallback - use first available persona
    if (!authorPersona) {
      authorPersona = availablePersonas[0];
    }
    
    // Ultimate fallback - use first persona from all personas
    if (!authorPersona) {
      authorPersona = personas[0];
    }
    
    if (!authorPersona) {
      throw new Error('No personas available for post generation');
    }

    // Generate title using AI (ensure uniqueness)
    let title = await generateTitle(keyword, authorPersona, subreddit, company);
    let attempts = 0;
    while (usedTitles.has(title.toLowerCase()) && attempts < 10) {
      title = await generateTitle(keyword, authorPersona, subreddit, company);
      attempts++;
    }
    usedTitles.add(title.toLowerCase());

    // Generate body using AI
    const body = await generateBody(title, keyword, authorPersona, subreddit, company);

    // Generate post timestamp (random time during the week)
    // NEW: Ensure minimum spacing from same persona's last post
    let postTimestamp = randomTimestamp(weekStartDate, weekEndDate);
    const lastPostTime = personaLastPostTime.get(authorPersona.username);
    if (lastPostTime && lastPostTime.getTime() > 0) {
      const minNextPostTime = new Date(lastPostTime.getTime() + (MIN_HOURS_BETWEEN_POSTS * 60 * 60 * 1000));
      const generatedTime = new Date(postTimestamp);
      if (generatedTime < minNextPostTime) {
        // If generated time is too close, set it to at least MIN_HOURS_BETWEEN_POSTS later
        postTimestamp = randomTimestamp(
          minNextPostTime > weekEndDate ? weekStartDate : minNextPostTime,
          weekEndDate
        );
      }
    }
    const postDate = new Date(postTimestamp);
    
    // Update last post time for this persona
    personaLastPostTime.set(authorPersona.username, postDate);

    // Find keyword_id for this keyword
    const keywordQuery = input.targetQueries.find(q => q.keyword === keyword);
    const keywordId = keywordQuery?.keyword_id || keyword;

    // Create post
    const post: GeneratedPost = {
      post_id: generatePostId(),
      subreddit,
      title,
      body,
      author_username: authorPersona.username,
      author_persona_id: authorPersona.id || authorPersona.username,
      author_persona_name: authorPersona.username,
      timestamp: postTimestamp,
      keywords: [keyword],
      keyword_ids: [keywordId],
    };

    posts.push(post);
    const personaKey = authorPersona.username;
    personaPostCounts.set(personaKey, (personaPostCounts.get(personaKey) || 0) + 1);
    
    // Track subreddit usage
    subredditPostCounts.set(subreddit, (subredditPostCounts.get(subreddit) || 0) + 1);
    
    // NEW: Track keyword usage
    keywordUsageCounts.set(keyword, (keywordUsageCounts.get(keyword) || 0) + 1);
    
    // NEW: Track persona-subreddit combination
    personaSubredditCombos.add(comboKey(authorPersona.username, subreddit));

    // Generate comments for this post (2-4 comments, with potential nested replies)
    // IMPORTANT: Exclude the post author from commenting
    const numComments = Math.floor(Math.random() * 3) + 2; // 2-4 initial comments
    const commentPersonas = selectCommentPersonas(personas, authorPersona.username, numComments);
    
    if (commentPersonas.length === 0) {
      console.warn(`No available personas for comments (excluding ${authorPersona.username}), skipping comments for this post`);
      continue;
    }

    const postComments: GeneratedComment[] = [];
    let lastCommentTime = postDate;

    // Generate initial top-level comments
    for (let j = 0; j < commentPersonas.length; j++) {
      const commentPersona = commentPersonas[j];
      
      // Get existing comments for context
      const existingComments = postComments.map(c => ({
        username: c.username,
        comment: c.comment_text,
        comment_id: c.comment_id,
      }));
      
      // Generate comment text using AI
      const commentText = await generateCommentText(
        title, 
        body, 
        commentPersona, 
        subreddit, 
        company, 
        existingComments.map(c => ({ username: c.username, comment: c.comment }))
      );

      // Comment timestamp: 10-50 minutes after previous comment or post
      const commentDelayMinutes = 10 + Math.random() * 40; // 10-50 minutes
      lastCommentTime = new Date(lastCommentTime.getTime() + commentDelayMinutes * 60000);
      
      // Don't let comments go beyond week end
      if (lastCommentTime > weekEndDate) {
        lastCommentTime = new Date(postDate.getTime() + (j + 1) * 30 * 60000); // Fallback: 30min intervals
      }

      const comment: GeneratedComment = {
        comment_id: generateCommentId(),
        post_id: post.post_id,
        parent_comment_id: null, // Top-level comment
        comment_text: commentText,
        username: commentPersona?.username || 'Unknown',
        persona_id: commentPersona?.id || commentPersona?.username || 'unknown',
        timestamp: lastCommentTime.toISOString(),
      };

      postComments.push(comment);
      comments.push(comment);
    }

    // Generate nested replies (30-50% chance per top-level comment gets a reply)
    const commentsToReplyTo = postComments.filter(() => Math.random() < 0.4); // 40% chance
    
    for (const parentComment of commentsToReplyTo) {
      // Don't reply to own comment AND don't let post author comment
      const availableReplyPersonas = personas.filter(p => 
        p.username !== parentComment.username && p.username !== authorPersona.username
      );
      if (availableReplyPersonas.length === 0) continue;

      const replyPersona = availableReplyPersonas[Math.floor(Math.random() * availableReplyPersonas.length)];
      
      // Get context: post + parent comment + siblings of parent
      const siblingComments = postComments.filter(c => 
        c.parent_comment_id === parentComment.parent_comment_id && c.comment_id !== parentComment.comment_id
      );
      const existingComments = [
        { username: parentComment.username, comment: parentComment.comment_text },
        ...siblingComments.map(c => ({ username: c.username, comment: c.comment_text }))
      ];
      
      // Generate reply text using AI
      const replyText = await generateCommentText(
        title,
        body,
        replyPersona,
        subreddit,
        company,
        existingComments
      );

      // Reply timestamp: 5-30 minutes after parent comment
      const replyDelayMinutes = 5 + Math.random() * 25; // 5-30 minutes
      const replyTime = new Date(new Date(parentComment.timestamp).getTime() + replyDelayMinutes * 60000);
      
      // Don't let replies go beyond week end
      if (replyTime > weekEndDate) {
        continue; // Skip this reply if it would go past week end
      }

      const reply: GeneratedComment = {
        comment_id: generateCommentId(),
        post_id: post.post_id,
        parent_comment_id: parentComment.comment_id, // Reply to parent comment
        comment_text: replyText,
        username: replyPersona.username,
        persona_id: replyPersona.id || replyPersona.username,
        timestamp: replyTime.toISOString(),
      };

      postComments.push(reply);
      comments.push(reply);
    }

    // Occasionally generate a reply to a reply (nested level 2, max depth of 2)
    // NEW: Only reply to top-level comments' replies (depth 1), not deeper to cap depth
    const topLevelReplies = postComments.filter(c => {
      if (!c.parent_comment_id) return false; // Skip top-level comments
      // Check if parent is a top-level comment (parent's parent_comment_id is null)
      const parent = postComments.find(pc => pc.comment_id === c.parent_comment_id);
      return parent && parent.parent_comment_id === null;
    });
    const repliesToReplies = topLevelReplies.filter(() => Math.random() < 0.3); // 30% chance, max depth 2
    
    for (const parentReply of repliesToReplies) {
      // Don't reply to own comment AND don't let post author comment
      const availableReplyPersonas = personas.filter(p => 
        p.username !== parentReply.username && p.username !== authorPersona.username
      );
      if (availableReplyPersonas.length === 0) continue;

      const replyPersona = availableReplyPersonas[Math.floor(Math.random() * availableReplyPersonas.length)];
      
      // Get context: post + parent reply
      const existingComments = [
        { username: parentReply.username, comment: parentReply.comment_text }
      ];
      
      const replyText = await generateCommentText(
        title,
        body,
        replyPersona,
        subreddit,
        company,
        existingComments
      );

      const replyDelayMinutes = 5 + Math.random() * 20; // 5-20 minutes
      const replyTime = new Date(new Date(parentReply.timestamp).getTime() + replyDelayMinutes * 60000);
      
      if (replyTime > weekEndDate) {
        continue;
      }

      const nestedReply: GeneratedComment = {
        comment_id: generateCommentId(),
        post_id: post.post_id,
        parent_comment_id: parentReply.comment_id, // Reply to the reply
        comment_text: replyText,
        username: replyPersona.username,
        persona_id: replyPersona.id || replyPersona.username,
        timestamp: replyTime.toISOString(),
      };

      postComments.push(nestedReply);
      comments.push(nestedReply);
    }
  }

  // Sort posts by timestamp
  posts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return {
    weekStart: formatDate(weekStartDate),
    weekEnd: formatDate(weekEndDate),
    posts,
    comments,
  };
}

/**
 * Get the start of the current week (Monday)
 */
function getCurrentWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
