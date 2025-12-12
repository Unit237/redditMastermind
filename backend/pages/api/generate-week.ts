import type { NextApiRequest, NextApiResponse } from 'next';
import { generateWeeklyCalendar } from '../../lib/planner/generateCalendar';
import { GenerateCalendarInput, GenerateCalendarOutput, Persona, CompanyInfo, TargetQuery } from '../../lib/types';

interface GenerateWeekRequest {
  company: {
    name: string;
    website?: string;
    description: string;
  };
  personas: Persona[];
  subreddits: string[]; // Array of subreddit names
  targetQueries: TargetQuery[]; // Array of {keyword_id, keyword}
  postsPerWeek: number;
  startDate?: string;
  weekOffset?: number; // 0 = current week, 1 = next week, etc.
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateCalendarOutput | { error: string }>
) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body: GenerateWeekRequest = req.body;

    // Validate required fields
    if (!body.company || !body.company.name || !body.company.description) {
      return res.status(400).json({
        error: 'Company name and description are required',
      });
    }

    if (!body.personas || !Array.isArray(body.personas) || body.personas.length === 0) {
      return res.status(400).json({
        error: 'At least one persona is required',
      });
    }

    if (!body.subreddits || !Array.isArray(body.subreddits) || body.subreddits.length === 0) {
      return res.status(400).json({
        error: 'At least one subreddit is required',
      });
    }

    // Validate personas have required fields
    for (const persona of body.personas) {
      if (!persona.username) {
        return res.status(400).json({
          error: 'Each persona must have a username',
        });
      }
      if (!persona.info) {
        return res.status(400).json({
          error: 'Each persona must have info/description',
        });
      }
    }

    // Validate target queries
    if (!body.targetQueries || !Array.isArray(body.targetQueries) || body.targetQueries.length === 0) {
      return res.status(400).json({
        error: 'At least one target query (keyword) is required',
      });
    }

    for (const query of body.targetQueries) {
      if (!query.keyword_id || !query.keyword) {
        return res.status(400).json({
          error: 'Each target query must have keyword_id and keyword',
        });
      }
    }

    const input: GenerateCalendarInput = {
      company: {
        name: body.company.name,
        website: body.company.website,
        description: body.company.description,
      },
      personas: body.personas,
      subreddits: body.subreddits,
      targetQueries: body.targetQueries,
      postsPerWeek: body.postsPerWeek || 5,
      startDate: body.startDate,
      weekOffset: body.weekOffset || 0,
    };

    // Validate input
    if (input.postsPerWeek < 1 || input.postsPerWeek > 20) {
      return res.status(400).json({
        error: 'postsPerWeek must be between 1 and 20',
      });
    }

    // Generate calendar
    const output = await generateWeeklyCalendar(input);

    // Return the calendar
    res.status(200).json(output);
  } catch (error) {
    console.error('Error generating weekly calendar:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    res.status(500).json({
      error: `Failed to generate calendar: ${errorMessage}`,
    });
  }
}
