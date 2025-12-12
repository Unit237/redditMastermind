# Reddit Mastermind

A full-stack application for generating Reddit content calendars with AI-powered post and comment generation.

## Project Structure

```
reddit-mastermind/
├── backend/     # Next.js API server (port 3001)
└── frontend/    # Next.js frontend app (port 3000)
```

## Quick Start

### Option 1: Run Both Together (Recommended)

```bash
# Install all dependencies
npm run install:all

# Run both backend and frontend
npm run dev
```

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev  # Runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

## Environment Setup

### Backend

Create `backend/.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Frontend

Create `frontend/.env.local` (optional):
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

If not set, it defaults to `http://localhost:3001`.

## Usage

1. Open http://localhost:3000 in your browser
2. Fill in the setup form:
   - Company information
   - Personas (username, background/description)
   - Subreddits (one per line, without r/ prefix)
   - Target queries (format: "K1: query text" or just "query text")
3. Click "Generate Content Calendar"
4. View the generated calendar in Feed or Table view

## API Endpoint

The backend API is available at:
- `POST http://localhost:3001/api/generate-week`

See `backend/pages/api/generate-week.ts` for request/response format.
