// components/calendar/PostFeed.tsx
import { MOCK_POSTS, MOCK_COMMENTS } from '@/lib/mockData';
import PostCard from './PostCard';
import { Post, Comment } from '@/types';

export default function PostFeed() {
  // Convert mock data to match Post type structure
  const convertedPosts: Post[] = MOCK_POSTS.map(p => ({
    post_id: p.id,
    subreddit: p.subreddit.replace(/^r\//, ''),
    title: p.title,
    body: p.body,
    author_username: p.author,
    author_persona_id: p.author,
    author_persona_name: p.author,
    timestamp: p.timestamp,
    keyword_ids: p.keywords,
  }));

  const convertedComments: Comment[] = MOCK_COMMENTS.map(c => ({
    comment_id: c.id,
    post_id: c.postId,
    parent_comment_id: c.parentId || null,
    comment_text: c.text,
    username: c.username,
    persona_id: c.username,
    timestamp: c.timestamp,
  }));

  return (
    <div className="space-y-6">
      {convertedPosts.map(post => (
        <PostCard
          key={post.post_id}
          post={post}
          comments={convertedComments.filter(c => c.post_id === post.post_id)}
        />
      ))}
    </div>
  );
}
