import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { videoService } from '../api/videoService';
import VideoCard from '../components/video/VideoCard';
import CategoryPills from '../components/video/CategoryPills';
import { Film, RefreshCw, SearchX } from 'lucide-react';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        query: queryParam,
      };
      if (selectedCategory === 'Latest') {
        params.sortBy = 'createdAt';
        params.sortType = 'desc';
      } else if (selectedCategory === 'Trending') {
        params.sortBy = 'views';
        params.sortType = 'desc';
      }
      const res = await videoService.getVideos(params);
      setVideos(res.videos || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Unable to load video feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [queryParam, selectedCategory]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    if (queryParam) {
      // Clear search param when switching categories
      searchParams.delete('q');
      setSearchParams(searchParams);
    }
  };

  return (
    <div>
      <CategoryPills
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {queryParam && (
        <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Search results for: <span style={{ color: 'var(--text-primary)' }}>"{queryParam}"</span>
          </h2>
          <button
            className="pill-btn"
            onClick={() => {
              searchParams.delete('q');
              setSearchParams(searchParams);
            }}
          >
            Clear Search
          </button>
        </div>
      )}

      {loading ? (
        <div className="video-grid">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9' }} />
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 16, width: '90%' }} />
                  <div className="skeleton" style={{ height: 12, width: '60%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#ff6b6b', marginBottom: 16 }}>{error}</p>
          <button className="pill-btn" onClick={fetchVideos}>
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      ) : videos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-secondary)' }}>
          <SearchX size={52} style={{ marginBottom: 16, opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 8 }}>No videos found</h3>
          <p style={{ fontSize: '0.9rem' }}>Try different search keywords or remove filters.</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((vid) => (
            <VideoCard key={vid._id} video={vid} />
          ))}
        </div>
      )}
    </div>
  );
}
