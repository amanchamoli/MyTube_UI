import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Edit2,
  Trash2,
  Send,
  Loader2,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  SortDesc
} from 'lucide-react';
import { commentService } from '../../api/commentService';
import { useAuth } from '../../context/AuthContext';
import { timeAgo, DEFAULT_AVATAR_SVG } from '../../utils/formatters';

export default function CommentsSection({ videoId }) {
  const { user, isAuthenticated, requireAuth } = useAuth();

  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // New comment input
  const [newCommentText, setNewCommentText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Editing comment
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editDraftText, setEditDraftText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Active menu dropdown for comment action
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Sort: 'top' | 'newest'
  const [sortBy, setSortBy] = useState('newest');

  // Load comments from API
  const loadComments = async (page = 1, append = false) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await commentService.getVideoComments(videoId, { page, limit: 10 });
      let docs = res.docs || [];
      if (sortBy === 'top') {
        docs = [...docs].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      }

      if (append) {
        setComments((prev) => [...prev, ...docs]);
      } else {
        setComments(docs);
      }
      setTotalComments(res.totalDocs || docs.length);
      setCurrentPage(res.page || page);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (videoId) {
      loadComments(1, false);
    }
  }, [videoId, sortBy]);

  // 1. Add Comment (POST /comments/:videoId)
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    requireAuth('Sign in to leave a comment', async () => {
      setSubmittingComment(true);
      try {
        const created = await commentService.addComment(videoId, newCommentText.trim());
        const commentObj = created || {
          _id: `temp_${Date.now()}`,
          content: newCommentText.trim(),
          likesCount: 0,
          isLiked: false,
          createdAt: new Date().toISOString(),
          owner: {
            _id: user?._id,
            username: user?.username,
            fullname: user?.fullname,
            avatar: user?.avatar
          }
        };

        setComments((prev) => [commentObj, ...prev]);
        setTotalComments((prev) => prev + 1);
        setNewCommentText('');
        setInputFocused(false);
      } catch (err) {
        console.error('Failed to post comment:', err);
        alert(err.response?.data?.message || 'Failed to post comment.');
      } finally {
        setSubmittingComment(false);
      }
    });
  };

  // 2. Toggle Comment Like (POST /likes/toggle/c/:commentId)
  const handleToggleLike = (commentId) => {
    requireAuth('Sign in to like this comment', async () => {
      try {
        const res = await commentService.toggleCommentLike(commentId);
        const nextState = res?.isLiked !== undefined ? res.isLiked : true;

        setComments((prev) =>
          prev.map((c) => {
            if (c._id === commentId) {
              const currentCount = c.likesCount || 0;
              return {
                ...c,
                isLiked: nextState,
                likesCount: nextState ? currentCount + 1 : Math.max(0, currentCount - 1),
              };
            }
            return c;
          })
        );
      } catch (err) {
        console.error('Failed to toggle comment like:', err);
      }
    });
  };

  // 3. Update Comment (PATCH /comments/c/:commentId)
  const handleStartEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditDraftText(comment.content || '');
    setActiveMenuId(null);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editDraftText.trim()) return;
    setSavingEdit(true);
    try {
      const updated = await commentService.updateComment(commentId, editDraftText.trim());
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, content: updated?.content || editDraftText.trim() }
            : c
        )
      );
      setEditingCommentId(null);
      setEditDraftText('');
    } catch (err) {
      console.error('Failed to update comment:', err);
      alert('Failed to update comment.');
    } finally {
      setSavingEdit(false);
    }
  };

  // 4. Delete Comment (DELETE /comments/c/:commentId)
  const handleDeleteComment = async (commentId) => {
    setActiveMenuId(null);
    if (!window.confirm('Delete your comment permanently?')) return;
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setTotalComments((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Failed to delete comment.');
    }
  };

  return (
    <section className="comments-section" style={{ marginTop: 24 }}>
      {/* Header with Comments Count & Sort */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 8 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          {totalComments} {totalComments === 1 ? 'Comment' : 'Comments'}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <SortDesc size={18} />
          <button
            style={{
              fontWeight: sortBy === 'newest' ? 600 : 400,
              color: sortBy === 'newest' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setSortBy('newest')}
          >
            Newest first
          </button>
          <span>•</span>
          <button
            style={{
              fontWeight: sortBy === 'top' ? 600 : 400,
              color: sortBy === 'top' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setSortBy('top')}
          >
            Top comments
          </button>
        </div>
      </div>

      {/* Add Comment Box */}
      <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', margin: '14px 0 24px' }}>
        <img
          src={user?.avatar || DEFAULT_AVATAR_SVG}
          alt="Current User"
          className="channel-avatar"
          style={{ width: 40, height: 40 }}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea
            rows={inputFocused || newCommentText ? 3 : 1}
            className="comment-input"
            placeholder={isAuthenticated ? "Add a comment..." : "Sign in to add a public comment..."}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onClick={() => {
              if (!isAuthenticated) requireAuth('Sign in to leave a comment');
            }}
            disabled={submittingComment}
            style={{
              resize: 'vertical',
              borderBottom: '1px solid ' + (inputFocused ? 'var(--yt-blue)' : 'var(--border-medium)'),
              paddingBottom: 6,
              transition: 'border-color 0.2s',
              minHeight: 36
            }}
          />

          {(inputFocused || newCommentText.trim()) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>
              <button
                type="button"
                className="pill-btn"
                onClick={() => {
                  setNewCommentText('');
                  setInputFocused(false);
                }}
                disabled={submittingComment}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '7px 18px', fontSize: '0.86rem' }}
                disabled={submittingComment || !newCommentText.trim()}
              >
                {submittingComment ? 'Posting...' : 'Comment'}
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 60, width: '100%', borderRadius: 10 }} />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <MessageSquare size={36} color="var(--text-muted)" style={{ margin: '0 auto 8px', opacity: 0.6 }} />
          <p style={{ fontSize: '0.92rem' }}>No comments yet. Be the first to share what you think!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {comments.map((comment) => {
            const isOwner =
              user &&
              (user._id === comment.owner?._id ||
                user._id === comment.owner ||
                user.username === comment.owner?.username);

            return (
              <div key={comment._id} className="comment-card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <Link to={`/c/${comment.owner?.username}`}>
                  <img
                    src={comment.owner?.avatar || DEFAULT_AVATAR_SVG}
                    alt={comment.owner?.fullname || comment.owner?.username}
                    className="channel-avatar"
                    style={{ width: 40, height: 40 }}
                  />
                </Link>

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* Author Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Link
                        to={`/c/${comment.owner?.username}`}
                        style={{
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          color: 'var(--text-primary)'
                        }}
                      >
                        @{comment.owner?.username || comment.owner?.fullname || 'user'}
                      </Link>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>

                    {isOwner && (
                      <div style={{ position: 'relative' }}>
                        <button
                          className="icon-btn"
                          style={{ width: 28, height: 28 }}
                          onClick={() => setActiveMenuId(activeMenuId === comment._id ? null : comment._id)}
                          title="Options"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeMenuId === comment._id && (
                          <div style={{
                            position: 'absolute',
                            right: 0,
                            top: 30,
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 8,
                            padding: 6,
                            boxShadow: 'var(--shadow-modal)',
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            minWidth: 120
                          }}>
                            <button
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '6px 10px',
                                fontSize: '0.84rem',
                                borderRadius: 6
                              }}
                              onClick={() => handleStartEdit(comment)}
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '6px 10px',
                                fontSize: '0.84rem',
                                borderRadius: 6,
                                color: '#ff6b6b'
                              }}
                              onClick={() => handleDeleteComment(comment._id)}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Comment Content / Edit Form */}
                  {editingCommentId === comment._id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                      <textarea
                        rows={2}
                        className="form-input"
                        value={editDraftText}
                        onChange={(e) => setEditDraftText(e.target.value)}
                        disabled={savingEdit}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="pill-btn"
                          style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                          onClick={() => setEditingCommentId(null)}
                          disabled={savingEdit}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ padding: '4px 14px', fontSize: '0.8rem' }}
                          onClick={() => handleSaveEdit(comment._id)}
                          disabled={savingEdit || !editDraftText.trim()}
                        >
                          {savingEdit ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={{
                      fontSize: '0.9rem',
                      lineHeight: 1.45,
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                      marginTop: 2
                    }}>
                      {comment.content}
                    </p>
                  )}

                  {/* Like / Dislike Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
                    <button
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.8rem',
                        color: comment.isLiked ? 'var(--yt-blue)' : 'var(--text-muted)'
                      }}
                      onClick={() => handleToggleLike(comment._id)}
                      title="Like"
                    >
                      <ThumbsUp size={14} fill={comment.isLiked ? 'currentColor' : 'none'} />
                      <span>{comment.likesCount > 0 ? comment.likesCount : ''}</span>
                    </button>

                    <button
                      style={{ color: 'var(--text-muted)' }}
                      onClick={() => requireAuth('Sign in to dislike this comment')}
                      title="Dislike"
                    >
                      <ThumbsDown size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination: Load More Comments */}
      {currentPage < totalPages && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            className="pill-btn"
            style={{ padding: '8px 20px', gap: 8 }}
            onClick={() => loadComments(currentPage + 1, true)}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Loading more comments...
              </>
            ) : (
              'Load more comments'
            )}
          </button>
        </div>
      )}
    </section>
  );
}
