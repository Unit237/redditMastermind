import OpenAI from 'openai';
import { CompanyInfo } from './types';

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
 * Extract keywords from target queries (user-provided K1-K16 format)
 */
export function extractKeywordsFromTargetQueries(targetQueries: Array<{ keyword_id: string; keyword: string }>): string[] {
  return targetQueries.map(q => q.keyword);
}

/**
 * Generate relevant keywords based on company information (fallback if no target queries provided)
 */
export async function generateKeywordsFromCompany(company: CompanyInfo): Promise<string[]> {
  const client = getOpenAIClient();

  const systemPrompt = `You are a keyword research expert. Based on company information, generate relevant search keywords that people would use when looking for their products/services.

Generate keywords that are:
- Natural and conversational (how real people search)
- Relevant to the company's products/services
- Suitable for Reddit discussions
- Not too generic, not too specific
- 10-15 keywords total`;

  const userPrompt = `Company Information:
Name: ${company.name}
${company.website ? `Website: ${company.website}` : ''}
Description: ${company.description}

Generate 10-15 relevant keywords that people might search for related to this company. These will be used to create Reddit posts.

Return a JSON object with a "keywords" array. Example format:
{
  "keywords": ["keyword 1", "keyword 2", "keyword 3"]
}`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 200,
    });

    const content = completion.choices[0]?.message?.content?.trim() || '';
    
    // Try to parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse JSON response');
      }
    }
    
    // Extract keywords array from response
    // Try multiple possible keys
    let keywords = parsed.keywords || parsed.keywords_array || parsed.data;
    
    // If still not found, look for first array value
    if (!Array.isArray(keywords)) {
      const values = Object.values(parsed);
      const arrayValue = values.find(v => Array.isArray(v)) as string[] | undefined;
      if (arrayValue) {
        keywords = arrayValue;
      }
    }
    
    // If it's directly an array (old format), use it
    if (Array.isArray(parsed)) {
      keywords = parsed;
    }
    
    // Validate we have an array
    if (!Array.isArray(keywords) || keywords.length === 0) {
      console.error('Invalid keyword response:', content);
      throw new Error('Invalid keyword response format - expected array of strings');
    }
    
    // Ensure all items are strings
    return keywords.filter((k: any) => typeof k === 'string' && k.trim().length > 0).map((k: string) => k.trim());
  } catch (error) {
    console.error('Error generating keywords:', error);
    throw new Error(`Failed to generate keywords: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Filter subreddits to only include those that are relevant to the company
 */
export async function filterRelevantSubreddits(
  company: CompanyInfo,
  subreddits: string[]
): Promise<string[]> {
  const client = getOpenAIClient();

  const systemPrompt = `You are a Reddit community expert. Based on company information, rank and select the TOP 3 BEST subreddits from a list that are most relevant and suitable for content related to this company.

Evaluate subreddits based on:
- Relevance to the company's products/services
- Appropriate audience match
- Natural fit (not forced)
- Community that would be interested in this company's offerings

IMPORTANT: Select exactly 3 subreddits, ranked from most relevant to least relevant.`;

  const userPrompt = `Company Information:
Name: ${company.name}
${company.website ? `Website: ${company.website}` : ''}
Description: ${company.description}

Available subreddits: ${subreddits.join(', ')}

Which are the TOP 3 BEST subreddits for this company? Select only the 3 most relevant and suitable subreddits (ranked by relevance).

Return a JSON object with a "subreddits" array containing exactly 3 subreddit names (without r/ prefix), ordered from most relevant to least. Example:
{
  "subreddits": ["Entrepreneur", "startups", "consulting"]
}`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 200,
    });

    const content = completion.choices[0]?.message?.content?.trim() || '';
    
    // Try to parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse JSON response');
      }
    }
    
    // Extract subreddits array from response
    let filteredSubreddits = parsed.subreddits || parsed.subreddit_list || parsed.relevant_subreddits;
    
    // If still not found, look for first array value
    if (!Array.isArray(filteredSubreddits)) {
      const values = Object.values(parsed);
      const arrayValue = values.find(v => Array.isArray(v)) as string[] | undefined;
      if (arrayValue) {
        filteredSubreddits = arrayValue;
      }
    }
    
    // Validate we have an array
    if (!Array.isArray(filteredSubreddits)) {
      console.error('Invalid subreddit filter response:', content);
      // If parsing fails, return original list as fallback
      return subreddits;
    }
    
    // Clean up subreddit names (remove r/ prefix, trim)
    const cleaned = filteredSubreddits
      .map((s: string) => s.replace(/^r\//, '').trim())
      .filter((s: string) => s.length > 0);
    
    // Validate that all returned subreddits are in the original list
    const validSubreddits = cleaned.filter(s => 
      subreddits.some(original => 
        original.toLowerCase() === s.toLowerCase()
      )
    );
    
    // Map back to original casing
    const mappedSubreddits = validSubreddits.map(filtered => {
      const match = subreddits.find(original => 
        original.toLowerCase() === filtered.toLowerCase()
      );
      return match || filtered;
    });
    
    // If no valid subreddits found, return first 3 from original list as fallback
    if (mappedSubreddits.length === 0) {
      console.warn('No matching subreddits found, using first 3 from original list');
      return subreddits.slice(0, 3);
    }
    
    // Limit to top 3 most relevant subreddits
    const top3 = mappedSubreddits.slice(0, 3);
    
    // If we have less than 3, pad with remaining from original list
    if (top3.length < 3) {
      const remaining = subreddits.filter(s => !top3.some(t => t.toLowerCase() === s.toLowerCase()));
      top3.push(...remaining.slice(0, 3 - top3.length));
    }
    
    return top3;
  } catch (error) {
    console.error('Error filtering subreddits:', error);
    // On error, return original list as fallback
    return subreddits;
  }
}

/**
 * Match subreddits to company context and suggest best fits for posts
 */
export async function matchSubredditToContent(
  company: CompanyInfo,
  subreddits: string[],
  keyword: string
): Promise<string> {
  const client = getOpenAIClient();

  const systemPrompt = `You are a Reddit community expert. Based on company information and a keyword topic, determine which subreddit from the given list would be the best fit for a post about this topic.

Choose the subreddit that:
- Is most relevant to the keyword/topic
- Would have an interested audience
- Is appropriate for discussions about this company/topic
- Feels natural (not forced)`;

  const userPrompt = `Company: ${company.name}
${company.description ? `Description: ${company.description}` : ''}

Available subreddits: ${subreddits.join(', ')}

Topic/Keyword: ${keyword}

Which subreddit is the best fit for a post about "${keyword}" related to this company?

Return ONLY the subreddit name (without r/ prefix), nothing else.`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    let subreddit = completion.choices[0]?.message?.content?.trim() || '';
    
    // Remove r/ prefix if present
    subreddit = subreddit.replace(/^r\//, '');
    
    // Validate it's in our list
    if (subreddits.includes(subreddit)) {
      return subreddit;
    }
    
    // If not exact match, try to find close match
    const lowerSubreddit = subreddit.toLowerCase();
    const match = subreddits.find(s => s.toLowerCase() === lowerSubreddit);
    if (match) {
      return match;
    }
    
    // Default to first subreddit if no match
    return subreddits[0];
  } catch (error) {
    console.error('Error matching subreddit:', error);
    // Default to first subreddit on error
    return subreddits[0];
  }
}

/**
 * Assign a persona to a post based on fit
 */
export async function assignPersonaToPost(
  company: CompanyInfo,
  personas: Array<{ id?: string; username: string; info: string; attitude?: string }>,
  keyword: string,
  subreddit: string
): Promise<{ id?: string; username: string }> {
  const client = getOpenAIClient();

  const personasList = personas.map(p => `- ${p.username}: ${p.info}${p.attitude ? `. Attitude: ${p.attitude}` : ''}`).join('\n');

  const systemPrompt = `You are a content strategist. Based on the topic, subreddit, and persona backgrounds, determine which persona would be the best fit to create a post about this topic.

Choose the persona whose background and attitude would naturally post about this topic in this subreddit.`;

  const userPrompt = `Company: ${company.name}
Topic/Keyword: ${keyword}
Subreddit: r/${subreddit}

Available personas:
${personasList}

Which persona would naturally post about "${keyword}" in r/${subreddit}?

Return ONLY the persona's username, nothing else.`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 50,
    });

    const username = completion.choices[0]?.message?.content?.trim() || '';
    
    // Find matching persona
    const persona = personas.find(p => 
      p.username.toLowerCase() === username.toLowerCase()
    );
    
    if (persona) {
      return { id: persona.id || persona.username, username: persona.username };
    }
    
    // Default to first persona if no match
    const defaultPersona = personas[0];
    if (!defaultPersona) {
      throw new Error('No personas available');
    }
    return { id: defaultPersona.id || defaultPersona.username, username: defaultPersona.username };
  } catch (error) {
    console.error('Error assigning persona:', error);
    // Default to first persona on error
    const defaultPersona = personas[0];
    if (!defaultPersona) {
      throw new Error('No personas available');
    }
    return { id: defaultPersona.id || defaultPersona.username, username: defaultPersona.username };
  }
}
