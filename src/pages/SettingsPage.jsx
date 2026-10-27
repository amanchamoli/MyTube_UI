import React, { useState, useRef } from 'react';
import {
  User,
  Shield,
  Camera,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';
import { DEFAULT_AVATAR_SVG } from '../utils/formatters';

export default function SettingsPage() {
  const { user, isAuthenticated, openAuthModal, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'images' | 'security'

  // Profile details state
  const [fullname, setFullname] = useState(user?.fullname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Avatar and Cover state
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [coverPreview, setCoverPreview] = useState(user?.coverImage || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [imageMsg, setImageMsg] = useState({ type: '', text: '' });
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <User size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
        <h2>Account Settings</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '8px 0 20px' }}>
          Please sign in to manage your account profile, avatar, cover image, and security settings.
        </p>
        <button
          className="btn-primary"
          style={{ padding: '10px 24px' }}
          onClick={() => openAuthModal('Sign in to manage your account')}
        >
          Sign In
        </button>
      </div>
    );
  }

  // 1. Update Account Details (fullname, email)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setUpdatingProfile(true);
    try {
      const updated = await authService.updateAccountDetails({ fullname, email });
      updateUser(updated || { fullname, email });
      setProfileMsg({ type: 'success', text: 'Account details updated successfully!' });
    } catch (err) {
      console.error('Update account error:', err);
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update account details.'
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // 2. Update Avatar Image
  const handleAvatarFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageMsg({ type: 'error', text: 'Please select a valid image file.' });
      return;
    }

    setUploadingAvatar(true);
    setImageMsg({ type: '', text: '' });
    try {
      const updated = await authService.updateAvatar(file);
      const newAvatarUrl = updated?.avatar || URL.createObjectURL(file);
      setAvatarPreview(newAvatarUrl);
      updateUser({ avatar: newAvatarUrl });
      setImageMsg({ type: 'success', text: 'Avatar updated successfully!' });
    } catch (err) {
      console.error('Update avatar error:', err);
      setImageMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to upload new avatar.'
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // 3. Update Cover Image
  const handleCoverFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageMsg({ type: 'error', text: 'Please select a valid image file.' });
      return;
    }

    setUploadingCover(true);
    setImageMsg({ type: '', text: '' });
    try {
      const updated = await authService.updateCoverImage(file);
      const newCoverUrl = updated?.coverImage || URL.createObjectURL(file);
      setCoverPreview(newCoverUrl);
      updateUser({ coverImage: newCoverUrl });
      setImageMsg({ type: 'success', text: 'Cover image updated successfully!' });
    } catch (err) {
      console.error('Update cover error:', err);
      setImageMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to upload new cover image.'
      });
    } finally {
      setUploadingCover(false);
    }
  };

  // 4. Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setUpdatingPassword(true);
    try {
      await authService.changePassword({ oldPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Change password error:', err);
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password. Please check your current password.'
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', paddingBottom: 60 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
          Manage your account profile, channel branding, and security credentials.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: 28
      }}>
        <button
          className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
          style={{ borderRadius: '8px 8px 0 0', padding: '10px 18px', gap: 8 }}
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} />
          Account Details
        </button>

        <button
          className={`sidebar-item ${activeTab === 'images' ? 'active' : ''}`}
          style={{ borderRadius: '8px 8px 0 0', padding: '10px 18px', gap: 8 }}
          onClick={() => setActiveTab('images')}
        >
          <Camera size={18} />
          Avatar & Cover Image
        </button>

        <button
          className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`}
          style={{ borderRadius: '8px 8px 0 0', padding: '10px 18px', gap: 8 }}
          onClick={() => setActiveTab('security')}
        >
          <Shield size={18} />
          Security & Password
        </button>
      </div>

      {/* Tab 1: Account Details */}
      {activeTab === 'profile' && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          padding: 24,
          maxWidth: 620
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 6 }}>Account Details</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            Update your public display name and email address.
          </p>

          {profileMsg.text && (
            <div style={{
              backgroundColor: profileMsg.type === 'success' ? 'rgba(75, 255, 100, 0.15)' : 'rgba(255, 75, 75, 0.15)',
              border: `1px solid ${profileMsg.type === 'success' ? 'rgba(75, 255, 100, 0.4)' : 'rgba(255, 75, 75, 0.4)'}`,
              color: profileMsg.type === 'success' ? '#4ade80' : '#ff6b6b',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '0.85rem',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              {profileMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="auth-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={`@${user.username}`}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Usernames are permanent and unique to your channel.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                disabled={updatingProfile}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={updatingProfile}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ marginTop: 8, alignSelf: 'flex-start', padding: '10px 24px' }}
              disabled={updatingProfile}
            >
              {updatingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Avatar & Cover Image */}
      {activeTab === 'images' && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 28
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 6 }}>Branding & Media</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Customize your channel profile avatar and banner cover image.
            </p>
          </div>

          {imageMsg.text && (
            <div style={{
              backgroundColor: imageMsg.type === 'success' ? 'rgba(75, 255, 100, 0.15)' : 'rgba(255, 75, 75, 0.15)',
              border: `1px solid ${imageMsg.type === 'success' ? 'rgba(75, 255, 100, 0.4)' : 'rgba(255, 75, 75, 0.4)'}`,
              color: imageMsg.type === 'success' ? '#4ade80' : '#ff6b6b',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              {imageMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {imageMsg.text}
            </div>
          )}

          {/* Avatar Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            paddingBottom: 24,
            borderBottom: '1px solid var(--border-subtle)',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative' }}>
              <img
                src={avatarPreview || DEFAULT_AVATAR_SVG}
                alt={user.fullname}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--border-medium)',
                  backgroundColor: '#222'
                }}
              />
              {uploadingAvatar && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 240 }}>
              <div style={{ fontWeight: 600, fontSize: '0.98rem' }}>Profile Picture</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                PNG, JPG or WEBP image. 1:1 square recommended.
              </div>
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarFileSelected}
                disabled={uploadingAvatar}
              />
              <button
                type="button"
                className="pill-btn"
                style={{ alignSelf: 'flex-start', marginTop: 4, gap: 8 }}
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                <Camera size={16} />
                {uploadingAvatar ? 'Uploading Avatar...' : 'Change Avatar'}
              </button>
            </div>
          </div>

          {/* Cover Image Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.98rem' }}>Banner / Cover Image</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                This image will appear across the top of your channel page.
              </div>
            </div>

            <div style={{
              width: '100%',
              height: 160,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: '#1b1b1b',
              position: 'relative',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Channel Banner"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <ImageIcon size={32} />
                  <span style={{ fontSize: '0.85rem' }}>No cover image set</span>
                </div>
              )}

              {uploadingCover && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  color: '#fff',
                  fontWeight: 600
                }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  Uploading Cover Image...
                </div>
              )}
            </div>

            <input
              type="file"
              ref={coverInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleCoverFileSelected}
              disabled={uploadingCover}
            />

            <button
              type="button"
              className="pill-btn"
              style={{ alignSelf: 'flex-start', gap: 8 }}
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
            >
              <ImageIcon size={16} />
              {uploadingCover ? 'Uploading Cover...' : 'Change Cover Image'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Password */}
      {activeTab === 'security' && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          padding: 24,
          maxWidth: 620
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 6 }}>Change Password</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            Ensure your account is using a long, random password to stay secure.
          </p>

          {passwordMsg.text && (
            <div style={{
              backgroundColor: passwordMsg.type === 'success' ? 'rgba(75, 255, 100, 0.15)' : 'rgba(255, 75, 75, 0.15)',
              border: `1px solid ${passwordMsg.type === 'success' ? 'rgba(75, 255, 100, 0.4)' : 'rgba(255, 75, 75, 0.4)'}`,
              color: passwordMsg.type === 'success' ? '#4ade80' : '#ff6b6b',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '0.85rem',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              {passwordMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="auth-form">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                disabled={updatingPassword}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={updatingPassword}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-type your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={updatingPassword}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ marginTop: 8, alignSelf: 'flex-start', padding: '10px 24px' }}
              disabled={updatingPassword}
            >
              {updatingPassword ? 'Changing Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
