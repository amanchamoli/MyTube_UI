import React, { useState, useRef } from 'react';
import { X, UploadCloud, Image as ImageIcon, Film, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { videoService } from '../../api/videoService';
import { useNavigate } from 'react-router';

export default function UploadVideoModal({ onVideoUploaded }) {
  const { uploadModalOpen, closeUploadModal } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  if (!uploadModalOpen) return null;

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file (.mp4, .webm, .mkv, .mov)');
        return;
      }
      setVideoFile(file);
      setError('');
      if (!title) {
        // Auto-suggest title from filename (minus extension)
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleThumbChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for thumbnail (.jpg, .png, .webp)');
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setUploadPercent(0);
    setError('');
    setSuccess('');
    setUploading(false);
  };

  const handleClose = () => {
    if (uploading) {
      if (!window.confirm('Upload in progress. Are you sure you want to cancel?')) return;
    }
    resetForm();
    closeUploadModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!videoFile) {
      setError('Please select a video file to upload.');
      return;
    }
    if (!thumbnailFile) {
      setError('Please select a thumbnail image.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a title for your video.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description for your video.');
      return;
    }

    setUploading(true);
    setUploadPercent(0);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('videoFile', videoFile);
      formData.append('thumbnail', thumbnailFile);

      const uploadedVideo = await videoService.publishVideo(formData, (percent) => {
        setUploadPercent(percent);
      });

      setSuccess('Video uploaded and published successfully!');
      setTimeout(() => {
        handleClose();
        if (onVideoUploaded) onVideoUploaded(uploadedVideo);
        if (uploadedVideo?._id) {
          navigate(`/watch/${uploadedVideo._id}`);
        }
      }, 1200);
    } catch (err) {
      console.error('Video upload failed:', err);
      setError(err.response?.data?.message || 'Video upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="icon-btn modal-close-btn"
          onClick={handleClose}
          aria-label="Close modal"
          disabled={uploading}
        >
          <X size={20} />
        </button>

        <div className="modal-header" style={{ textAlign: 'left' }}>
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UploadCloud size={24} color="var(--yt-red)" />
            Upload video
          </h2>
          <p className="modal-subtitle">
            Publish a new video to your channel. It will be available for everyone to watch.
          </p>
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
          {/* Video File Input */}
          <div className="form-group">
            <label className="form-label">Video File (Required)</label>
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              style={{ display: 'none' }}
              onChange={handleVideoChange}
              disabled={uploading}
            />

            {!videoFile ? (
              <div
                onClick={() => videoInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 12,
                  padding: '28px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  transition: 'border-color 0.2s, background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--yt-blue)';
                  e.currentTarget.style.backgroundColor = 'rgba(62, 166, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                }}
              >
                <Film size={36} color="var(--yt-blue)" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Select Video File</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  MP4, WebM, MKV or MOV (up to Cloudinary storage limits)
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 8,
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <Film size={22} color="var(--yt-blue)" flexShrink={0} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {videoFile.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="pill-btn"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploading}
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Thumbnail File Input */}
          <div className="form-group">
            <label className="form-label">Thumbnail Image (Required)</label>
            <input
              type="file"
              ref={thumbInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleThumbChange}
              disabled={uploading}
            />

            {!thumbnailPreview ? (
              <div
                onClick={() => thumbInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 12,
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--yt-blue)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
              >
                <ImageIcon size={28} color="var(--text-secondary)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Upload Thumbnail</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  16:9 aspect ratio recommended (JPG, PNG, WEBP)
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  style={{ width: 140, aspectRatio: '16/9', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-medium)' }}
                />
                <button
                  type="button"
                  className="pill-btn"
                  style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                  onClick={() => thumbInputRef.current?.click()}
                  disabled={uploading}
                >
                  Change Thumbnail
                </button>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Title (Required)</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{title.length}/100</span>
            </div>
            <input
              type="text"
              maxLength={100}
              className="form-input"
              placeholder="Add a title that describes your video"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={uploading}
            />
          </div>

          {/* Description Input */}
          <div className="form-group">
            <label className="form-label">Description (Required)</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Tell viewers about your video..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={uploading}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--yt-blue)' }}>
                  <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  {uploadPercent < 100
                    ? `Uploading media (${uploadPercent}%)...`
                    : 'Processing video on server & Cloudinary...'}
                </span>
                <span style={{ fontWeight: 600 }}>{uploadPercent}%</span>
              </div>
              <div style={{ width: '100%', height: 6, backgroundColor: 'var(--bg-active)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${uploadPercent}%`,
                    height: '100%',
                    backgroundColor: 'var(--yt-blue)',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit & Cancel Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button
              type="button"
              className="pill-btn"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '10px 24px' }}
              disabled={uploading}
            >
              {uploading ? 'Publishing...' : 'Publish Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
