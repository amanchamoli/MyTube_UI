import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { videoService } from '../api/videoService';
import VideoCard from '../components/video/VideoCard';
import CategoryPills from '../components/video/CategoryPills';
import { RefreshCw, SearchX } from 'lucide-react';

const PAGE_SIZE = 12;
const SCROLL_THROTTLE_MS = 500;
const LOAD_MORE_THRESHOLD = 500;

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    let isFetching = false;
    let currentPage = 1;
    let moreAvailable = false;
    let lastScrollCall = 0;
    let throttleTimeout;

    const fetchPage = async (page, append) => {
      if (isFetching) return;
      isFetching = true;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setLoadingMore(false);
        setVideos([]);
        setError(null);
      }

      const params = {
        page,
        limit: PAGE_SIZE,
        query: queryParam,
      };
      if (selectedCategory === 'Latest') {
        params.sortBy = 'createdAt';
        params.sortType = 'desc';
      } else if (selectedCategory === 'Trending') {
        params.sortBy = 'views';
        params.sortType = 'desc';
      }

      try {
        const res = await videoService.getVideos(params);
        if (!isActive) return;

        setVideos((currentVideos) => (
          append ? [...currentVideos, ...(res.videos || [])] : (res.videos || [])
        ));
        currentPage = res.page || page;
        moreAvailable = Boolean(res.hasMore);
      } catch (err) {
        console.error('Error fetching videos:', err);
        if (isActive && !append) {
          setError('Unable to load video feed. Please try again.');
        }
      } finally {
        isFetching = false;
        if (isActive) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    const handleScroll = () => {
      if (throttleTimeout) return;

      const delay = Math.max(0, SCROLL_THROTTLE_MS - (Date.now() - lastScrollCall));
      throttleTimeout = window.setTimeout(() => {
        throttleTimeout = null;
        lastScrollCall = Date.now();

        const nearBottom = window.innerHeight + window.scrollY
          >= document.documentElement.scrollHeight - LOAD_MORE_THRESHOLD;
        if (nearBottom && moreAvailable && !isFetching) {
          fetchPage(currentPage + 1, true);
        }
      }, delay);
    };

    fetchPage(1, false);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      isActive = false;
      window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(throttleTimeout);
    };
  }, [queryParam, selectedCategory, retryCount]);

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
          <button className="pill-btn" onClick={() => setRetryCount((count) => count + 1)}>
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
        <>
          <div className="video-grid">
            {videos.map((vid) => (
              <VideoCard key={vid._id} video={vid} />
            ))}
          </div>
          {loadingMore && (
            <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
              Loading more videos...
            </p>
          )}
        </>
      )}
    </div>
  );
}
