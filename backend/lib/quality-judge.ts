import OpenAI from "openai";
import { GeneratedPost, GeneratedComment } from "./types";

// 1. Define the shape of our "Judge's" verdict
export interface QualityAssessment {
  score: number; // 0-10
  verdict: "EXCELLENT" | "PASSABLE" | "SUSPECT" | "SPAM";
  reasoning: string;
  flagged_segments: string[]; // Specific quotes that sounded fake
  suggestions: string[]; // How to fix it
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function evaluateThreadQuality(
  post: GeneratedPost,
  comments: GeneratedComment[],
  subreddit: string
): Promise<QualityAssessment> {
  
  // 2. Prepare the content for the judge to read
  const threadTranscript = `
    SUBREDDIT: r/${subreddit}
    
    [POST]
    Title: ${post.title}
    Body: ${post.body}
    Author: ${post.author_persona_id}
    
    [COMMENTS]
    ${comments.map(c => `
      User (${c.persona_id}): ${c.comment_text}
      (Replying to: ${c.parent_comment_id || 'Main Post'})
    `).join('\n')}
  `;

  // 3. The "Hostile Judge" System Prompt
  const systemPrompt = `
    You are a cynical, veteran Reddit moderator and community manager. 
    Your job is to detect "shill" marketing, astroturfing, and AI-generated content.
    
    Analyze the provided Reddit thread. You are looking for:
    1. MANUFACTURED CONSENSUS: Do the commenters agree too easily?
    2. VOICE: Do different accounts sound like the same person writing to themselves?
    3. RELEVANCE: Is the product mention forced or natural?
    4. TONE: Is the slang used correctly for r/${subreddit}?

    Rate the thread on a scale of 0-10, where:
    10 = Indistinguishable from organic conversation. Top tier.
    5 = Obviously promotional but acceptable.
    0 = Blatant spam/bot behavior. Immediate ban.

    Return ONLY a JSON object matching this structure:
    {
      "score": number,
      "reasoning": "string explanation",
      "flagged_segments": ["array of specific quotes that sound fake"],
      "suggestions": ["specific advice to improve authenticity"]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use the smartest model for judging
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: threadTranscript }
      ],
      response_format: { type: "json_object" }, // Force valid JSON back
      temperature: 0.2, // Low temp for consistent, critical grading
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // 4. Map the score to a verdict label
    let verdict: QualityAssessment['verdict'] = "PASSABLE";
    if (result.score >= 9) verdict = "EXCELLENT";
    else if (result.score < 5) verdict = "SPAM";
    else if (result.score < 7) verdict = "SUSPECT";

    return {
      score: result.score,
      verdict,
      reasoning: result.reasoning,
      flagged_segments: result.flagged_segments || [],
      suggestions: result.suggestions || []
    };

  } catch (error) {
    console.error("Judge failed to rule:", error);
    // Fallback if the judge crashes (don't break the app)
    return {
      score: 0,
      verdict: "SUSPECT",
      reasoning: "Automated evaluation failed.",
      flagged_segments: [],
      suggestions: []
    };
  }
}

