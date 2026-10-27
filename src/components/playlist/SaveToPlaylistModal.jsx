import React, { useState, useEffect } from 'react';
import { X, Plus, Loader2, ListPlus } from 'lucide-react';
import { playlistService } from '../../api/playlistService';
import { useAuth } from '../../context/AuthContext';

export default function SaveToPlaylistModal({ videoId, isOpen, onClose }) {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inPlaylists, setInPlaylists] = useState({}); // { [playlistId]: boolean }
  const [busyPlaylists, setBusyPlaylists] = useState({});

  // Create new playlist form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!isOpen || !user?._id) return;

    let isMounted = true;
    async function fetchUserPlaylists() {
      setLoading(true);
      setMsg('');
      try {
        const userPlaylists = await playlistService.getUserPlaylists(user._id);
        if (!isMounted) return;
        setPlaylists(userPlaylists || []);

        // Also check which playlists contain this videoId
        // Fetch full details of playlists to check membership
        const membershipMap = {};
        await Promise.all(
          (userPlaylists || []).map(async (pl) => {
            try {
              const full = await playlistService.getPlaylistById(pl._id);
              if (full && full.videos) {
                const contains = full.videos.some(
                  (v) => (v._id || v) === videoId
                );
                membershipMap[pl._id] = contains;
              } else {
                membershipMap[pl._id] = false;
              }
            } catch {
              membershipMap[pl._id] = false;
            }
          })
        );

        if (isMounted) setInPlaylists(membershipMap);
      } catch (err) {
        console.error('Failed to load playlists:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchUserPlaylists();
    return () => {
      isMounted = false;
    };
  }, [isOpen, user?._id, videoId]);

  if (!isOpen) return null;

  const handleTogglePlaylist = async (playlistId) => {
    const isCurrentlyIn = Boolean(inPlaylists[playlistId]);
    setBusyPlaylists((prev) => ({ ...prev, [playlistId]: true }));
    setMsg('');

    try {
      if (isCurrentlyIn) {
        await playlistService.removeVideoFromPlaylist(videoId, playlistId);
        setInPlaylists((prev) => ({ ...prev, [playlistId]: false }));
        setMsg('Removed from playlist');
      } else {
        await playlistService.addVideoToPlaylist(videoId, playlistId);
        setInPlaylists((prev) => ({ ...prev, [playlistId]: true }));
        setMsg('Added to playlist');
      }
    } catch (err) {
      console.error('Failed to update playlist video:', err);
      setMsg('Failed to update playlist');
    } finally {
      setBusyPlaylists((prev) => ({ ...prev, [playlistId]: false }));
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    try {
      const created = await playlistService.createPlaylist({
        name: newName.trim(),
        description: newDescription.trim()
      });

      if (created?._id) {
        // Automatically add current video to newly created playlist
        await playlistService.addVideoToPlaylist(videoId, created._id);

        setPlaylists((prev) => [created, ...prev]);
        setInPlaylists((prev) => ({ ...prev, [created._id]: true }));
        setNewName('');
        setNewDescription('');
        setShowCreateForm(false);
        setMsg(`Created "${created.name}" and added video`);
      }
    } catch (err) {
      console.error('Failed to create playlist:', err);
      setMsg('Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 380, padding: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ListPlus size={20} color="var(--yt-blue)" />
            Save video to...
          </h3>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {msg && (
          <div style={{
            fontSize: '0.82rem',
            padding: '6px 12px',
            backgroundColor: 'rgba(62, 166, 255, 0.1)',
            color: 'var(--yt-blue)',
            borderRadius: 6,
            textAlign: 'center'
          }}>
            {msg}
          </div>
        )}

        {/* Existing Playlists Checklist */}
        <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0' }}>
          {loading ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
              <p style={{ fontSize: '0.82rem', marginTop: 8 }}>Loading playlists...</p>
            </div>
          ) : playlists.length === 0 ? (
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', padding: '16px 0', textAlign: 'center' }}>
              No playlists found. Create your first playlist below!
            </p>
          ) : (
            playlists.map((pl) => {
              const isChecked = Boolean(inPlaylists[pl._id]);
              const isBusy = Boolean(busyPlaylists[pl._id]);

              return (
                <label
                  key={pl._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 10px',
                    borderRadius: 8,
                    cursor: isBusy ? 'wait' : 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.2s',
                    backgroundColor: isChecked ? 'rgba(255, 255, 255, 0.04)' : 'transparent'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isChecked ? 'rgba(255, 255, 255, 0.04)' : 'transparent')}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isBusy}
                    onChange={() => handleTogglePlaylist(pl._id)}
                    style={{
                      width: 18,
                      height: 18,
                      accentColor: 'var(--yt-blue)',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pl.name}
                  </span>
                  {isBusy && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                </label>
              );
            })
          )}
        </div>

        {/* Create New Playlist Toggle / Form */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, marginTop: 4 }}>
          {!showCreateForm ? (
            <button
              className="pill-btn"
              style={{ width: '100%', justifyContent: 'center', gap: 8, padding: '9px 16px' }}
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={18} />
              <span>Create new playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreatePlaylist} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter playlist title..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={150}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea
                  rows={2}
                  className="form-input"
                  placeholder="Add a description..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="button"
                  className="pill-btn"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '7px 18px', fontSize: '0.86rem' }}
                  disabled={creating || !newName.trim()}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
