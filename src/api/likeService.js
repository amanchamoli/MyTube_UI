import api from './apiClient';

export const likeService = {
  // 1. Toggle Video Like: POST /likes/toggle/v/:videoId
  async toggleVideoLike(videoId) {
    const res = await api.post(`/likes/toggle/v/${videoId}`);
    return res.data?.data;
  },

  // 2. Toggle Comment Like: POST /likes/toggle/c/:commentId
  async toggleCommentLike(commentId) {
    const res = await api.post(`/likes/toggle/c/${commentId}`);
    return res.data?.data;
  },

  // 3. Toggle Tweet Like: POST /likes/toggle/t/:tweetId
  async toggleTweetLike(tweetId) {
    const res = await api.post(`/likes/toggle/t/${tweetId}`);
    return res.data?.data;
  },

  // 4. Get Liked Videos of Current User: GET /likes/videos
  async getLikedVideos() {
    const res = await api.get('/likes/videos');
    const rawList = res.data?.data || [];
    // Normalize in case backend returns [{ video: { ... } }] or [{ ...video }]
    return rawList.map((item) => {
      if (item.video && typeof item.video === 'object') {
        return {
          ...item.video,
          likedRecordId: item._id,
          likedAt: item.createdAt,
        };
      }
      return item;
    });
  },
};
