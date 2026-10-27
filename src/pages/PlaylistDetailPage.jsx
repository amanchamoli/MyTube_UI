import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  ListVideo,
  Play,
  Trash2,
  Edit3,
  Share2,
  X,
  Loader2
} from 'lucide-react';
import { playlistService } from '../api/playlistService';
import { useAuth } from '../context/AuthContext';
import { formatDuration, formatViews, timeAgo, DEFAULT_AVATAR_SVG } from '../utils/formatters';

export default function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [removingVideoId, setRemovingVideoId] = useState(null);

  // Edit Playlist Modal
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadPlaylist = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await playlistService.getPlaylistById(playlistId);
      if (!data) {
        setError('Playlist not found or unavailable.');
      } else {
        setPlaylist(data);
        setEditName(data.name || '');
        setEditDesc(data.description || '');
      }
    } catch (err) {
      console.error('Failed to load playlist:', err);
      setError('Could not load playlist details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylist();
  }, [playlistId]);

  const isOwner =
    user &&
    playlist &&
    (user._id === playlist.owner?._id ||
      user._id === playlist.owner ||
      user.username === playlist.owner?.username);

  const handlePlayAll = () => {
    if (playlist?.videos && playlist.videos.length > 0) {
      const firstVidId = playlist.videos[0]._id || playlist.videos[0];
      navigate(`/watch/${firstVidId}`);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Playlist link copied to clipboard!');
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (!isOwner) return;
    setRemovingVideoId(videoId);
    try {
      await playlistService.removeVideoFromPlaylist(videoId, playlistId);
      setPlaylist((prev) => ({
        ...prev,
        videos: (prev.videos || []).filter((v) => (v._id || v) !== videoId),
        totalVideos: Math.max(0, (prev.totalVideos || 1) - 1)
      }));
      showToast('Video removed from playlist');
    } catch (err) {
      console.error('Failed to remove video from playlist:', err);
      showToast('Failed to remove video');
    } finally {
      setRemovingVideoId(null);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setSavingEdit(true);
    try {
      const updated = await playlistService.updatePlaylist(playlistId, {
        name: editName.trim(),
        description: editDesc.trim()
      });
      setPlaylist((prev) => ({
        ...prev,
        name: updated?.name || editName.trim(),
        description: updated?.description || editDesc.trim()
      }));
      setIsEditing(false);
      showToast('Playlist updated!');
    } catch (err) {
      console.error('Failed to update playlist:', err);
      showToast('Failed to update playlist');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!isOwner) return;
    if (!window.confirm('Delete this playlist permanently?')) return;

    try {
      await playlistService.deletePlaylist(playlistId);
      showToast('Playlist deleted');
      navigate('/playlists');
    } catch (err) {
      console.error('Failed to delete playlist:', err);
      showToast('Failed to delete playlist');
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: '360px 1fr', gap: 32 }}>
        <div className="skeleton" style={{ height: 420, borderRadius: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <ListVideo size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ marginBottom: 12 }}>{error || 'Playlist not found'}</h2>
        <Link to="/playlists" className="btn-primary" style={{ padding: '9px 24px', display: 'inline-flex' }}>
          Back to Playlists
        </Link>
      </div>
    );
  }

  const videos = playlist.videos || [];
  const firstVideo = videos[0];

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', paddingBottom: 60 }}>
      {toastMessage && <div className="toast-msg">{toastMessage}</div>}

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
          {/* Cover Preview */}
          <div
            style={{
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: 14,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              backgroundColor: '#111',
              cursor: videos.length > 0 ? 'pointer' : 'default'
            }}
            onClick={videos.length > 0 ? handlePlayAll : undefined}
          >
            {firstVideo?.thumbnail ? (
              <img
                src={firstVideo.thumbnail}
                alt={playlist.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.25)'
              }}>
                <ListVideo size={48} />
              </div>
            )}

            {videos.length > 0 && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
            )}
          </div>

          {/* Playlist Information */}
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>
              {playlist.name}
            </h1>

            {playlist.description && (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                {playlist.description}
              </p>
            )}

            {/* Owner Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Link to={`/c/${playlist.owner?.username}`}>
                <img
                  src={playlist.owner?.avatar || DEFAULT_AVATAR_SVG}
                  alt={playlist.owner?.fullname || playlist.owner?.username}
                  className="channel-avatar"
                  style={{ width: 36, height: 36 }}
                />
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Link
                  to={`/c/${playlist.owner?.username}`}
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    textDecoration: 'none'
                  }}
                >
                  {playlist.owner?.fullname || playlist.owner?.username || 'Creator'}
                </Link>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {videos.length} {videos.length === 1 ? 'video' : 'videos'} • Updated {timeAgo(playlist.updatedAt || playlist.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {videos.length > 0 && (
              <button
                className="btn-primary"
                onClick={handlePlayAll}
                style={{
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
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="pill-btn"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleShare}
                title="Share playlist"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>

              {isOwner && (
                <>
                  <button
                    className="pill-btn"
                    onClick={() => setIsEditing(true)}
                    title="Edit playlist"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="pill-btn"
                    onClick={handleDeletePlaylist}
                    title="Delete playlist"
                    style={{ color: '#ff6b6b' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Video Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {videos.length === 0 ? (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 16,
              padding: '60px 24px',
              textAlign: 'center'
            }}>
              <ListVideo size={48} color="var(--text-muted)" style={{ margin: '0 auto 14px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 6 }}>This playlist is empty</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                Save videos to this playlist while watching by clicking the "Save" button.
              </p>
              <Link to="/" className="btn-primary" style={{ padding: '9px 24px', display: 'inline-flex' }}>
                Explore Videos
              </Link>
            </div>
          ) : (
            videos.map((vid, idx) => {
              const vidId = vid._id || vid;
              const isBusy = removingVideoId === vidId;

              return (
                <div
                  key={vidId}
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
                    to={`/watch/${vidId}`}
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
                      {vid.thumbnail ? (
                        <img
                          src={vid.thumbnail}
                          alt={vid.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#222' }} />
                      )}
                      {vid.duration > 0 && (
                        <span className="duration-badge" style={{ bottom: 4, right: 4, fontSize: '0.72rem' }}>
                          {formatDuration(vid.duration)}
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
                        {vid.title || 'Untitled video'}
                      </h3>

                      <div style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <span>{vid.owner?.fullname || vid.owner?.username || 'Creator'}</span>
                        {vid.views !== undefined && (
                          <>
                            <span>•</span>
                            <span>{formatViews(vid.views)}</span>
                          </>
                        )}
                        {vid.createdAt && (
                          <>
                            <span>•</span>
                            <span>{timeAgo(vid.createdAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* If Owner: Remove from playlist button */}
                  {isOwner && (
                    <button
                      className="icon-btn"
                      onClick={() => handleRemoveVideo(vidId)}
                      title="Remove from playlist"
                      disabled={isBusy}
                      style={{
                        color: 'var(--text-muted)',
                        opacity: isBusy ? 0.5 : 1,
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ff6b6b')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      {isBusy ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={18} />}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Edit playlist</h3>
              <button className="icon-btn" onClick={() => setIsEditing(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={150}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  className="form-input"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  className="pill-btn"
                  onClick={() => setIsEditing(false)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                  disabled={savingEdit || !editName.trim()}
                >
                  {savingEdit ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
