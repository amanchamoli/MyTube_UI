import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Menu,
  Search,
  Mic,
  Video,
  Bell,
  User as UserIcon,
  LogOut,
  X,
  UploadCloud,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_AVATAR_SVG } from '../../utils/formatters';

export default function Navbar({ onToggleSidebar }) {
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openAuthModal, requireAuth, openUploadModal } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleCreateClick = () => {
    openUploadModal();
  };

  const handleBellClick = () => {
    requireAuth('Sign in to view notifications');
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <button
          className="icon-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="brand-logo" onClick={() => setQuery('')}>
          <svg className="logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span className="brand-name">
            MyTube
            <span className="country-badge">IN</span>
          </span>
        </Link>
      </div>

      <div className="nav-center">
        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search videos, creators, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="icon-btn"
              style={{ width: 32, height: 32, marginRight: 4 }}
              onClick={() => setQuery('')}
            >
              <X size={16} />
            </button>
          )}
          <button type="submit" className="search-submit-btn" aria-label="Search">
            <Search size={18} />
          </button>
        </form>

        <button
          className="icon-btn voice-btn"
          aria-label="Search with voice"
          onClick={() => alert('Voice search activated (demo)')}
        >
          <Mic size={18} />
        </button>
      </div>

      <div className="nav-right">
        <button
          className="icon-btn"
          onClick={handleCreateClick}
          aria-label="Create video"
          title="Create or Upload Video"
        >
          <Video size={20} />
        </button>

        <button
          className="icon-btn"
          onClick={handleBellClick}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />
        </button>

        {isAuthenticated && user ? (
          <div style={{ position: 'relative' }}>
            <button
              className="user-avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="User Account Menu"
            >
              <img
                src={user.avatar || DEFAULT_AVATAR_SVG}
                alt={user.fullname || user.username}
                className="avatar-img"
              />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: 240,
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 12,
                  boxShadow: 'var(--shadow-modal)',
                  padding: 12,
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                  <img
                    src={user.avatar || DEFAULT_AVATAR_SVG}
                    alt={user.fullname}
                    className="avatar-img"
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.fullname || user.username}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      @{user.username}
                    </div>
                  </div>
                </div>

                <Link
                  to={`/c/${user.username}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)'
                  }}
                  onClick={() => setDropdownOpen(false)}
                >
                  <UserIcon size={16} color="var(--yt-blue)" />
                  Your channel
                </Link>

                <Link
                  to="/dashboard"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)'
                  }}
                  onClick={() => setDropdownOpen(false)}
                >
                  <Video size={16} color="var(--yt-red)" />
                  Creator Dashboard
                </Link>

                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)'
                  }}
                  onClick={() => {
                    setDropdownOpen(false);
                    openUploadModal();
                  }}
                >
                  <UploadCloud size={16} color="var(--yt-blue)" />
                  Upload Video
                </button>

                <Link
                  to="/settings"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)'
                  }}
                  onClick={() => setDropdownOpen(false)}
                >
                  <SettingsIcon size={16} />
                  Settings
                </Link>

                <div style={{ height: 1, backgroundColor: 'var(--border-subtle)', margin: '2px 0' }} />

                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: '0.88rem',
                    color: '#ff6b6b'
                  }}
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="sign-in-btn"
            onClick={() => openAuthModal('Sign in to view your subscriptions, save videos, and comment')}
          >
            <UserIcon size={18} />
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
