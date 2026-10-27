import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  TvMinimalPlay,
  Users,
  Grid,
  List,
  RefreshCw,
  Bell,
  CheckCircle2,
  Play,
  Compass,
  ArrowRight
} from 'lucide-react';
import { subscriptionService } from '../api/subscriptionService';
import { useAuth } from '../context/AuthContext';
import { formatDuration, formatViews, timeAgo, formatSubscriberCount, DEFAULT_AVATAR_SVG } from '../utils/formatters';

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('feed'); // 'feed' | 'manage'
  const [togglingId, setTogglingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadSubscriptions = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
    try {
      const data = await subscriptionService.getSubscribedChannels(user._id);
      setSubscriptions(data || []);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
      setError('Could not load your subscriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('Sign in to view your channel subscriptions');
      return;
    }
    loadSubscriptions();
  }, [isAuthenticated, user?._id]);

  const handleToggleSub = async (channelId, channelName) => {
    setTogglingId(channelId);
    try {
      const res = await subscriptionService.toggleSubscription(channelId);
      const isSubscribed = res?.isSubscribed ?? false;

      if (!isSubscribed) {
        // If un-subscribed, mark it in local state or remove from list
        setSubscriptions((prev) =>
          prev.map((item) =>
            item._id === channelId ? { ...item, _isUnsubscribed: true } : item
          )
        );
        showToast(`Unsubscribed from ${channelName}`);
      } else {
        setSubscriptions((prev) =>
          prev.map((item) =>
            item._id === channelId ? { ...item, _isUnsubscribed: false } : item
          )
        );
        showToast(`Subscribed to ${channelName}`);
      }
    } catch (err) {
      console.error('Failed to toggle subscription:', err);
      showToast('Action failed');
    } finally {
      setTogglingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <TvMinimalPlay size={40} color="var(--yt-red)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 10 }}>Don't miss new videos</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 24, lineHeight: 1.5 }}>
          Sign in to see updates from your favorite YouTube channels and subscribe to creators.
        </p>
        <button
          className="btn-primary"
          style={{ padding: '10px 28px' }}
          onClick={() => openAuthModal('Sign in to view your channel subscriptions')}
        >
          Sign In
        </button>
      </div>
    );
  }

  // Active (not unsubscribed in this session) channels
  const activeChannels = subscriptions.filter((s) => !s._isUnsubscribed);

  // Collect any latest videos from subscribed channels
  const feedVideos = [];
  activeChannels.forEach((channel) => {
    if (channel.latestVideo && channel.latestVideo._id) {
      feedVideos.push({
        ...channel.latestVideo,
        owner: {
          _id: channel._id,
          username: channel.username,
          fullname: channel.fullname,
          avatar: channel.avatar
        }
      });
    }
  });

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', paddingBottom: 60 }}>
      {toastMessage && <div className="toast-msg">{toastMessage}</div>}

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <TvMinimalPlay size={26} color="var(--yt-red)" />
            Subscriptions
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            {activeChannels.length} {activeChannels.length === 1 ? 'channel' : 'channels'} subscribed
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="pill-btn" onClick={loadSubscriptions} title="Refresh">
            <RefreshCw size={16} />
          </button>

          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 20,
            padding: 3
          }}>
            <button
              onClick={() => setViewMode('feed')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 16,
                fontSize: '0.84rem',
                fontWeight: 600,
                backgroundColor: viewMode === 'feed' ? 'var(--bg-hover)' : 'transparent',
                color: viewMode === 'feed' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              <Grid size={15} />
              <span>Feed</span>
            </button>

            <button
              onClick={() => setViewMode('manage')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 16,
                fontSize: '0.84rem',
                fontWeight: 600,
                backgroundColor: viewMode === 'manage' ? 'var(--bg-hover)' : 'transparent',
                color: viewMode === 'manage' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              <List size={15} />
              <span>Manage</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 16, overflowX: 'hidden' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ width: 80, height: 95, borderRadius: 12, flexShrink: 0 }} />
            ))}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20
          }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 260, borderRadius: 14 }} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ color: '#ff6b6b', marginBottom: 16 }}>{error}</p>
          <button className="pill-btn" onClick={loadSubscriptions}>Try Again</button>
        </div>
      ) : activeChannels.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 20,
          padding: '70px 24px',
          textAlign: 'center',
          maxWidth: 520,
          margin: '30px auto'
        }}>
          <Users size={52} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 8 }}>No subscriptions yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 22, lineHeight: 1.5 }}>
            Subscribe to your favorite creators to stay updated on their latest video releases and community updates.
          </p>
          <Link
            to="/?q=trending"
            className="btn-primary"
            style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Compass size={18} />
            <span>Discover Channels</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Top Channel Avatars Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 14,
            marginBottom: 24,
            scrollbarWidth: 'none'
          }}>
            {activeChannels.map((channel) => (
              <Link
                key={channel._id}
                to={`/c/${channel.username}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  minWidth: 72,
                  maxWidth: 88,
                  textAlign: 'center'
                }}
              >
                <img
                  src={channel.avatar || DEFAULT_AVATAR_SVG}
                  alt={channel.fullname || channel.username}
                  className="channel-avatar"
                  style={{
                    width: 56,
                    height: 56,
                    border: '2px solid rgba(62, 166, 255, 0.3)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%'
                }}>
                  {channel.fullname || channel.username}
                </span>
              </Link>
            ))}
          </div>

          {/* View 1: Feed View */}
          {viewMode === 'feed' && (
            <div>
              {feedVideos.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 22
                }}>
                  {feedVideos.map((vid) => (
                    <Link
                      key={vid._id}
                      to={`/watch/${vid._id}`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      <div style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        borderRadius: 12,
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor: '#181818'
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
                          <span className="duration-badge">{formatDuration(vid.duration)}</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 12 }}>
                        <img
                          src={vid.owner?.avatar || DEFAULT_AVATAR_SVG}
                          alt={vid.owner?.fullname || vid.owner?.username}
                          className="channel-avatar"
                          style={{ width: 36, height: 36 }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
                          <h3 style={{
                            fontSize: '0.94rem',
                            fontWeight: 600,
                            lineHeight: 1.35,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {vid.title}
                          </h3>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {vid.owner?.fullname || vid.owner?.username}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {formatViews(vid.views || 0)} • {timeAgo(vid.createdAt)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* Fallback if channels haven't uploaded new videos recently */
                <div>
                  <div style={{
                    padding: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 14,
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Subscribed Creators</h3>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        Click any creator channel to browse their full catalog and community updates.
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 18
                  }}>
                    {activeChannels.map((channel) => (
                      <div
                        key={channel._id}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 14,
                          padding: 18,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          gap: 12
                        }}
                      >
                        <Link to={`/c/${channel.username}`}>
                          <img
                            src={channel.avatar || DEFAULT_AVATAR_SVG}
                            alt={channel.fullname || channel.username}
                            className="channel-avatar"
                            style={{ width: 68, height: 68 }}
                          />
                        </Link>
                        <div>
                          <Link
                            to={`/c/${channel.username}`}
                            style={{
                              fontSize: '1rem',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              textDecoration: 'none'
                            }}
                          >
                            {channel.fullname || channel.username}
                          </Link>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            @{channel.username}
                          </div>
                        </div>

                        <Link
                          to={`/c/${channel.username}`}
                          className="pill-btn"
                          style={{ width: '100%', justifyContent: 'center', gap: 6, padding: '8px 14px' }}
                        >
                          <span>Visit Channel</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* View 2: Manage View */}
          {viewMode === 'manage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {subscriptions.map((channel) => {
                const isUnsubscribed = Boolean(channel._isUnsubscribed);
                const isBusy = togglingId === channel._id;

                return (
                  <div
                    key={channel._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 18px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 14,
                      opacity: isUnsubscribed ? 0.6 : 1,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    <Link
                      to={`/c/${channel.username}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        textDecoration: 'none',
                        color: 'inherit',
                        minWidth: 0,
                        flex: 1
                      }}
                    >
                      <img
                        src={channel.avatar || DEFAULT_AVATAR_SVG}
                        alt={channel.fullname || channel.username}
                        className="channel-avatar"
                        style={{ width: 48, height: 48 }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {channel.fullname || channel.username}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          @{channel.username}
                        </span>
                      </div>
                    </Link>

                    <button
                      className={`subscribe-btn ${!isUnsubscribed ? 'subscribed' : ''}`}
                      style={{
                        padding: '8px 18px',
                        fontSize: '0.86rem',
                        flexShrink: 0
                      }}
                      onClick={() => handleToggleSub(channel._id, channel.fullname || channel.username)}
                      disabled={isBusy}
                    >
                      {!isUnsubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
