# Quick Start with AI Integration

## ⚡ 3 Steps to Get Started

### 1. Install Dependencies

```bash
npm install
```

This installs Next.js, React, TypeScript, and the OpenAI package.

### 2. Set Up OpenAI API Key

Create `.env.local` in the project root:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Get your API key:**
- Go to https://platform.openai.com/api-keys
- Sign up/login and create a new secret key
- Copy and paste it into `.env.local`

### 3. Run the Server

```bash
npm run dev
```

Then visit: `http://localhost:3000/test`

## 🎯 What's Different Now?

### Before (Template-based)
- ❌ Static, repetitive content
- ❌ Comments didn't actually respond to posts
- ❌ Same responses every time

### Now (AI-powered)
- ✅ **Dynamic, unique content** every time
- ✅ **Context-aware comments** that actually read and respond to posts
- ✅ **Human-like writing** with natural imperfections
- ✅ **Persona voices** maintained through AI system prompts
- ✅ **Never repetitive** - every generation is unique

## 🧠 How It Works

1. **Post Generation**: 
   - AI receives persona traits, keywords, and context
   - Generates authentic, human-like post titles and bodies
   - Each post is unique and matches the persona's voice

2. **Comment Generation**:
   - AI reads the actual post content
   - Reads existing comments in the thread
   - Generates contextually relevant responses
   - Maintains persona voice while being natural

## 📊 Example Output

**Post:**
```
Title: "Anyone else drowning in slide creation? Looking for something that actually works"
Body: "I've been spending way too much time creating presentations for my team. We're doing everything manually and it's killing our productivity. Anyone found a good solution that integrates well with our workflow? Not looking for something flashy, just something that works."
- Riley (Operations Manager)
```

**Comment:**
```
"From an ops perspective, this hits home. We tried a few tools and most of them looked great in demos but didn't actually fit our process. The key is finding something that works with your existing tools, not replaces them. What's your current stack?"
- Jordan (Consultant)
```

Notice how the comment:
- Actually responds to Riley's frustration
- References specific points (manual work, integration)
- Maintains Jordan's consultant voice
- Feels like a real conversation

## 💰 Cost Estimate

Using GPT-4:
- ~$0.10-0.15 per calendar (5 posts + ~15 comments)
- Very affordable for automated content generation

Want cheaper? Switch to GPT-3.5-turbo in `lib/gpt.ts`

## 🐛 Troubleshooting

**"OPENAI_API_KEY not set"**
- Make sure `.env.local` exists in project root
- Restart server after creating the file

**Rate limit errors**
- OpenAI free tier: 3 requests/min
- Paid tier has higher limits
- Consider upgrading if needed

See `OPENAI_SETUP.md` for detailed troubleshooting.

