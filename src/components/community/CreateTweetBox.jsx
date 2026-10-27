import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { tweetService } from '../../api/tweetService';
import { DEFAULT_AVATAR_SVG } from '../../utils/formatters';

export default function CreateTweetBox({ onTweetCreated }) {
  const { user, isAuthenticated, requireAuth } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    requireAuth('Sign in to publish a community post', async () => {
      setSubmitting(true);
      setError('');
      try {
        const created = await tweetService.createTweet(content.trim());
        setContent('');
        if (onTweetCreated) {
          onTweetCreated(created || {
            _id: `t_${Date.now()}`,
            content: content.trim(),
            likesCount: 0,
            isLiked: false,
            createdAt: new Date().toISOString(),
            owner: user
          });
        }
      } catch (err) {
        console.error('Failed to create community post:', err);
        setError(err.response?.data?.message || 'Failed to publish post.');
      } finally {
        setSubmitting(false);
      }
    });
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 14,
      padding: 18,
      marginBottom: 20
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <img
          src={user?.avatar || DEFAULT_AVATAR_SVG}
          alt="You"
          className="channel-avatar"
          style={{ width: 40, height: 40 }}
        />

        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea
            className="form-input"
            rows={3}
            placeholder={isAuthenticated ? "Post an update to your community..." : "Sign in to post a community update..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onClick={() => {
              if (!isAuthenticated) requireAuth('Sign in to post a community update');
            }}
            disabled={submitting}
            style={{ resize: 'vertical' }}
          />

          {error && (
            <span style={{ fontSize: '0.8rem', color: '#ff6b6b' }}>{error}</span>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {content.length} characters
            </span>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !content.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 20px',
                fontSize: '0.88rem'
              }}
            >
              <Send size={15} />
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
