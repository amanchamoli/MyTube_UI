import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ThumbsUp, Play, Trash2, RefreshCw } from 'lucide-react';
import { likeService } from '../api/likeService';
import { useAuth } from '../context/AuthContext';
import { formatDuration, formatViews, timeAgo } from '../utils/formatters';

export default function LikedVideosPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadLikedVideos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await likeService.getLikedVideos();
      // Ensure only valid video objects with _id are displayed
      const valid = (data || []).filter((v) => v && (v._id || v.video?._id));
      setLikedVideos(valid);
    } catch (err) {
      console.error('Failed to load liked videos:', err);
      setError('Could not load liked videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('Sign in to view your liked videos');
      return;
    }
    loadLikedVideos();
  }, [isAuthenticated]);

  const handleUnlike = async (e, videoId) => {
    e.preventDefault();
    e.stopPropagation();

    setRemovingId(videoId);
    try {
      await likeService.toggleVideoLike(videoId);
      setLikedVideos((prev) => prev.filter((v) => v._id !== videoId));
      showToast('Removed from Liked videos');
    } catch (err) {
      console.error('Failed to unlike video:', err);
      showToast('Failed to remove video');
    } finally {
      setRemovingId(null);
    }
  };

  const handlePlayAll = () => {
    if (likedVideos.length > 0) {
      navigate(`/watch/${likedVideos[0]._id}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: 'rgba(62, 166, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <ThumbsUp size={38} color="var(--yt-blue)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 10 }}>Enjoy your favorite videos</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 24, lineHeight: 1.5 }}>
          Sign in to access videos that you've liked across YouTube and build your personal collection.
        </p>
        <button
          className="btn-primary"
          style={{ padding: '10px 28px' }}
          onClick={() => openAuthModal('Sign in to view your liked videos')}
        >
          Sign In
        </button>
      </div>
    );
  }

  const firstVideo = likedVideos[0];

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', paddingBottom: 60 }}>
      {toastMessage && <div className="toast-msg">{toastMessage}</div>}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 32, alignItems: 'start' }}>
          <div className="skeleton" style={{ height: 440, borderRadius: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ color: '#ff6b6b', marginBottom: 16 }}>{error}</p>
          <button className="pill-btn" onClick={loadLikedVideos}>Try Again</button>
        </div>
      ) : likedVideos.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 20,
          padding: '80px 24px',
          textAlign: 'center',
          maxWidth: 600,
          margin: '20px auto'
        }}>
          <div style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px'
          }}>
            <ThumbsUp size={36} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: 10 }}>No liked videos yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 24, lineHeight: 1.5 }}>
            Use the thumbs-up button on any video to add it here. Your liked videos are private to you.
          </p>
          <Link to="/" className="btn-primary" style={{ padding: '10px 26px', display: 'inline-flex' }}>
            Explore Videos
          </Link>
        </div>
      ) : (
        <div className="liked-page-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 360px) 1fr',
          gap: 32,
          alignItems: 'start'
        }}>
          {/* Left Column: Playlist Card Banner */}
          <div style={{
            position: 'sticky',
            top: 80,
            background: 'linear-gradient(180deg, rgba(62, 166, 255, 0.22) 0%, rgba(20, 20, 20, 0.95) 75%)',
            border: '1px solid rgba(62, 166, 255, 0.2)',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            {/* First Video Thumbnail Preview */}
            <div
              style={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: 14,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                backgroundColor: '#111',
                cursor: 'pointer'
              }}
              onClick={handlePlayAll}
            >
              {firstVideo?.thumbnail ? (
                <img
                  src={firstVideo.thumbnail}
                  alt="Liked playlist preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#202020' }} />
              )}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.9,
                transition: 'opacity 0.2s'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  padding: '8px 16px',
                  borderRadius: 24,
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}>
                  <Play size={16} fill="white" />
                  <span>PLAY ALL</span>
                </div>
              </div>
            </div>

            {/* Playlist Meta */}
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                <ThumbsUp size={24} color="var(--yt-blue)" />
                Liked videos
              </h1>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.fullname || user?.username || 'You'}
                </span>
                <span>{likedVideos.length} {likedVideos.length === 1 ? 'video' : 'videos'} • Updated recently</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Private • Only you can view</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                className="btn-primary"
                onClick={handlePlayAll}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '11px 18px',
                  borderRadius: 24
                }}
              >
                <Play size={16} fill="#000" />
                <span>Play all</span>
              </button>

              <button
                className="pill-btn"
                onClick={loadLikedVideos}
                title="Refresh list"
                style={{ padding: '0 14px', borderRadius: 24 }}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Video List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {likedVideos.map((video, idx) => (
              <div
                key={video._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '10px 14px',
                  borderRadius: 14,
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'background-color 0.2s',
                  position: 'relative'
                }}
                className="liked-video-row"
              >
                {/* Index number */}
                <span style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  width: 22,
                  textAlign: 'center'
                }}>
                  {idx + 1}
                </span>

                {/* Video Link & Thumbnail */}
                <Link
                  to={`/watch/${video._id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    flex: 1,
                    minWidth: 0,
                    textDecoration: 'none'
                  }}
                >
                  <div style={{
                    width: 140,
                    aspectRatio: '16/9',
                    borderRadius: 8,
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: '#181818',
                    flexShrink: 0
                  }}>
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#222' }} />
                    )}
                    {video.duration > 0 && (
                      <span className="duration-badge" style={{ bottom: 4, right: 4, fontSize: '0.72rem' }}>
                        {formatDuration(video.duration)}
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
                    <h3 style={{
                      fontSize: '0.94rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.35,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {video.title}
                    </h3>

                    <div style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span>{video.owner?.fullname || video.owner?.username || 'Creator'}</span>
                      <span>•</span>
                      <span>{formatViews(video.views || 0)}</span>
                      {video.createdAt && (
                        <>
                          <span>•</span>
                          <span>{timeAgo(video.createdAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Quick Unlike action button */}
                <button
                  className="icon-btn"
                  onClick={(e) => handleUnlike(e, video._id)}
                  title="Remove from Liked videos"
                  disabled={removingId === video._id}
                  style={{
                    color: 'var(--text-muted)',
                    opacity: removingId === video._id ? 0.5 : 1,
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ff6b6b')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
