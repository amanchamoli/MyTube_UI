import React, { useEffect, useState } from 'react';
import { MessageSquare, Sparkles, RefreshCw, Users } from 'lucide-react';
import { tweetService } from '../api/tweetService';
import { useAuth } from '../context/AuthContext';
import CreateTweetBox from '../components/community/CreateTweetBox';
import TweetCard from '../components/community/TweetCard';

export default function CommunityPage() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTweets = async () => {
    setLoading(true);
    setError('');
    try {
      if (user?._id) {
        const userTweets = await tweetService.getUserTweets(user._id);
        setTweets(userTweets || []);
      } else {
        setTweets([]);
      }
    } catch (err) {
      console.error('Failed to load community posts:', err);
      setError('Could not load community feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTweets();
  }, [user?._id]);

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
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
            <MessageSquare size={26} color="var(--yt-blue)" />
            Community Posts & Updates
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Share announcements, polls, and updates directly with your audience.
          </p>
        </div>

        <button className="pill-btn" onClick={loadTweets} title="Refresh">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Post creation box */}
      <CreateTweetBox
        onTweetCreated={(newTweet) => setTweets((prev) => [newTweet, ...prev])}
      />

      {/* Posts List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, width: '100%', borderRadius: 14 }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: '#ff6b6b', marginBottom: 14 }}>{error}</p>
          <button className="pill-btn" onClick={loadTweets}>Try Again</button>
        </div>
      ) : tweets.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <MessageSquare size={52} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>No community posts yet</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 20px' }}>
            {isAuthenticated
              ? "Share your first update above to interact with your channel subscribers!"
              : "Sign in to publish posts and see community updates from creators you follow."}
          </p>
          {!isAuthenticated && (
            <button
              className="btn-primary"
              style={{ padding: '10px 24px' }}
              onClick={() => openAuthModal('Sign in to publish community posts')}
            >
              Sign In
            </button>
          )}
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
  );
}
