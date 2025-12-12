# OpenAI API Setup Guide

## Quick Setup

1. **Get an OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Add to Your Project**
   - Create a file named `.env.local` in the project root
   - Add this line:
     ```
     OPENAI_API_KEY=sk-your-actual-key-here
     ```
   - Replace `sk-your-actual-key-here` with your actual API key

3. **Restart Your Server**
   - Stop your Next.js server (Ctrl+C)
   - Start it again: `npm run dev`

## How It Works

The system uses **GPT-4** to generate:
- **Dynamic post titles** - Unique each time, matching persona voice
- **Authentic post bodies** - Natural, human-like writing
- **Context-aware comments** - Actually respond to post content

### API Usage

- **Model**: GPT-4
- **Temperature**: 0.9-0.95 (for natural variation)
- **Max Tokens**: 100-500 (depending on content type)

### Cost Estimate

- GPT-4 pricing: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- Typical generation:
  - Post title: ~$0.001
  - Post body: ~$0.01
  - Comment: ~$0.005
- **Per calendar (5 posts, ~15 comments)**: ~$0.10-0.15

### Alternative Models

If you want to use cheaper models, edit `lib/gpt.ts` and change:
- `model: 'gpt-4'` → `model: 'gpt-3.5-turbo'`
- Note: GPT-3.5-turbo is faster and cheaper but may be less creative

## Troubleshooting

**Error: "OPENAI_API_KEY environment variable is not set"**
- Make sure `.env.local` exists in the project root
- Make sure the file contains: `OPENAI_API_KEY=sk-...`
- Restart your Next.js server after creating/editing `.env.local`

**Error: "Incorrect API key provided"**
- Check that your API key is correct
- Make sure there are no extra spaces or quotes
- Verify your OpenAI account has credits/usage limits

**Rate Limit Errors**
- OpenAI has rate limits based on your plan
- Free tier: 3 requests/min
- Paid tier: Higher limits
- Consider adding delays between requests if needed

## Security Note

- **Never commit `.env.local` to git** (it's already in `.gitignore`)
- **Never share your API key publicly**
- **Rotate keys** if exposed

