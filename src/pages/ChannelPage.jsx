import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  Users,
  Film,
  CheckCircle2,
  Settings as SettingsIcon,
  Calendar,
  Mail,
  Video as VideoIcon,
  MessageSquare,
  ListVideo
} from 'lucide-react';
import { authService } from '../api/authService';
import { videoService } from '../api/videoService';
import { tweetService } from '../api/tweetService';
import { playlistService } from '../api/playlistService';
import { subscriptionService } from '../api/subscriptionService';
import { useAuth } from '../context/AuthContext';
import { formatSubscriberCount, DEFAULT_AVATAR_SVG } from '../utils/formatters';
import VideoCard from '../components/video/VideoCard';
import CreateTweetBox from '../components/community/CreateTweetBox';
import TweetCard from '../components/community/TweetCard';

export default function ChannelPage() {
  const { username } = useParams();
  const { user, requireAuth } = useAuth();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [loadingTweets, setLoadingTweets] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [subscribersList, setSubscribersList] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' | 'playlists' | 'community' | 'about'

  const isOwnChannel = user && user.username === username;

  useEffect(() => {
    let isMounted = true;
    async function loadChannel() {
      setLoading(true);
      setError('');
      try {
        const channelData = await authService.getUserChannel(username);
        if (!isMounted) return;
        setChannel(channelData);
        setIsSubscribed(Boolean(channelData?.isSubscribed));
        setSubscribersCount(channelData?.subscribersCount || 0);

        // Fetch channel videos by creator userId
        if (channelData?._id) {
          const vidsRes = await videoService.getVideos({ userId: channelData._id });
          if (isMounted) {
            setVideos(vidsRes.videos || []);
          }
        }
      } catch (err) {
        console.error('Failed to load channel:', err);
        if (isMounted) setError('Channel not found or unavailable.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadChannel();
    return () => {
      isMounted = false;
    };
  }, [username]);

  // Fetch community tweets when switching to the community tab
  useEffect(() => {
    let isMounted = true;
    async function fetchTweets() {
      if (activeTab === 'community' && channel?._id) {
        setLoadingTweets(true);
        try {
          const data = await tweetService.getUserTweets(channel._id);
          if (isMounted) setTweets(data || []);
        } catch (err) {
          console.error('Failed to load tweets:', err);
        } finally {
          if (isMounted) setLoadingTweets(false);
        }
      }
    }
    fetchTweets();
    return () => {
      isMounted = false;
    };
  }, [activeTab, channel?._id]);

  // Fetch playlists when switching to playlists tab
  useEffect(() => {
    let isMounted = true;
    async function fetchPlaylists() {
      if (activeTab === 'playlists' && channel?._id) {
        setLoadingPlaylists(true);
        try {
          const data = await playlistService.getUserPlaylists(channel._id);
          if (isMounted) setPlaylists(data || []);
        } catch (err) {
          console.error('Failed to load playlists:', err);
        } finally {
          if (isMounted) setLoadingPlaylists(false);
        }
      }
    }
    fetchPlaylists();
    return () => {
      isMounted = false;
    };
  }, [activeTab, channel?._id]);

  // Fetch subscribers when switching to about tab
  useEffect(() => {
    let isMounted = true;
    async function fetchSubscribers() {
      if (activeTab === 'about' && channel?._id) {
        setLoadingSubscribers(true);
        try {
          const data = await subscriptionService.getChannelSubscribers(channel._id);
          if (isMounted) setSubscribersList(data || []);
        } catch (err) {
          console.error('Failed to load subscribers:', err);
        } finally {
          if (isMounted) setLoadingSubscribers(false);
        }
      }
    }
    fetchSubscribers();
    return () => {
      isMounted = false;
    };
  }, [activeTab, channel?._id]);

  const handleSubscribeToggle = async () => {
    if (!channel?._id) return;
    requireAuth(`Sign in to subscribe to ${channel.fullname || channel.username}`, async () => {
      try {
        const res = await videoService.toggleSubscribe(channel._id);
        const nextState = res?.isSubscribed ?? !isSubscribed;
        setIsSubscribed(nextState);
        setSubscribersCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
      } catch (err) {
        console.error('Subscribe toggle error:', err);
      }
    });
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px' }}>
        <div className="skeleton" style={{ width: '100%', height: 200, borderRadius: 16, marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 32 }}>
          <div className="skeleton" style={{ width: 120, height: 120, borderRadius: '50%' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="skeleton" style={{ width: 250, height: 28, borderRadius: 6 }} />
            <div className="skeleton" style={{ width: 180, height: 16, borderRadius: 4 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <Users size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
        <h2>Channel Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '8px 0 20px' }}>
          {error || `The channel @${username} does not exist.`}
        </p>
        <Link to="/" className="pill-btn">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', paddingBottom: 60 }}>
      {/* Cover / Banner Banner */}
      <div style={{
        width: '100%',
        height: 220,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#1b1b1b',
        border: '1px solid var(--border-subtle)',
        marginBottom: 20
      }}>
        {channel.coverImage ? (
          <img
            src={channel.coverImage}
            alt="Channel Banner"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1f1f1f 0%, #2b1d38 50%, #17243b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.2)'
          }}>
            <Film size={64} />
          </div>
        )}
      </div>

      {/* Channel Header Information */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
        padding: '0 8px',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <img
            src={channel.avatar || DEFAULT_AVATAR_SVG}
            alt={channel.fullname}
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--border-medium)',
              backgroundColor: '#222'
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              {channel.fullname || channel.username}
              <CheckCircle2 size={20} color="var(--text-secondary)" />
            </h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>@{channel.username}</span>
              <span>•</span>
              <span>{formatSubscriberCount(subscribersCount)}</span>
              <span>•</span>
              <span>{videos.length} videos</span>
            </div>
            {channel.channelsSubscribedToCount > 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Subscribed to {channel.channelsSubscribedToCount} channels
              </div>
            )}
          </div>
        </div>

        {/* Subscribe or Settings Action */}
        <div>
          {isOwnChannel ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/settings" className="pill-btn" style={{ gap: 8 }}>
                <SettingsIcon size={16} />
                Customize Channel
              </Link>
              <Link to="/studio" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                Manage Videos
              </Link>
            </div>
          ) : (
            <button
              className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
              style={{ padding: '10px 24px', fontSize: '0.95rem' }}
              onClick={handleSubscribeToggle}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: 24
      }}>
        <button
          className={`sidebar-item ${activeTab === 'videos' ? 'active' : ''}`}
          style={{ borderRadius: '8px 8px 0 0', padding: '10px 20px', gap: 8 }}
          onClick={() => setActiveTab('videos')}
        >
          <VideoIcon size={18} />
          Videos
        </button>

        <button
          className={`sidebar-item ${activeTab === 'playlists' ? 'active' : ''}`}
          style={{ borderRadius: '8px 8px 0 0', padding: '10px 20px', gap: 8 }}
          onClick={() => setActiveTab('playlists')}
        >
          <ListVideo size={18} />
          Playlists
        </button>

        <button
          className={`sidebar-item ${activeTab === 'community' ? 'active' : ''}`}
          style={{ borderRadius: '8px 8px 0 0', padding: '10px 20px', gap: 8 }}
          onClick={() => setActiveTab('community')}
        >
          <MessageSquare size={18} />
          Community
        </button>

        <button
          className={`sidebar-item ${activeTab === 'about' ? 'active' : ''}`}
          style={{ borderRadius: '8px 8px 0 0', padding: '10px 20px', gap: 8 }}
          onClick={() => setActiveTab('about')}
        >
          <Users size={18} />
          About
        </button>
      </div>

      {/* Tab 1: Videos Grid */}
      {activeTab === 'videos' && (
        <div>
          {videos.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Film size={44} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 6 }}>This channel has no videos yet</h3>
              <p style={{ fontSize: '0.88rem' }}>When {channel.fullname || channel.username} uploads videos, they will appear here.</p>
            </div>
          ) : (
            <div className="video-grid">
              {videos.map((vid) => (
                <VideoCard key={vid._id} video={vid} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Playlists */}
      {activeTab === 'playlists' && (
        <div>
          {loadingPlaylists ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 20
            }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 240, borderRadius: 14 }} />
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <ListVideo size={44} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 6 }}>No playlists yet</h3>
              <p style={{ fontSize: '0.88rem' }}>This channel hasn't created any playlists yet.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 22
            }}>
              {playlists.map((pl) => (
                <Link
                  key={pl._id}
                  to={`/playlist/${pl._id}`}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{
                    width: '100%',
                    aspectRatio: '16/9',
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255, 255, 255, 0.25)'
                  }}>
                    <ListVideo size={48} />
                    <div style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <ListVideo size={13} />
                      <span>{pl.totalVideos || 0} {pl.totalVideos === 1 ? 'video' : 'videos'}</span>
                    </div>
                  </div>

                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.35,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {pl.name}
                    </h3>
                    <p style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {pl.description || 'No description'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Community Posts */}
      {activeTab === 'community' && (
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {isOwnChannel && (
            <CreateTweetBox
              onTweetCreated={(newTweet) => setTweets((prev) => [newTweet, ...prev])}
            />
          )}

          {loadingTweets ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 110, borderRadius: 14 }} />
              ))}
            </div>
          ) : tweets.length === 0 ? (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 16,
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <MessageSquare size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 6 }}>
                No community posts yet
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
                When {channel.fullname || channel.username} publishes posts, updates, or announcements, they will appear here.
              </p>
            </div>
          ) : (
            <div>
              {tweets.map((t) => (
                <TweetCard
                  key={t._id}
                  tweet={t}
                  onTweetUpdated={(updated) =>
                    setTweets((prev) => prev.map((item) => (item._id === updated._id ? updated : item)))
                  }
                  onTweetDeleted={(deletedId) =>
                    setTweets((prev) => prev.filter((item) => item._id !== deletedId))
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: About */}
      {activeTab === 'about' && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          padding: 24,
          maxWidth: 680,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Channel Details</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Mail size={18} color="var(--yt-blue)" />
            <span>{channel.email || 'Email not public'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Users size={18} color="var(--text-primary)" />
            <span>{formatSubscriberCount(subscribersCount)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Film size={18} color="var(--yt-red)" />
            <span>{videos.length} videos uploaded</span>
          </div>

          {/* Subscribers List (if available) */}
          {subscribersList.length > 0 && (
            <div style={{ marginTop: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>
                Subscribers ({subscribersList.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {subscribersList.map((sub) => (
                  <Link
                    key={sub._id || sub.username}
                    to={`/c/${sub.username}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '6px 12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 20,
                      textDecoration: 'none',
                      color: 'inherit',
                      fontSize: '0.85rem'
                    }}
                  >
                    <img
                      src={sub.avatar || DEFAULT_AVATAR_SVG}
                      alt={sub.fullname || sub.username}
                      className="channel-avatar"
                      style={{ width: 28, height: 28 }}
                    />
                    <span style={{ fontWeight: 500 }}>{sub.fullname || sub.username}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
