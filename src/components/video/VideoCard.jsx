import React, { useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle2, Play, User as UserIcon } from 'lucide-react';
import { formatDuration, formatViews, timeAgo } from '../../utils/formatters';

export default function VideoCard({ video }) {
  const [thumbError, setThumbError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  return (
    <Link to={`/watch/${video._id}`} className="video-card">
      <div className="thumbnail-container">
        {!thumbError && video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="thumbnail-img"
            loading="lazy"
            onError={() => setThumbError(true)}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <Play size={36} fill="currentColor" opacity={0.6} />
          </div>
        )}
        {video.duration > 0 && (
          <span className="duration-badge">{formatDuration(video.duration)}</span>
        )}
      </div>

      <div className="video-info">
        {!avatarError && video.owner?.avatar ? (
          <img
            src={video.owner.avatar}
            alt={video.owner?.fullname || video.owner?.username || 'Channel avatar'}
            className="channel-avatar"
            loading="lazy"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div
            className="channel-avatar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#272727',
              color: 'var(--text-secondary)'
            }}
          >
            <UserIcon size={20} />
          </div>
        )}
        <div className="meta-details">
          <h3 className="video-title" title={video.title}>
            {video.title}
          </h3>
          <div className="channel-name">
            <span>{video.owner?.fullname || video.owner?.username || 'Creator'}</span>
            <CheckCircle2 className="verified-icon" />
          </div>
          <div className="stats-row">
            <span>{formatViews(video.views)}</span>
            <span className="stat-dot">•</span>
            <span>{timeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
