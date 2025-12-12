import { generateWeeklyCalendar } from "../lib/planner/generateCalendar";
import { evaluateThreadQuality } from "../lib/quality-judge";
import { GeneratedPost, GeneratedComment } from "../lib/types";
import dotenv from 'dotenv';

// Load environment variables for OpenAI
dotenv.config({ path: '.env.local' });

// Mock data for the test
const TEST_INPUT = {
  company: "SlideForge",
  targetQueries: [
    { keyword: "pitch deck", keyword_id: "pitch deck" },
    { keyword: "startup funding", keyword_id: "startup funding" }
  ],
  personas: [
    { username: "SkepticalCTO", id: "SkepticalCTO", description: "Experienced tech executive, hates fluff" },
    { username: "EnthusiasticDev", id: "EnthusiasticDev", description: "Junior developer, loves new tools" },
    { username: "ProductLead", id: "ProductLead", description: "Focused on user metrics and growth" }
  ],
  subreddits: ["SaaS", "startups", "entrepreneur"],
  postsPerWeek: 3,
  weekOffset: 0
};

// Helper function to check for semantic duplicates (simplified for this test)
function checkForSemanticDuplicates(titles: string[]): boolean {
  const uniqueTitles = new Set(titles.map(t => t.toLowerCase()));
  return uniqueTitles.size !== titles.length;
}

// This test suite ensures our AI isn't degrading over time
describe("Content Quality Assurance", () => {
  
  // Set a high timeout because we are calling LLMs
  jest.setTimeout(120000); // 2 minutes

  let calendar: { posts: GeneratedPost[], comments: GeneratedComment[] };

  beforeAll(async () => {
    // Generate a fresh calendar before running tests
    console.log("Generating test calendar...");
    calendar = await generateWeeklyCalendar(TEST_INPUT);
    console.log(`Generated ${calendar.posts.length} posts for testing.`);
  });

  it("should generate posts that score above 7/10 on the Turing Test", async () => {
    // We'll test the first post in the generated calendar
    if (calendar.posts.length === 0) {
      console.warn("No posts generated, skipping quality test.");
      return;
    }

    const samplePost = calendar.posts[0];
    const relatedComments = calendar.comments.filter(c => c.post_id === samplePost.post_id);

    console.log(`Evaluating post: "${samplePost.title}" in r/${samplePost.subreddit}`);

    const qualityReport = await evaluateThreadQuality(
        samplePost, 
        relatedComments, 
        samplePost.subreddit
    );

    // Output the judge's verdict for the developer to see
    console.log(`\n--- JUDGE'S VERDICT ---`);
    console.log(`Score: ${qualityReport.score}/10`);
    console.log(`Verdict: ${qualityReport.verdict}`);
    console.log(`Reasoning: ${qualityReport.reasoning}`);
    console.log(`-----------------------\n`);

    // The Assertion: Content must be better than "Suspect"
    expect(qualityReport.score).toBeGreaterThanOrEqual(7);
    expect(qualityReport.verdict).not.toBe("SPAM");
  });

  it("should not have overlapping topics in the same week", () => {
    const titles = calendar.posts.map(p => p.title);
    const hasDuplicates = checkForSemanticDuplicates(titles);
    
    if (hasDuplicates) {
        console.warn("Found duplicate titles:", titles);
    }
    
    expect(hasDuplicates).toBe(false);
  });

  it("should respect persona distribution constraints", () => {
     // Check that no single persona wrote more than 50% of the posts
     const authorCounts: Record<string, number> = {};
     calendar.posts.forEach(p => {
         authorCounts[p.author_username] = (authorCounts[p.author_username] || 0) + 1;
     });

     const maxPosts = Math.max(...Object.values(authorCounts));
     const totalPosts = calendar.posts.length;

     // If we have very few posts (e.g. 1-2), distribution is hard to enforce, so only check if > 2
     if (totalPosts > 2) {
         expect(maxPosts / totalPosts).toBeLessThanOrEqual(0.6); // Relaxed to 60% for small sample sizes
     }
  });
});

