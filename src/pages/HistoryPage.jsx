import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { History, Play, CheckCircle2, Clock, Trash2, RefreshCw } from 'lucide-react';
import { authService } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import { formatDuration, formatViews, timeAgo, DEFAULT_AVATAR_SVG } from '../utils/formatters';

export default function HistoryPage() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [historyVideos, setHistoryVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.getWatchHistory();
      setHistoryVideos(data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Could not load watch history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('Sign in to view your watch history');
      return;
    }
    loadHistory();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <History size={52} color="var(--text-muted)" style={{ marginBottom: 16 }} />
        <h2 style={{ marginBottom: 8 }}>Keep track of what you watch</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Watch history isn't viewable when signed out. Sign in to see videos you've watched.
        </p>
        <button
          className="btn-primary"
          style={{ padding: '10px 24px' }}
          onClick={() => openAuthModal('Sign in to view your watch history')}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={26} color="var(--yt-red)" />
            Watch History
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Videos you have watched on MyTube.
          </p>
        </div>

        <button className="pill-btn" onClick={loadHistory} title="Refresh">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 110, width: '100%', borderRadius: 12 }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: '#ff6b6b', marginBottom: 14 }}>{error}</p>
          <button className="pill-btn" onClick={loadHistory}>Try Again</button>
        </div>
      ) : historyVideos.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <History size={52} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>Your watch history is empty</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 20px' }}>
            Videos you watch on MyTube will show up here so you can easily jump back into them.
          </p>
          <Link to="/" className="btn-primary" style={{ padding: '10px 24px', display: 'inline-flex' }}>
            Explore Videos
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {historyVideos.map((vid) => (
            <Link
              key={vid._id}
              to={`/watch/${vid._id}`}
              style={{
                display: 'flex',
                gap: 18,
                padding: 12,
                borderRadius: 12,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                transition: 'background-color 0.2s, transform 0.2s',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Thumbnail */}
              <div style={{
                width: 200,
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
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#1f1f1f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)'
                  }}>
                    <Play size={28} />
                  </div>
                )}
                {vid.duration > 0 && (
                  <span className="duration-badge" style={{ bottom: 6, right: 6 }}>
                    {formatDuration(vid.duration)}
                  </span>
                )}
              </div>

              {/* Video Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, flex: 1 }}>
                <h3 style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.35
                }}>
                  {vid.title}
                </h3>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}>
                  <span>{vid.owner?.fullname || vid.owner?.username || 'Creator'}</span>
                  <span>•</span>
                  <span>{formatViews(vid.views || 0)}</span>
                </div>

                <p style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginTop: 4
                }}>
                  {vid.description || 'No description'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
