import api from './apiClient';

export const dashboardService = {
  // 1. Get Channel Analytics / Stats: GET /dashboard/stats
  async getChannelStats() {
    const res = await api.get('/dashboard/stats');
    return res.data?.data || null;
  },

  // 2. Get Channel Videos (Creator Table): GET /dashboard/videos
  // Returns all videos uploaded by current logged in creator (including unpublished).
  async getChannelVideos() {
    const res = await api.get('/dashboard/videos');
    return res.data?.data || [];
  },
};
