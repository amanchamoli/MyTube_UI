import api from './apiClient';
import { authService } from './authService';

export const commentService = {
  // Get paginated comments for a video
  async getVideoComments(videoId, { page = 1, limit = 20 } = {}) {
    try {
      await authService.ensureGuestSession();
      const res = await api.get(`/comments/${videoId}`, {
        params: { page, limit },
      });
      return {
        docs: res.data?.data?.docs || [],
        totalDocs: res.data?.data?.totalDocs ?? 0,
        page: res.data?.data?.page ?? page,
        totalPages: res.data?.data?.totalPages ?? 1,
      };
    } catch (err) {
      console.warn('Error loading comments from API:', err);
      return { docs: [], totalDocs: 0, page: 1, totalPages: 1 };
    }
  },

  // Add a new comment to a video
  async addComment(videoId, content) {
    const res = await api.post(`/comments/${videoId}`, { content });
    return res.data?.data;
  },

  // Update existing comment (Owner only)
  async updateComment(commentId, content) {
    const res = await api.patch(`/comments/c/${commentId}`, { content });
    return res.data?.data;
  },

  // Delete comment (Owner only)
  async deleteComment(commentId) {
    const res = await api.delete(`/comments/c/${commentId}`);
    return res.data;
  },

  // Toggle like on a comment
  async toggleCommentLike(commentId) {
    const res = await api.post(`/likes/toggle/c/${commentId}`);
    return res.data?.data;
  },
};
