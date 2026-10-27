import api from './apiClient';
import { authService } from './authService';

// In-flight request cache to deduplicate simultaneous/rapid calls and prevent duplicate view count increments
const videoFetchCache = new Map();

export const videoService = {
  // Fetch paginated videos from backend API
  async getVideos({ page = 1, limit = 12, query = '', sortBy = 'createdAt', sortType = 'desc', userId = '' } = {}) {
    try {
      await authService.ensureGuestSession();

      const params = { page, limit, sortBy, sortType };
      if (query && query.trim()) params.query = query.trim();
      if (userId) params.userId = userId;

      const res = await api.get('/videos', { params });
      const apiVideos = res.data?.data?.docs || [];

      return {
        videos: apiVideos,
        totalDocs: res.data?.data?.totalDocs ?? apiVideos.length,
        totalPages: res.data?.data?.totalPages ?? 1,
        page: res.data?.data?.page ?? page,
        hasMore: res.data?.data?.hasNextPage ?? false,
      };
    } catch (err) {
      console.error('Error fetching videos from API:', err);
      return {
        videos: [],
        totalDocs: 0,
        totalPages: 1,
        page: 1,
        hasMore: false,
      };
    }
  },

  // Fetch single video details by videoId from backend API (deduplicated to prevent double view counts)
  async getVideoById(videoId) {
    const now = Date.now();
    const cached = videoFetchCache.get(videoId);
    if (cached && now - cached.timestamp < 2000) {
      return cached.promise;
    }

    const fetchPromise = (async () => {
      try {
        await authService.ensureGuestSession();
        const res = await api.get(`/videos/${videoId}`);
        return res.data?.data || null;
      } catch (err) {
        console.error(`Error fetching video ${videoId} from API:`, err);
        return null;
      }
    })();

    videoFetchCache.set(videoId, { timestamp: now, promise: fetchPromise });
    return fetchPromise;
  },

  // Upload & publish a new video (multipart/form-data)
  async publishVideo(formData, onUploadProgress) {
    const res = await api.post('/videos', formData, {
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
    return res.data?.data;
  },

  // Update video details (title, description, and optional new thumbnail)
  async updateVideo(videoId, data) {
    // If data is FormData, send directly; otherwise send as json
    const res = await api.patch(`/videos/${videoId}`, data);
    return res.data?.data;
  },

  // Delete video permanently
  async deleteVideo(videoId) {
    const res = await api.delete(`/videos/${videoId}`);
    return res.data;
  },

  // Toggle video publish status (Public <-> Private)
  async togglePublishStatus(videoId) {
    const res = await api.patch(`/videos/toggle/publish/${videoId}`);
    return res.data?.data;
  },

  // Get current logged-in creator's uploaded videos (including unpublished)
  async getCreatorVideos() {
    const res = await api.get('/dashboard/videos');
    return res.data?.data || [];
  },

  // Get creator channel statistics
  async getChannelStats() {
    const res = await api.get('/dashboard/stats');
    return res.data?.data || null;
  },

  // Toggle video like (Auth required)
  async toggleLike(videoId) {
    const res = await api.post(`/likes/toggle/v/${videoId}`);
    return res.data?.data;
  },

  // Toggle channel subscription (Auth required)
  async toggleSubscribe(channelId) {
    const res = await api.post(`/subscriptions/c/${channelId}`);
    return res.data?.data;
  },

  // Get comments for video from backend API
  async getComments(videoId) {
    try {
      await authService.ensureGuestSession();
      const res = await api.get(`/comments/${videoId}`);
      return res.data?.data?.docs || [];
    } catch (err) {
      console.warn('Error loading comments from API:', err);
      return [];
    }
  },

  // Add a new comment (Auth required)
  async addComment(videoId, content) {
    const res = await api.post(`/comments/${videoId}`, { content });
    return res.data?.data;
  }
};
