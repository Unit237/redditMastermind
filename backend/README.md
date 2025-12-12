# Reddit Content Calendar Generator

A Next.js module for automatically generating weekly Reddit content calendars with posts and comments assigned to personas.

## Features

- **5 Pre-defined Personas**: Each with unique writing styles, tones, and keyword preferences
- **16 Keywords**: K1-K16 covering AI presentation tools, alternatives, and business needs
- **Smart Distribution**: Balanced posting across personas and subreddits
- **Human-like Content**: Posts and comments that reflect persona personality and tone
- **Realistic Timestamps**: Random post times with comments appearing 5-50 minutes after

## Project Structure

```
lib/
  ├── types.ts              # TypeScript interfaces
  ├── personas.ts           # 5 persona definitions
  ├── keywords.ts           # K1-K16 keyword mappings
  ├── utils.ts              # Helper functions
  └── planner/
      └── generateCalendar.ts  # Main calendar generation logic

pages/
  └── api/
      └── generate-week.ts  # API endpoint
```

## Personas

1. **riley_ops** - Operations manager, pragmatic and detail-oriented
2. **jordan_consults** - Independent consultant, enthusiastic about tools
3. **emily_econ** - Economics PhD student, analytical and curious
4. **alex_sells** - Sales director, results-driven and competitive
5. **priya_pm** - Product manager, user-centric with strong UX opinions

## Keywords (K1-K16)

- K1: best ai presentation maker
- K2: ai slide deck tool
- K3: pitch deck generator
- K4: alternatives to PowerPoint
- K5: how to make slides faster
- K6: design help for slides
- K7: Canva alternative for presentations
- K8: Claude vs Slideforge
- K9: best tool for business decks
- K10: automate my presentations
- K11: need help with pitch deck
- K12: tools for consultants
- K13: tools for startups
- K14: best ai design tool
- K15: Google Slides alternative
- K16: best storytelling tool

## API Usage

### Endpoint

```
POST /api/generate-week
```

### Request Body

```json
{
  "companyInfo": "Optional company description",
  "subreddits": ["Entrepreneur", "startups", "consulting"],
  "targetQueries": [],  // Empty = use all keywords
  "postsPerWeek": 5,
  "startDate": "2024-01-01"  // Optional, defaults to current week
}
```

### Response

```json
{
  "weekStart": "2024-01-01",
  "weekEnd": "2024-01-07",
  "posts": [
    {
      "post_id": "post_...",
      "subreddit": "Entrepreneur",
      "title": "Looking for best ai presentation maker",
      "body": "...",
      "author_username": "Jordan",
      "author_persona_id": "jordan_consults",
      "timestamp": "2024-01-01T10:30:00.000Z",
      "keyword_ids": ["K1", "K9"]
    }
  ],
  "comments": [
    {
      "comment_id": "comment_...",
      "post_id": "post_...",
      "parent_comment_id": null,
      "comment_text": "...",
      "username": "Riley",
      "persona_id": "riley_ops",
      "timestamp": "2024-01-01T10:45:00.000Z"
    }
  ]
}
```

## Testing

### Method 1: Browser Test Page

1. Start your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Open `test-api.html` in your browser

3. Fill in the form and click "Generate Weekly Calendar"

### Method 2: curl

```bash
curl -X POST http://localhost:3000/api/generate-week \
  -H "Content-Type: application/json" \
  -d '{
    "postsPerWeek": 5,
    "subreddits": ["Entrepreneur", "startups"]
  }'
```

### Method 3: JavaScript/TypeScript

```typescript
const response = await fetch('http://localhost:3000/api/generate-week', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    postsPerWeek: 5,
    subreddits: ['Entrepreneur', 'startups'],
  }),
});

const calendar = await response.json();
console.log(calendar);
```

## Algorithm Details

1. **Keyword Selection**: Samples 1-3 keywords weighted by persona preferences
2. **Persona Assignment**: Chooses persona based on keyword overlap (weighted)
3. **Subreddit Distribution**: Balances posts across subreddits (no overuse)
4. **Post Generation**: Creates title and body matching persona tone and style
5. **Comment Generation**: 2-4 comments per post from other personas
6. **Timestamp Assignment**: 
   - Posts: Random times during the week
   - Comments: 5-50 minutes after parent post/comment
7. **Constraints**:
   - No repeated titles
   - No persona exceeds 40% of posts
   - No repetitive keywords per post
   - Comments feel conversational and human

## Example Output

```json
{
  "weekStart": "2024-01-01",
  "weekEnd": "2024-01-07",
  "posts": [
    {
      "post_id": "post_1704110400000_abc123",
      "subreddit": "Entrepreneur",
      "title": "Looking for best ai presentation maker",
      "body": "From my experience working with clients, best ai presentation maker is a common pain point...",
      "author_username": "Jordan",
      "author_persona_id": "jordan_consults",
      "timestamp": "2024-01-01T10:30:00.000Z",
      "keyword_ids": ["K1"]
    }
  ],
  "comments": [
    {
      "comment_id": "comment_1704110700000_xyz789",
      "post_id": "post_1704110400000_abc123",
      "parent_comment_id": null,
      "comment_text": "We tried that approach. It worked well for us...",
      "username": "Riley",
      "persona_id": "riley_ops",
      "timestamp": "2024-01-01T10:45:00.000Z"
    }
  ]
}
```

## Requirements

- Next.js (Pages Router)
- TypeScript
- OpenAI API key (for AI-powered content generation)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up OpenAI API key:**
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a `.env.local` file in the project root:
     ```
     OPENAI_API_KEY=sk-your-api-key-here
     ```
   - The API will use GPT-4 to generate dynamic, human-like posts and comments

## Customization

### Add More Personas

Edit `lib/personas.ts` and add new persona objects with:
- `id`, `name`, `background`, `attitude`, `tone`, `style`, `emotionalManifestation`, `keywordPreferences`

### Add More Keywords

Edit `lib/keywords.ts` and add new keyword entries.

### Modify Generation Logic

Edit `lib/utils.ts` functions:
- `generateTitle()` - Customize title templates
- `generateBody()` - Customize body templates per persona
- `generateCommentText()` - Customize comment templates

## AI-Powered Generation

This system uses **OpenAI GPT-4** to generate dynamic, human-like content:

- **Posts**: Each post is uniquely generated based on keywords, persona traits, and context
- **Comments**: Comments are context-aware and actually respond to the post content
- **Persona Voices**: AI maintains consistent persona personalities while generating varied content
- **Human-like**: Content includes natural imperfections, casual language, and authentic responses
- **No Templates**: Every generation is unique - no repetitive template responses

### How It Works

1. **Post Generation**: AI receives persona traits, keywords, and company context, then generates authentic-sounding posts
2. **Comment Generation**: AI reads the actual post content and existing comments, then writes contextually relevant responses
3. **Persona Consistency**: System prompts guide the AI to maintain each persona's unique voice, tone, and style

## Notes

- All content is dynamically generated by AI, not templates
- Comments actually read and respond to post content (context-aware)
- Timestamps ensure comments appear naturally after posts
- Distribution algorithms prevent spam-like patterns
- Each persona maintains their distinct voice through AI system prompts
- Content varies every time - never repetitive

