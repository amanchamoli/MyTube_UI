import React, { useState } from 'react';
import { Link } from 'react-router';
import { ThumbsUp, ThumbsDown, MessageSquare, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import { tweetService } from '../../api/tweetService';
import { useAuth } from '../../context/AuthContext';
import { timeAgo, DEFAULT_AVATAR_SVG } from '../../utils/formatters';

export default function TweetCard({ tweet, onTweetUpdated, onTweetDeleted }) {
  const { user, requireAuth } = useAuth();

  const [isLiked, setIsLiked] = useState(Boolean(tweet.isLiked));
  const [likesCount, setLikesCount] = useState(tweet.likesCount || 0);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(tweet.content || '');
  const [saving, setSaving] = useState(false);

  const isOwner =
    user &&
    (user._id === tweet.owner?._id ||
      user._id === tweet.owner ||
      user.username === tweet.owner?.username);

  const handleLikeToggle = () => {
    requireAuth('Sign in to like this community post', async () => {
      try {
        const res = await tweetService.toggleTweetLike(tweet._id);
        const nextState = res?.isLiked !== undefined ? res.isLiked : !isLiked;
        setIsLiked(nextState);
        setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
      } catch (err) {
        console.error('Failed to toggle tweet like:', err);
      }
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setSaving(true);
    try {
      const updated = await tweetService.updateTweet(tweet._id, editText.trim());
      setIsEditing(false);
      if (onTweetUpdated) {
        onTweetUpdated(updated || { ...tweet, content: editText.trim() });
      }
    } catch (err) {
      console.error('Failed to update tweet:', err);
      alert('Failed to update post.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this community post permanently?')) return;
    try {
      await tweetService.deleteTweet(tweet._id);
      if (onTweetDeleted) {
        onTweetDeleted(tweet._id);
      }
    } catch (err) {
      console.error('Failed to delete tweet:', err);
      alert('Failed to delete post.');
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 14,
      padding: 20,
      marginBottom: 16
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <Link to={`/c/${tweet.owner?.username}`}>
          <img
            src={tweet.owner?.avatar || DEFAULT_AVATAR_SVG}
            alt={tweet.owner?.fullname || tweet.owner?.username}
            className="channel-avatar"
            style={{ width: 44, height: 44 }}
          />
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Link
                to={`/c/${tweet.owner?.username}`}
                style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}
              >
                {tweet.owner?.fullname || tweet.owner?.username || 'Creator'}
              </Link>
              <CheckCircle2 size={15} color="var(--text-secondary)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {timeAgo(tweet.createdAt)}
              </span>
            </div>

            {isOwner && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="icon-btn"
                  style={{ width: 30, height: 30 }}
                  onClick={() => setIsEditing(!isEditing)}
                  title="Edit post"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  className="icon-btn"
                  style={{ width: 30, height: 30, color: '#ff6b6b' }}
                  onClick={handleDelete}
                  title="Delete post"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Post Content or Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '8px 0' }}>
              <textarea
                className="form-input"
                rows={3}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                disabled={saving}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="pill-btn"
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '6px 16px', fontSize: '0.82rem' }}
                  disabled={saving || !editText.trim()}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            <p style={{
              fontSize: '0.92rem',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              margin: '8px 0 14px 0'
            }}>
              {tweet.content}
            </p>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.84rem',
                color: isLiked ? 'var(--yt-blue)' : 'var(--text-secondary)'
              }}
              onClick={handleLikeToggle}
              title="Like"
            >
              <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{likesCount > 0 ? likesCount : ''}</span>
            </button>

            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.84rem',
                color: 'var(--text-secondary)'
              }}
              onClick={() => requireAuth('Sign in to dislike this post')}
              title="Dislike"
            >
              <ThumbsDown size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
