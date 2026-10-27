import React, { useState } from 'react';
import { X, Lock, User, Mail, UploadCloud, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal() {
  const { authModalOpen, authModalReason, closeAuthModal, login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [identifier, setIdentifier] = useState(''); // username or email
  const [password, setPassword] = useState('');
  
  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const isEmail = identifier.includes('@');
      await login({
        ...(isEmail ? { email: identifier } : { username: identifier }),
        password,
      });
      closeAuthModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login({
        username: 'guest_1791983111578',
        password: 'GuestPass123!'
      });
      closeAuthModal();
    } catch {
      // If that guest account is not available, try fallback
      setError('Could not connect to demo account.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regAvatar) {
      setError('Please select an avatar image for your profile.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullname', regFullName);
      formData.append('username', regUsername);
      formData.append('email', regEmail);
      formData.append('password', regPassword);
      formData.append('avatar', regAvatar);

      await register(formData);
      setSuccessMsg('Account created successfully! Logging you in...');
      
      // Auto login with new credentials
      await login({
        username: regUsername,
        password: regPassword
      });
      setTimeout(() => {
        closeAuthModal();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Username or email may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn modal-close-btn" onClick={closeAuthModal} aria-label="Close">
          <X size={20} />
        </button>

        <div className="modal-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--yt-red)'
            }}>
              <Lock size={22} />
            </div>
          </div>
          <h2 className="modal-title">{tab === 'login' ? 'Sign in to MyTube' : 'Create your account'}</h2>
          <p className="modal-subtitle">
            {authModalReason || 'Access subscriptions, comments, likes, and watch history.'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 75, 75, 0.15)',
            border: '1px solid rgba(255, 75, 75, 0.4)',
            color: '#ff6b6b',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(75, 255, 100, 0.15)',
            border: '1px solid rgba(75, 255, 100, 0.4)',
            color: '#4ade80',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <CheckCircle size={16} />
            {successMsg}
          </div>
        )}

        {tab === 'login' ? (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. aman or user@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="modal-divider">or test immediately</div>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleQuickDemoLogin}
              disabled={loading}
            >
              1-Click Demo Sign In (Tester Account)
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
              Don't have an account?{' '}
              <span
                style={{ color: 'var(--yt-blue)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { setTab('register'); setError(''); }}
              >
                Create one
              </span>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Jane Doe"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. janedoe"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. jane@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Choose a password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profile Avatar Image (Required)</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={(e) => setRegAvatar(e.target.files[0])}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Creating Account...' : 'Create Account & Sign In'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
              Already have an account?{' '}
              <span
                style={{ color: 'var(--yt-blue)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { setTab('login'); setError(''); }}
              >
                Sign In
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
