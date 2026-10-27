import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { videoService } from '../../api/videoService';

export default function DeleteVideoDialog({ video, isOpen, onClose, onVideoDeleted }) {
  if (!isOpen || !video) return null;

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await videoService.deleteVideo(video._id);
      if (onVideoDeleted) onVideoDeleted(video._id);
      onClose();
    } catch (err) {
      console.error('Failed to delete video:', err);
      setError(err.response?.data?.message || 'Failed to delete video. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 440 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="icon-btn modal-close-btn" onClick={onClose} disabled={deleting}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 0, 0, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--yt-red)',
            flexShrink: 0
          }}>
            <Trash2 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Delete video permanently?</h3>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>"{video.title}"</strong>?
          This action cannot be undone and will delete all associated comments and likes.
        </p>

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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
          <button type="button" className="pill-btn" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{
              backgroundColor: 'var(--yt-red)',
              color: '#fff',
              padding: '10px 20px'
            }}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Forever'}
          </button>
        </div>
      </div>
    </div>
  );
}
