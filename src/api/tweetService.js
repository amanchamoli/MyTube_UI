import api from './apiClient';
import { authService } from './authService';

export const tweetService = {
  // Create a new tweet / community post
  async createTweet(content) {
    const res = await api.post('/tweets', { content });
    return res.data?.data;
  },

  // Get tweets / community posts for a user
  async getUserTweets(userId) {
    try {
      await authService.ensureGuestSession();
      const res = await api.get(`/tweets/user/${userId}`);
      return res.data?.data || [];
    } catch (err) {
      console.warn('Error fetching user tweets from API:', err);
      return [];
    }
  },

  // Update existing tweet (Owner only)
  async updateTweet(tweetId, content) {
    const res = await api.patch(`/tweets/${tweetId}`, { content });
    return res.data?.data;
  },

  // Delete tweet (Owner only)
  async deleteTweet(tweetId) {
    const res = await api.delete(`/tweets/${tweetId}`);
    return res.data;
  },

  // Toggle like on tweet / community post
  async toggleTweetLike(tweetId) {
    const res = await api.post(`/likes/toggle/t/${tweetId}`);
    return res.data?.data;
  },
};
