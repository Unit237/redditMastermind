"use client";

import React, { useState } from "react";
import { FileText, Users } from "lucide-react";
import { CalendarOutput } from "@/types";
import { MOCK_POSTS, MOCK_COMMENTS } from "@/lib/mockData";

type ContentCalendarProps = {
  data: CalendarOutput | null;
  allWeeks?: CalendarOutput[];
  onGenerateNextWeek?: () => void;
  loadingNextWeek?: boolean;
};

export default function ContentCalendar({ 
  data, 
  allWeeks = [], 
  onGenerateNextWeek,
  loadingNextWeek = false 
}: ContentCalendarProps) {
  const [view, setView] = useState<"table" | "feed">("feed");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState<number | null>(null);

  // Use data from selected week or current data
  const displayData = selectedWeekOffset !== null 
    ? allWeeks.find(w => w.weekOffset === selectedWeekOffset) || data
    : data;

  // Use real data if available, otherwise use mock data
  const posts = displayData?.posts || MOCK_POSTS.map(p => ({
    post_id: p.id,
    subreddit: p.subreddit.replace(/^r\//, ''), // Remove r/ prefix for consistency
    title: p.title,
    body: p.body,
    author_username: p.author,
    author_persona_id: p.author,
    author_persona_name: p.author,
    timestamp: p.timestamp,
    keyword_ids: p.keywords, // Mock data uses keywords array as keyword_ids
    keywords: undefined, // Mock data doesn't have separate keywords
  }));

  const comments = displayData?.comments || MOCK_COMMENTS.map(c => ({
    comment_id: c.id,
    post_id: c.postId,
    parent_comment_id: c.parentId || null,
    comment_text: c.text,
    username: c.username,
    persona_id: c.username,
    timestamp: c.timestamp,
  }));

  return (
    <div className="max-w-7xl mx-auto py-6 px-6">
      {/* Header with Week Selection and Generate Next Week Button */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Generated Content Calendar</h2>
            {allWeeks.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Using same inputs: {allWeeks[0].posts.length > 0 ? `${allWeeks[0].posts.length} posts/week` : ''} • Same personas, subreddits, and keywords
              </p>
            )}
          </div>
          {onGenerateNextWeek && (
            <button
              onClick={onGenerateNextWeek}
              disabled={loadingNextWeek}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm"
              title="Generate next week using the same company info, personas, subreddits, and keywords from Setup"
            >
              {loadingNextWeek ? 'Generating Next Week...' : '+ Generate Next Week'}
            </button>
          )}
        </div>

        {/* Week Selector */}
        {allWeeks.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">View Week:</span>
            {allWeeks.map((week) => (
              <button
                key={week.weekOffset}
                onClick={() => setSelectedWeekOffset(week.weekOffset || 0)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  selectedWeekOffset === week.weekOffset || (selectedWeekOffset === null && week.weekOffset === 0)
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border text-gray-700 hover:bg-gray-50'
                }`}
              >
                Week {week.weekOffset !== undefined ? week.weekOffset + 1 : 1}
                {week.weekStart && (
                  <span className="ml-1 text-xs opacity-75">
                    ({new Date(week.weekStart).toLocaleDateString()})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <div></div>
        <div className="flex items-center border rounded-lg p-1 bg-white">
          <button
            onClick={() => setView("feed")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              view === "feed"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Feed View
          </button>
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              view === "table"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Table View
          </button>
        </div>
      </div>

      {!displayData && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          Showing mock data. Generate a calendar from the Setup tab to see real data.
        </div>
      )}

      {displayData && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
          <strong>Week {displayData.weekOffset !== undefined ? displayData.weekOffset + 1 : 1}:</strong> {displayData.weekStart} to {displayData.weekEnd}
        </div>
      )}

      {/* FEED VIEW (Claude-style) */}
      {view === "feed" && (
        <div className="space-y-6">
          {posts.map((post) => {
            const postComments = comments.filter(
              (c) => c.post_id === post.post_id
            );

            return (
              <div
                key={post.post_id}
                className="bg-white border rounded-lg shadow-sm p-4 space-y-3"
              >
                {/* Meta */}
                <div className="text-xs text-gray-500">
                  <span className="text-blue-600 font-medium">
                    r/{post.subreddit}
                  </span>{" "}
                  · {post.author_username} · {new Date(post.timestamp).toLocaleString()}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-gray-700">{post.body}</p>

                {/* Keywords */}
                {((post.keyword_ids && post.keyword_ids.length > 0) || (post.keywords && post.keywords.length > 0)) && (
                  <div className="flex flex-wrap gap-2">
                    {post.keyword_ids && post.keyword_ids.map((k) => (
                      <span
                        key={k}
                        className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium"
                      >
                        {k}
                      </span>
                    ))}
                    {post.keywords && post.keywords.map((k) => (
                      <span
                        key={k}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                )}

                {/* Comments - show nested structure */}
                {postComments.length > 0 && (
                  <div className="border-t pt-3 space-y-2">
                    {renderComments(postComments, null, 0)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW (matching the spreadsheet format) */}
      {view === "table" && (
        <div className="space-y-6">
          {/* Posts Table */}
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="bg-gray-100 border-b px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Posts</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <FileText className="w-4 h-4 text-gray-500" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">post_id</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">subreddit</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">title</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">body</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">author_username</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">timestamp</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">keyword_ids</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr 
                      key={post.post_id} 
                      data-post-id={post.post_id}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedPostId === post.post_id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedPostId(selectedPostId === post.post_id ? null : post.post_id)}
                    >
                      <td className="px-3 py-2 font-mono text-xs text-gray-700 font-semibold">{post.post_id}</td>
                      <td className="px-3 py-2 text-blue-600 font-medium">{post.subreddit.startsWith('r/') ? post.subreddit : `r/${post.subreddit}`}</td>
                      <td className="px-3 py-2 text-gray-900">{post.title}</td>
                      <td className="px-3 py-2 text-gray-600 max-w-md">{post.body}</td>
                      <td className="px-3 py-2 text-gray-700">{post.author_username}</td>
                      <td className="px-3 py-2 text-gray-600 font-mono text-xs">
                        {formatTimestamp(post.timestamp)}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {post.keyword_ids?.join(", ") || ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comments Table */}
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="bg-gray-100 border-b px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Comments</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <Users className="w-4 h-4 text-gray-500" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">comment_id</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">post_id</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">parent_comment_id</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">comment_text</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">username</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comments.map((c) => {
                    const relatedPost = posts.find(p => p.post_id === c.post_id);
                    return (
                    <tr 
                      key={c.comment_id} 
                      className={`hover:bg-gray-50 ${selectedPostId === c.post_id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-3 py-2 font-mono text-xs text-gray-700 font-semibold">{c.comment_id}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPostId(c.post_id);
                            // Scroll to the post in the Posts table
                            const postRow = document.querySelector(`[data-post-id="${c.post_id}"]`);
                            if (postRow) {
                              postRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                          title={relatedPost ? `Go to post: ${relatedPost.title}` : `Post ${c.post_id}`}
                        >
                          {c.post_id}
                        </button>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-gray-500">
                        {c.parent_comment_id || ""}
                      </td>
                      <td className="px-3 py-2 text-gray-600">{c.comment_text}</td>
                      <td className="px-3 py-2 text-gray-700">{c.username}</td>
                      <td className="px-3 py-2 text-gray-600 font-mono text-xs">
                        {formatTimestamp(c.timestamp)}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to render nested comments
  function renderComments(allComments: typeof comments, parentId: string | null, depth: number = 0) {
    const children = allComments.filter(c => c.parent_comment_id === parentId);
    
    return (
      <>
        {children.map((comment) => (
          <div key={comment.comment_id} style={{ marginLeft: `${depth * 1.5}rem` }}>
            <div className="text-sm text-gray-700">
              <span className="font-medium">{comment.username}</span>:{" "}
              {comment.comment_text}
            </div>
            {renderComments(allComments, comment.comment_id, depth + 1)}
          </div>
        ))}
      </>
    );
  }

  // Helper function to format timestamp like "2025-12-08 14:12"
  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}
