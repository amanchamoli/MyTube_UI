import React, { useState, useRef } from 'react';
import { X, Edit3, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { videoService } from '../../api/videoService';

export default function EditVideoModal({ video, isOpen, onClose, onVideoUpdated }) {
  if (!isOpen || !video) return null;

  const [title, setTitle] = useState(video.title || '');
  const [description, setDescription] = useState(video.description || '');
  const [newThumbnailFile, setNewThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(video.thumbnail || null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const thumbInputRef = useRef(null);

  const handleThumbChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (.jpg, .png, .webp)');
        return;
      }
      setNewThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      let payload;
      if (newThumbnailFile) {
        payload = new FormData();
        payload.append('title', title.trim());
        payload.append('description', description.trim());
        payload.append('thumbnail', newThumbnailFile);
      } else {
        payload = {
          title: title.trim(),
          description: description.trim(),
        };
      }

      const updated = await videoService.updateVideo(video._id, payload);
      setSuccess('Video updated successfully!');
      setTimeout(() => {
        if (onVideoUpdated) onVideoUpdated(updated || { ...video, title, description, thumbnail: thumbnailPreview });
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to update video:', err);
      setError(err.response?.data?.message || 'Failed to update video.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 540 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="icon-btn modal-close-btn" onClick={onClose} disabled={saving}>
          <X size={20} />
        </button>

        <div className="modal-header" style={{ textAlign: 'left' }}>
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Edit3 size={22} color="var(--yt-blue)" />
            Edit Video Details
          </h2>
          <p className="modal-subtitle">Update your video title, description, or thumbnail.</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 75, 75, 0.15)',
            border: '1px solid rgba(255, 75, 75, 0.4)',
            color: '#ff6b6b',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertCircle size={18} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        {success && (
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
            <CheckCircle size={18} flexShrink={0} />
            <span>{success}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Thumbnail preview & replacement */}
          <div className="form-group">
            <label className="form-label">Thumbnail</label>
            <input
              type="file"
              ref={thumbInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleThumbChange}
              disabled={saving}
            />

            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Current thumbnail"
                  style={{
                    width: 140,
                    aspectRatio: '16/9',
                    objectFit: 'cover',
                    borderRadius: 8,
                    border: '1px solid var(--border-medium)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 140,
                    aspectRatio: '16/9',
                    backgroundColor: '#222',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ImageIcon size={24} color="var(--text-muted)" />
                </div>
              )}
              <button
                type="button"
                className="pill-btn"
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                onClick={() => thumbInputRef.current?.click()}
                disabled={saving}
              >
                Change Thumbnail
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={saving}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button type="button" className="pill-btn" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '10px 22px' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
