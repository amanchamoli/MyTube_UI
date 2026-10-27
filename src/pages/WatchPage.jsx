import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Sparkles,
  Edit3,
  Trash2,
  Globe,
  Lock
} from 'lucide-react';
import { videoService } from '../api/videoService';
import VideoPlayer from '../components/video/VideoPlayer';
import { formatViews, formatSubscriberCount, timeAgo, formatDuration, DEFAULT_AVATAR_SVG } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import EditVideoModal from '../components/video/EditVideoModal';
import DeleteVideoDialog from '../components/video/DeleteVideoDialog';
import CommentsSection from '../components/comments/CommentsSection';
import SaveToPlaylistModal from '../components/playlist/SaveToPlaylistModal';

export default function WatchPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, requireAuth } = useAuth();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  // Playlist state
  const [isSavingToPlaylist, setIsSavingToPlaylist] = useState(false);

  // Creator management states
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingPublish, setTogglingPublish] = useState(false);

  // Recommendations
  const [recommendations, setRecommendations] = useState([]);

  // Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadVideoData() {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const vidData = await videoService.getVideoById(videoId);
        if (!isMounted) return;
        setVideo(vidData);
        setIsLiked(Boolean(vidData.isLiked));
        setLikesCount(vidData.likesCount || 0);
        setIsSubscribed(Boolean(vidData.owner?.isSubscribed));
        setSubscribersCount(vidData.owner?.subscribersCount || 0);

        // Fetch recommended videos
        const feedRes = await videoService.getVideos({ limit: 10 });
        if (isMounted) {
          setRecommendations((feedRes.videos || []).filter((v) => v._id !== videoId));
        }
      } catch (err) {
        console.error('Error loading video details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadVideoData();
    return () => {
      isMounted = false;
    };
  }, [videoId]);

  const handleLikeClick = async () => {
    requireAuth('Sign in to make your opinion count.', async () => {
      try {
        const res = await videoService.toggleLike(videoId);
        const nextState = res?.isLiked ?? !isLiked;
        setIsLiked(nextState);
        setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
      } catch (e) {
        console.error('Like toggle error', e);
      }
    });
  };

  const handleSubscribeClick = async () => {
    if (!video?.owner?._id) return;
    requireAuth(`Sign in to subscribe to ${video.owner?.fullname || video.owner?.username}`, async () => {
      try {
        const res = await videoService.toggleSubscribe(video.owner._id);
        const nextSubState = res?.isSubscribed ?? !isSubscribed;
        setIsSubscribed(nextSubState);
        setSubscribersCount((prev) => (nextSubState ? prev + 1 : Math.max(0, prev - 1)));
        showToast(nextSubState ? 'Subscribed to channel' : 'Unsubscribed');
      } catch (e) {
        console.error('Subscribe toggle error', e);
      }
    });
  };

  const handleShareClick = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  const handleTogglePublish = async () => {
    setTogglingPublish(true);
    try {
      const res = await videoService.togglePublishStatus(videoId);
      const newStatus = res?.isPublished !== undefined ? res.isPublished : !video?.isPublished;
      setVideo((prev) => ({ ...prev, isPublished: newStatus }));
      showToast(newStatus ? 'Video is now Public' : 'Video is now Private (Unpublished)');
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
      showToast('Error changing publish status');
    } finally {
      setTogglingPublish(false);
    }
  };

  const handleVideoUpdated = (updated) => {
    setVideo((prev) => ({ ...prev, ...updated }));
    showToast('Video details updated!');
  };

  const handleVideoDeleted = () => {
    showToast('Video deleted.');
    navigate('/');
  };

  const handleSaveClick = () => {
    requireAuth('Sign in to add this video to a playlist', () => {
      setIsSavingToPlaylist(true);
    });
  };

  if (loading) {
    return (
      <div className="watch-container">
        <div className="watch-main-column">
          <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 28, width: '80%', borderRadius: 8 }} />
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
            <div className="skeleton" style={{ height: 20, width: 200, borderRadius: 6 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Video not found</h2>
        <Link to="/" className="pill-btn" style={{ marginTop: 16 }}>
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="watch-container">
      {toastMessage && <div className="toast-msg">{toastMessage}</div>}

      <div className="watch-main-column">
        {/* Video Player */}
        <VideoPlayer
          videoUrl={video.videoFile}
          poster={video.thumbnail}
          title={video.title}
        />

        {/* Video Title */}
        <h1 className="watch-video-title">{video.title}</h1>

        {/* Channel & Actions Bar */}
        <div className="watch-actions-bar">
          <div className="watch-channel-info">
            <img
              src={video.owner?.avatar || DEFAULT_AVATAR_SVG}
              alt={video.owner?.fullname || video.owner?.username}
              className="watch-channel-avatar"
            />
            <div className="watch-channel-meta">
              <span className="watch-channel-name">
                {video.owner?.fullname || video.owner?.username || 'Creator'}
              </span>
              <span className="watch-sub-count">
                {formatSubscriberCount(subscribersCount)}
              </span>
            </div>

            <button
              className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
              onClick={handleSubscribeClick}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          <div className="action-buttons-group">
            {/* If logged-in user is video owner, show quick creator actions */}
            {user && (user._id === video.owner?._id || user._id === video.owner || user.username === video.owner?.username) && (
              <>
                <button
                  className="pill-btn"
                  onClick={handleTogglePublish}
                  disabled={togglingPublish}
                  style={{
                    backgroundColor: video.isPublished ? 'rgba(75, 255, 100, 0.12)' : 'rgba(255, 255, 255, 0.08)',
                    color: video.isPublished ? '#4ade80' : 'var(--text-muted)',
                    borderColor: video.isPublished ? 'rgba(75, 255, 100, 0.3)' : 'var(--border-subtle)'
                  }}
                  title={video.isPublished ? 'Click to make Private' : 'Click to make Public'}
                >
                  {video.isPublished ? <Globe size={16} /> : <Lock size={16} />}
                  <span>{video.isPublished ? 'Public' : 'Private'}</span>
                </button>

                <button
                  className="pill-btn"
                  onClick={() => setIsEditing(true)}
                  title="Edit video details"
                >
                  <Edit3 size={16} color="var(--yt-blue)" />
                  <span>Edit</span>
                </button>

                <button
                  className="pill-btn"
                  onClick={() => setIsDeleting(true)}
                  style={{ color: '#ff6b6b' }}
                  title="Delete video"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </>
            )}

            <div className="like-dislike-group">
              <button
                onClick={handleLikeClick}
                style={{ color: isLiked ? 'var(--yt-blue)' : 'inherit' }}
                title="Like"
              >
                <ThumbsUp size={18} fill={isLiked ? 'currentColor' : 'none'} />
                <span>{likesCount > 0 ? likesCount : 'Like'}</span>
              </button>
              <div className="like-divider" />
              <button
                onClick={() => requireAuth('Sign in to make your opinion count.')}
                title="Dislike"
              >
                <ThumbsDown size={18} />
              </button>
            </div>

            <button className="pill-btn" onClick={handleShareClick} title="Share">
              <Share2 size={18} />
              <span>Share</span>
            </button>

            <button className="pill-btn" onClick={handleSaveClick} title="Save to playlist">
              <Bookmark size={18} />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Description Box */}
        <div
          className="video-description-box"
          onClick={() => setDescExpanded(!descExpanded)}
        >
          <div className="desc-stats">
            <span>{formatViews(video.views)}</span>
            <span>{timeAgo(video.createdAt)}</span>
          </div>
          <p className="desc-text">
            {descExpanded
              ? video.description || 'No description provided.'
              : (video.description?.slice(0, 150) || 'No description provided.') +
                (video.description?.length > 150 ? '...' : '')}
          </p>
          {video.description?.length > 150 && (
            <span className="desc-show-more">
              {descExpanded ? 'Show less' : '...more'}
            </span>
          )}
        </div>

        {/* Comments Section */}
        <CommentsSection videoId={videoId} />
      </div>

      {/* Recommendations Column */}
      <aside className="watch-recommendations">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6 }}>
          <Sparkles size={16} color="var(--yt-blue)" />
          <h3 style={{ fontSize: '0.98rem', fontWeight: 600 }}>Related Videos</h3>
        </div>

        {recommendations.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No other videos available</p>
        ) : (
          recommendations.map((rec) => (
            <Link to={`/watch/${rec._id}`} key={rec._id} className="recommendation-card">
              <div className="rec-thumbnail-container">
                {rec.thumbnail ? (
                  <img
                    src={rec.thumbnail}
                    alt={rec.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#222' }} />
                )}
                {rec.duration > 0 && (
                  <span className="duration-badge">{formatDuration(rec.duration)}</span>
                )}
              </div>

              <div className="rec-meta">
                <h4 className="rec-title" title={rec.title}>
                  {rec.title}
                </h4>
                <span className="rec-channel">{rec.owner?.fullname || rec.owner?.username}</span>
                <span className="rec-stats">
                  {formatViews(rec.views)} • {timeAgo(rec.createdAt)}
                </span>
              </div>
            </Link>
          ))
        )}
      </aside>

      {/* Edit Video Modal for Owner */}
      <EditVideoModal
        video={video}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onVideoUpdated={handleVideoUpdated}
      />

      {/* Delete Video Dialog for Owner */}
      <DeleteVideoDialog
        video={video}
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onVideoDeleted={handleVideoDeleted}
      />

      {/* Save to Playlist Modal */}
      <SaveToPlaylistModal
        videoId={videoId}
        isOpen={isSavingToPlaylist}
        onClose={() => setIsSavingToPlaylist(false)}
      />
    </div>
  );
}
