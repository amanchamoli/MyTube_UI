import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  UploadCloud,
  Globe,
  Lock,
  Edit3,
  Trash2,
  Eye,
  ThumbsUp,
  Film,
  Users,
  Video as VideoIcon,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Clock
} from 'lucide-react';
import { videoService } from '../api/videoService';
import { dashboardService } from '../api/dashboardService';
import { useAuth } from '../context/AuthContext';
import { formatViews, formatDuration, timeAgo } from '../utils/formatters';
import EditVideoModal from '../components/video/EditVideoModal';
import DeleteVideoDialog from '../components/video/DeleteVideoDialog';

export default function StudioPage() {
  const { user, isAuthenticated, openUploadModal, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [editingVideo, setEditingVideo] = useState(null);
  const [deletingVideo, setDeletingVideo] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadStudioData = async () => {
    setLoading(true);
    setError('');
    try {
      const [videosData, statsData] = await Promise.all([
        dashboardService.getChannelVideos(),
        dashboardService.getChannelStats()
      ]);
      setVideos(videosData || []);
      setStats(statsData || null);
    } catch (err) {
      console.error('Error loading creator dashboard:', err);
      setError('Could not load creator data. Please make sure you are signed in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('Sign in to access your Creator Studio');
      return;
    }
    loadStudioData();
  }, [isAuthenticated]);

  const handleTogglePublish = async (videoId, currentStatus) => {
    setTogglingId(videoId);
    try {
      const res = await videoService.togglePublishStatus(videoId);
      const newStatus = res?.isPublished !== undefined ? res.isPublished : !currentStatus;

      setVideos((prev) =>
        prev.map((v) => (v._id === videoId ? { ...v, isPublished: newStatus } : v))
      );
      showToast(newStatus ? 'Video is now Public' : 'Video is now Private (Unpublished)');
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
      showToast('Error changing publish status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleVideoUpdated = (updated) => {
    setVideos((prev) =>
      prev.map((v) => (v._id === updated._id ? { ...v, ...updated } : v))
    );
    showToast('Video details updated!');
  };

  const handleVideoDeleted = (deletedId) => {
    setVideos((prev) => prev.filter((v) => v._id !== deletedId));
    setStats((prev) => prev ? { ...prev, totalVideos: Math.max(0, (prev.totalVideos || 1) - 1) } : prev);
    showToast('Video deleted permanently.');
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <Film size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
        <h2 style={{ marginBottom: 8 }}>Creator Studio</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Sign in to manage, upload, publish, and delete your channel videos.
        </p>
        <button
          className="btn-primary"
          style={{ padding: '10px 24px' }}
          onClick={() => openAuthModal('Sign in to access Creator Studio')}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 60 }}>
      {toastMessage && <div className="toast-msg">{toastMessage}</div>}

      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Film size={26} color="var(--yt-red)" />
            Creator Dashboard & Studio
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Manage your uploaded videos, toggle visibility, and update metadata.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="pill-btn" onClick={loadStudioData} title="Refresh">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}
            onClick={openUploadModal}
          >
            <UploadCloud size={18} />
            Upload Video
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 28
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--yt-red)'
            }}>
              <VideoIcon size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.totalVideos ?? videos.length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Videos</div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: 'rgba(62, 166, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--yt-blue)'
            }}>
              <Eye size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{formatViews(stats.totalViews ?? 0)}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Views</div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: 'rgba(75, 255, 100, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4ade80'
            }}>
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.totalSubscribers ?? 0}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Subscribers</div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: 'rgba(255, 170, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffa500'
            }}>
              <ThumbsUp size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.totalLikes ?? 0}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Likes</div>
            </div>
          </div>
        </div>
      )}

      {/* Videos List / Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, width: '100%', borderRadius: 10 }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: '#ff6b6b', marginBottom: 14 }}>{error}</p>
          <button className="pill-btn" onClick={loadStudioData}>Try Again</button>
        </div>
      ) : videos.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <Film size={52} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>No videos uploaded yet</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 20px' }}>
            Ready to share your content with the world? Upload your first video to start growing your channel.
          </p>
          <button
            className="btn-primary"
            style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            onClick={openUploadModal}
          >
            <UploadCloud size={18} />
            Upload Video
          </button>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '3fr 1.2fr 1fr 1fr 1.5fr',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <div>Video</div>
            <div>Visibility</div>
            <div>Date</div>
            <div>Views</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {/* Table Body */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {videos.map((vid) => (
              <div
                key={vid._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3fr 1.2fr 1fr 1fr 1.5fr',
                  padding: '16px 20px',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Video Info */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0, paddingRight: 16 }}>
                  <div style={{
                    width: 120,
                    aspectRatio: '16/9',
                    borderRadius: 8,
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: '#000',
                    flexShrink: 0
                  }}>
                    {vid.thumbnail ? (
                      <img
                        src={vid.thumbnail}
                        alt={vid.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', backgroundColor: '#222' }} />
                    )}
                    {vid.duration > 0 && (
                      <span className="duration-badge" style={{ bottom: 4, right: 4, fontSize: '0.7rem' }}>
                        {formatDuration(vid.duration)}
                      </span>
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <Link
                      to={`/watch/${vid._id}`}
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                      title={vid.title}
                    >
                      {vid.title}
                    </Link>
                    <p style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      marginTop: 4,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {vid.description || 'No description'}
                    </p>
                  </div>
                </div>

                {/* Visibility / Publish Toggle */}
                <div>
                  <button
                    onClick={() => handleTogglePublish(vid._id, vid.isPublished)}
                    disabled={togglingId === vid._id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 12px',
                      borderRadius: 20,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor: vid.isPublished ? 'rgba(75, 255, 100, 0.12)' : 'rgba(255, 255, 255, 0.08)',
                      color: vid.isPublished ? '#4ade80' : 'var(--text-muted)',
                      border: '1px solid ' + (vid.isPublished ? 'rgba(75, 255, 100, 0.3)' : 'var(--border-subtle)'),
                      cursor: 'pointer'
                    }}
                    title={vid.isPublished ? 'Click to make Private' : 'Click to make Public'}
                  >
                    {vid.isPublished ? <Globe size={13} /> : <Lock size={13} />}
                    <span>{vid.isPublished ? 'Public' : 'Private'}</span>
                  </button>
                </div>

                {/* Date */}
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  {timeAgo(vid.createdAt)}
                </div>

                {/* Views */}
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  {formatViews(vid.views || 0)}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                  <Link
                    to={`/watch/${vid._id}`}
                    className="icon-btn"
                    title="Watch video"
                    style={{ width: 34, height: 34 }}
                  >
                    <ExternalLink size={16} />
                  </Link>
                  <button
                    className="icon-btn"
                    onClick={() => setEditingVideo(vid)}
                    title="Edit video details"
                    style={{ width: 34, height: 34 }}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => setDeletingVideo(vid)}
                    title="Delete video"
                    style={{ width: 34, height: 34, color: '#ff6b6b' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditVideoModal
        video={editingVideo}
        isOpen={Boolean(editingVideo)}
        onClose={() => setEditingVideo(null)}
        onVideoUpdated={handleVideoUpdated}
      />

      {/* Delete Dialog */}
      <DeleteVideoDialog
        video={deletingVideo}
        isOpen={Boolean(deletingVideo)}
        onClose={() => setDeletingVideo(null)}
        onVideoDeleted={handleVideoDeleted}
      />
    </div>
  );
}
