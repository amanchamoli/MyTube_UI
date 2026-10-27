import React, { useRef, useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function VideoPlayer({ videoUrl, poster, title }) {
  const videoRef = useRef(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [videoUrl]);

  const handleVideoError = () => {
    setHasError(true);
  };

  if (!videoUrl) {
    return (
      <div className="video-player-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No video source available</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="video-player-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#111' }}>
        <AlertCircle size={40} color="#ff6b6b" />
        <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Video playback error</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>The video could not be loaded from the server.</p>
      </div>
    );
  }

  return (
    <div className="video-player-wrapper">
      <video
        ref={videoRef}
        key={videoUrl}
        className="video-player-element"
        controls
        autoPlay
        playsInline
        poster={poster}
        onError={handleVideoError}
        aria-label={title || 'Video Player'}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
