import OpenAI from 'openai';
import { Persona } from './types';

// Initialize OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

/**
 * Generate a Reddit post title using AI
 */
export async function generatePostTitle(
  keyword: string,
  persona: Persona,
  subreddit: string,
  company: { name: string; description: string }
): Promise<string> {
  const client = getOpenAIClient();
  
  // Build persona description from available fields
  const personaDesc = persona.info || '';
  const personaTraits = [
    persona.attitude && `Attitude: ${persona.attitude}`,
    persona.tone && `Tone: ${persona.tone}`,
    persona.style && `Style: ${persona.style}`,
    persona.emotionalManifestation && `Emotional expression: ${persona.emotionalManifestation}`,
  ].filter(Boolean).join('\n');

  const fullPersonaDesc = personaTraits 
    ? `${personaDesc}\n\n${personaTraits}`
    : personaDesc;

  const systemPrompt = `You are ${persona.username}, ${fullPersonaDesc}

You have a VERY DISTINCT voice - write exactly like this persona would write. Don't sound generic. Match your persona's unique personality traits exactly.

Write Reddit post titles that sound like a real human Reddit user from this specific persona's perspective. Make them natural, conversational, and authentic. 

ABSOLUTELY NO EMOJIS - ZERO emojis allowed. Text only.`;

  const userPrompt = `Generate a Reddit post title for r/${subreddit} about: ${keyword}

Company: ${company.name}
${company.description ? `Company context: ${company.description}` : ''}

Requirements:
- Make it RELEVANT to r/${subreddit} - understand this subreddit's focus and community
- Sound like ${persona.username} would naturally ask this in r/${subreddit}
- Match your persona's UNIQUE voice - be very specific to this persona's personality
- Be conversational, casual, and natural
- NOT promotional or sales-y
- Short and direct (60-90 characters max)
- Could have slight imperfections (real humans aren't perfect)
- Use casual language appropriate for r/${subreddit}
- ABSOLUTELY NO EMOJIS - ZERO emojis. Text characters only.
- The title should feel like it belongs in r/${subreddit} from ${persona.username}'s perspective

Generate ONLY the title, nothing else. NO EMOJIS.`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9, // Higher temperature for more variety
      max_tokens: 80, // Shorter titles
    });

    let title = completion.choices[0]?.message?.content?.trim() || '';
    
    if (!title) {
      throw new Error('OpenAI returned empty title');
    }
    
    // Remove quotes if present
    title = title.replace(/^["']|["']$/g, '');
    
    // Remove any emojis that might have slipped through
    title = title.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    
    return title;
  } catch (error) {
    console.error('Error generating post title:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate post title with AI: ${errorMessage}`);
  }
}

/**
 * Generate a Reddit post body using AI
 */
export async function generatePostBody(
  title: string,
  keyword: string,
  persona: Persona,
  subreddit: string,
  company: { name: string; description: string }
): Promise<string> {
  const client = getOpenAIClient();
  
  // Build persona description from available fields
  const personaDesc = persona.info || '';
  const personaTraits = [
    persona.attitude && `Attitude: ${persona.attitude}`,
    persona.tone && `Tone: ${persona.tone}`,
    persona.style && `Style: ${persona.style}`,
    persona.emotionalManifestation && `Emotional expression: ${persona.emotionalManifestation}`,
  ].filter(Boolean).join('\n');

  const fullPersonaDesc = personaTraits 
    ? `${personaDesc}\n\n${personaTraits}`
    : personaDesc;

  const systemPrompt = `You are ${persona.username}, ${fullPersonaDesc}

You have a VERY DISTINCT voice - write exactly like this persona would write. Don't sound generic or like anyone else. Match your persona's unique personality traits exactly. This persona has specific ways of expressing themselves that are different from other personas.

Write Reddit posts that sound like a real human Reddit user from this specific persona's perspective. Be authentic, natural, and conversational. 

ABSOLUTELY NO EMOJIS - ZERO emojis allowed. Text only. Never use emojis, symbols, or special characters - just regular text.`;

  const userPrompt = `Write a Reddit post for r/${subreddit} with this title: "${title}"

Topic/Keyword: ${keyword}

Company: ${company.name}
${company.description ? `Company context (use subtly, don't be promotional): ${company.description}` : ''}

IMPORTANT CONTEXT ABOUT r/${subreddit}:
- This post is for r/${subreddit} - make it RELEVANT to this subreddit's community and focus
- Understand what r/${subreddit} is about and what kind of content fits there
- Use language and references appropriate for r/${subreddit} users
- Make sure the post feels like it belongs in r/${subreddit}, not a generic subreddit

Requirements:
- Sound like ${persona.username} specifically - use this persona's UNIQUE voice and personality
- Make content RELEVANT to r/${subreddit} - tailor it to this subreddit's focus
- Sound like a real person sharing their experience or asking for help
- Match your persona's voice EXACTLY - don't sound generic
- Be CASUAL and CONVERSATIONAL - use "I", "we", "my team", casual language
- Keep it VERY SHORT - 1-2 short paragraphs max (Reddit posts are brief, get straight to the point)
- Be DIRECT - get straight to the point, no fluff
- Can have minor grammar quirks or typos (real humans aren't perfect)
- NOT promotional or corporate
- Sound like you're just chatting with people in r/${subreddit}, not writing formally
- Use casual phrases appropriate for r/${subreddit} like "anyone else?", "what's working?", etc.
- ABSOLUTELY NO EMOJIS - ZERO emojis. Text characters only. Never use emojis or symbols.
- The post should feel authentic to both ${persona.username}'s voice AND r/${subreddit}'s community
- Natural and straight to the point - like a quick Reddit post

Write the post body now. NO EMOJIS. Keep it short and direct:`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 150, // Very short posts - get straight to the point
    });

    let body = completion.choices[0]?.message?.content?.trim() || '';
    
    // Remove any emojis that might have slipped through
    body = body.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    
    return body;
  } catch (error) {
    console.error('Error generating post body:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate post body with AI: ${errorMessage}`);
  }
}

/**
 * Generate a context-aware Reddit comment using AI
 */
export async function generateComment(
  postTitle: string,
  postBody: string,
  persona: Persona,
  subreddit: string,
  company: { name: string; description: string },
  existingComments: Array<{ username: string; comment: string }> = []
): Promise<string> {
  const client = getOpenAIClient();

  // Build persona description from available fields
  const personaDesc = persona.info || '';
  const personaTraits = [
    persona.attitude && `Attitude: ${persona.attitude}`,
    persona.tone && `Tone: ${persona.tone}`,
    persona.style && `Style: ${persona.style}`,
    persona.emotionalManifestation && `Emotional expression: ${persona.emotionalManifestation}`,
  ].filter(Boolean).join('\n');

  const fullPersonaDesc = personaTraits 
    ? `${personaDesc}\n\n${personaTraits}`
    : personaDesc;

  const systemPrompt = `You are ${persona.username}, ${fullPersonaDesc}

You have a VERY DISTINCT voice - write exactly like this persona would write. Don't sound generic or like anyone else. Match your persona's unique personality traits exactly. This persona has specific ways of expressing themselves that are different from other personas.

Write Reddit comments that sound like a real human Reddit user from this specific persona's perspective. Be authentic, natural, and conversational. 

ABSOLUTELY NO EMOJIS - ZERO emojis allowed. Text only. Never use emojis, symbols, or special characters - just regular text.`;

  const existingCommentsText = existingComments.length > 0
    ? `\n\nExisting comments in this thread:\n${existingComments.map(c => `${c.username}: ${c.comment}`).join('\n\n')}\n`
    : '';

  const userPrompt = `You're reading this Reddit post in r/${subreddit}:

Title: "${postTitle}"

Post content:
${postBody}
${existingCommentsText}

IMPORTANT CONTEXT:
- This post is in r/${subreddit} - make your comment RELEVANT to this subreddit's community
- Understand what r/${subreddit} is about and what kind of discussion fits there
- Use language appropriate for r/${subreddit} users
- Company: ${company.name}
${company.description ? `- Company context: ${company.description}` : ''}

Company information:
${company.name}
${company.description}

Write a comment replying to this post AS ${persona.username}. 

Requirements:
- Write as ${persona.username} specifically - use this persona's UNIQUE voice (not generic)
- Actually respond to what the person said - reference specific points from the post
- Make your comment RELEVANT to r/${subreddit} - tailor it to this subreddit's focus
- Match your persona's voice and personality EXACTLY - be very specific to ${persona.username}
- Sound like a REAL HUMAN - CASUAL, authentic, conversational (like you're texting)
- Keep it VERY SHORT - 1 sentence typically, 2 max (Reddit comments are brief and straight to the point!)
- Be DIRECT - get straight to the point, no fluff
- Can have minor grammar quirks, typos, or informal language (real humans aren't perfect)
- Use casual language appropriate for ${persona.username}: "yeah", "totally", "bro", "lol", "honestly", etc.
- Can use "I", "we", share personal experiences from ${persona.username}'s perspective
- NOT promotional or sales-y
- Add value but keep it brief and natural
- Sound like a quick reply, not an essay
- ABSOLUTELY NO EMOJIS - ZERO emojis. Text characters only. Never use emojis or symbols.
- The comment should feel authentic to both ${persona.username}'s voice AND r/${subreddit}'s community
- Natural and straight to the point - like a quick Reddit comment

Write your comment now. NO EMOJIS. Keep it short and direct:`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.95, // Very high temperature for maximum variety and naturalness
      max_tokens: 100, // Very short comments - get straight to the point
    });

    let comment = completion.choices[0]?.message?.content?.trim() || '';
    
    // Remove any emojis that might have slipped through
    comment = comment.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    
    return comment;
  } catch (error) {
    console.error('Error generating comment:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate comment with AI: ${errorMessage}`);
  }
}
