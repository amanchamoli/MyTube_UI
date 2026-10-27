import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ListVideo,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  FolderPlus,
  X
} from 'lucide-react';
import { playlistService } from '../api/playlistService';
import { useAuth } from '../context/AuthContext';
import { timeAgo, formatViews } from '../utils/formatters';

export default function PlaylistsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Create Modal
  const [isCreating, setIsCreating] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit Modal
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadPlaylists = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
    try {
      const data = await playlistService.getUserPlaylists(user._id);
      setPlaylists(data || []);
    } catch (err) {
      console.error('Failed to load playlists:', err);
      setError('Could not load your playlists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('Sign in to view and manage your playlists');
      return;
    }
    loadPlaylists();
  }, [isAuthenticated, user?._id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;

    setSubmittingCreate(true);
    try {
      const created = await playlistService.createPlaylist({
        name: createName.trim(),
        description: createDesc.trim()
      });
      if (created?._id) {
        setPlaylists((prev) => [created, ...prev]);
        setIsCreating(false);
        setCreateName('');
        setCreateDesc('');
        showToast('Playlist created!');
      }
    } catch (err) {
      console.error('Failed to create playlist:', err);
      showToast('Failed to create playlist');
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleStartEdit = (e, pl) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingPlaylist(pl);
    setEditName(pl.name || '');
    setEditDesc(pl.description || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingPlaylist?._id) return;

    setSubmittingEdit(true);
    try {
      const updated = await playlistService.updatePlaylist(editingPlaylist._id, {
        name: editName.trim(),
        description: editDesc.trim()
      });
      setPlaylists((prev) =>
        prev.map((pl) =>
          pl._id === editingPlaylist._id
            ? { ...pl, name: updated?.name || editName.trim(), description: updated?.description || editDesc.trim() }
            : pl
        )
      );
      setEditingPlaylist(null);
      showToast('Playlist updated!');
    } catch (err) {
      console.error('Failed to update playlist:', err);
      showToast('Failed to update playlist');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = async (e, playlistId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await playlistService.deletePlaylist(playlistId);
      setPlaylists((prev) => prev.filter((pl) => pl._id !== playlistId));
      showToast('Playlist deleted');
    } catch (err) {
      console.error('Failed to delete playlist:', err);
      showToast('Failed to delete playlist');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: 'rgba(62, 166, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <ListVideo size={38} color="var(--yt-blue)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 10 }}>Organize your videos</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 24, lineHeight: 1.5 }}>
          Sign in to create, edit, and organize custom video playlists.
        </p>
        <button
          className="btn-primary"
          style={{ padding: '10px 28px' }}
          onClick={() => openAuthModal('Sign in to view and manage your playlists')}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', paddingBottom: 60 }}>
      {toastMessage && <div className="toast-msg">{toastMessage}</div>}

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
            <ListVideo size={28} color="var(--yt-blue)" />
            Playlists
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'} created by you
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="pill-btn" onClick={loadPlaylists} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px' }}
            onClick={() => setIsCreating(true)}
          >
            <Plus size={18} />
            <span>New playlist</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20
        }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 260, borderRadius: 14 }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ color: '#ff6b6b', marginBottom: 16 }}>{error}</p>
          <button className="pill-btn" onClick={loadPlaylists}>Try Again</button>
        </div>
      ) : playlists.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 20,
          padding: '70px 24px',
          textAlign: 'center',
          maxWidth: 520,
          margin: '30px auto'
        }}>
          <FolderPlus size={52} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 8 }}>No playlists created yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 22, lineHeight: 1.5 }}>
            Create playlists to organize your favorite videos, tutorials, and music mixes into collections.
          </p>
          <button
            className="btn-primary"
            style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            onClick={() => setIsCreating(true)}
          >
            <Plus size={18} />
            <span>Create Playlist</span>
          </button>
        </div>
      ) : (
        /* Playlists Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 22
        }}>
          {playlists.map((pl) => (
            <div
              key={pl._id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Link to={`/playlist/${pl._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {/* Playlist Thumbnail & Overlay */}
                <div style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  backgroundColor: '#181818',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255, 255, 255, 0.2)'
                  }}>
                    <ListVideo size={48} />
                  </div>

                  {/* Video count badge */}
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

                {/* Playlist Metadata */}
                <div style={{ padding: '14px 14px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                    overflow: 'hidden',
                    minHeight: 34
                  }}>
                    {pl.description || 'No description provided.'}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    marginTop: 4
                  }}>
                    <span>{pl.totalViews ? `${formatViews(pl.totalViews)} views` : 'View full playlist'}</span>
                    <span>{pl.updatedAt ? timeAgo(pl.updatedAt) : ''}</span>
                  </div>
                </div>
              </Link>

              {/* Action buttons bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8,
                padding: '6px 12px 10px',
                borderTop: '1px solid rgba(255, 255, 255, 0.04)'
              }}>
                <button
                  className="icon-btn"
                  onClick={(e) => handleStartEdit(e, pl)}
                  title="Edit details"
                  style={{ width: 30, height: 30, color: 'var(--text-secondary)' }}
                >
                  <Edit3 size={15} />
                </button>
                <button
                  className="icon-btn"
                  onClick={(e) => handleDelete(e, pl._id)}
                  title="Delete playlist"
                  style={{ width: 30, height: 30, color: '#ff6b6b' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {isCreating && (
        <div className="modal-overlay" onClick={() => setIsCreating(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Create new playlist</h3>
              <button className="icon-btn" onClick={() => setIsCreating(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter playlist title..."
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  maxLength={150}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="What is this playlist about?"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  className="pill-btn"
                  onClick={() => setIsCreating(false)}
                  disabled={submittingCreate}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                  disabled={submittingCreate || !createName.trim()}
                >
                  {submittingCreate ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Playlist Modal */}
      {editingPlaylist && (
        <div className="modal-overlay" onClick={() => setEditingPlaylist(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Edit playlist</h3>
              <button className="icon-btn" onClick={() => setEditingPlaylist(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={150}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  className="form-input"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  className="pill-btn"
                  onClick={() => setEditingPlaylist(null)}
                  disabled={submittingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                  disabled={submittingEdit || !editName.trim()}
                >
                  {submittingEdit ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
