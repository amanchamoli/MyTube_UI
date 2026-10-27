import React from 'react';
import { NavLink } from 'react-router';
import {
  Home,
  Compass,
  TvMinimalPlay,
  PlaySquare,
  History,
  ThumbsUp,
  Clock,
  Flame,
  Music2,
  Gamepad2,
  Newspaper,
  Trophy,
  UserCheck,
  Video,
  Settings as SettingsIcon,
  MessageSquare,
  ListVideo
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../api/subscriptionService';
import { DEFAULT_AVATAR_SVG } from '../../utils/formatters';

export default function Sidebar({ collapsed }) {
  const { user, isAuthenticated, openAuthModal, requireAuth } = useAuth();
  const [sideSubs, setSideSubs] = React.useState([]);

  React.useEffect(() => {
    let isMounted = true;
    async function loadSubs() {
      if (isAuthenticated && user?._id) {
        try {
          const channels = await subscriptionService.getSubscribedChannels(user._id);
          if (isMounted) setSideSubs(channels || []);
        } catch {
          // ignore background sidebar error
        }
      } else {
        setSideSubs([]);
      }
    }
    loadSubs();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?._id]);

  const handleProtectedNav = (e, featureName) => {
    if (!isAuthenticated) {
      e.preventDefault();
      requireAuth(`Sign in to access your ${featureName}`);
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <NavLink
        to="/"
        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        title="Home"
      >
        <Home size={20} />
        {!collapsed && <span>Home</span>}
      </NavLink>

      <NavLink
        to="/subscriptions"
        className="sidebar-item"
        onClick={(e) => handleProtectedNav(e, 'subscriptions')}
        title="Subscriptions"
      >
        <TvMinimalPlay size={20} />
        {!collapsed && <span>Subscriptions</span>}
      </NavLink>

      <NavLink
        to="/community"
        className="sidebar-item"
        title="Community"
      >
        <MessageSquare size={20} />
        {!collapsed && <span>Community</span>}
      </NavLink>

      <div className="sidebar-divider" />

      {!collapsed && <div className="sidebar-section-title">You</div>}

      <NavLink
        to="/studio"
        className="sidebar-item"
        onClick={(e) => handleProtectedNav(e, 'Your videos')}
        title="Your videos"
      >
        <Video size={20} />
        {!collapsed && <span>Your videos</span>}
      </NavLink>

      <NavLink
        to="/playlists"
        className="sidebar-item"
        onClick={(e) => handleProtectedNav(e, 'playlists')}
        title="Playlists"
      >
        <ListVideo size={20} />
        {!collapsed && <span>Playlists</span>}
      </NavLink>

      <NavLink
        to="/history"
        className="sidebar-item"
        onClick={(e) => handleProtectedNav(e, 'watch history')}
        title="History"
      >
        <History size={20} />
        {!collapsed && <span>History</span>}
      </NavLink>

      <NavLink
        to="/liked"
        className="sidebar-item"
        onClick={(e) => handleProtectedNav(e, 'liked videos')}
        title="Liked videos"
      >
        <ThumbsUp size={20} />
        {!collapsed && <span>Liked videos</span>}
      </NavLink>

      <NavLink
        to="/watch-later"
        className="sidebar-item"
        onClick={(e) => handleProtectedNav(e, 'watch later playlist')}
        title="Watch later"
      >
        <Clock size={20} />
        {!collapsed && <span>Watch later</span>}
      </NavLink>

      <div className="sidebar-divider" />

      {!collapsed && isAuthenticated && sideSubs.length > 0 && (
        <>
          <div className="sidebar-section-title">Subscriptions</div>
          {sideSubs.slice(0, 6).map((channel) => (
            <NavLink
              key={channel._id}
              to={`/c/${channel.username}`}
              className="sidebar-item"
              title={channel.fullname || channel.username}
              style={{ gap: 12 }}
            >
              <img
                src={channel.avatar || DEFAULT_AVATAR_SVG}
                alt={channel.fullname || channel.username}
                className="channel-avatar"
                style={{ width: 24, height: 24, borderRadius: '50%' }}
              />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {channel.fullname || channel.username}
              </span>
            </NavLink>
          ))}
          {sideSubs.length > 6 && (
            <NavLink
              to="/subscriptions"
              className="sidebar-item"
              style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}
            >
              <span>Show all ({sideSubs.length})</span>
            </NavLink>
          )}
          <div className="sidebar-divider" />
        </>
      )}

      {!collapsed && !isAuthenticated && (
        <>
          <div className="sidebar-guest-box">
            <p>Sign in to like videos, comment, and subscribe.</p>
            <button
              className="sign-in-btn"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => openAuthModal('Sign in to like videos, comment, and subscribe.')}
            >
              Sign in
            </button>
          </div>
          <div className="sidebar-divider" />
        </>
      )}

      <div className="sidebar-divider" />

      <NavLink
        to="/settings"
        className="sidebar-item"
        onClick={(e) => handleProtectedNav(e, 'Settings')}
        title="Settings"
      >
        <SettingsIcon size={20} />
        {!collapsed && <span>Settings</span>}
      </NavLink>
    </aside>
  );
}
