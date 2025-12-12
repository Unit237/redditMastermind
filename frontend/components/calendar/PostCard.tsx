"use client";

import { Post, Comment } from "@/types";

type PostCardProps = {
  post: Post;
  comments: Comment[];
};

export default function PostCard({ post, comments }: PostCardProps) {
  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 space-y-3">
      {/* Meta */}
      <div className="text-xs text-gray-500">
        <span className="text-blue-600 font-medium">
          r/{post.subreddit}
        </span>{" "}
        · {post.author_username} · {new Date(post.timestamp).toLocaleString()}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold">{post.title}</h3>

      {/* Body */}
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

      {/* Comments */}
      {comments.length > 0 && (
        <div className="border-t pt-3 space-y-2">
          {comments.map((c) => (
            <div key={c.comment_id} className="text-sm text-gray-600">
              <span className="font-medium">{c.username}</span>: {c.comment_text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
