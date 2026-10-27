import api from './apiClient';
import { authService } from './authService';

export const playlistService = {
  // 1. Create Playlist: POST /playlist
  async createPlaylist({ name, description }) {
    const res = await api.post('/playlist', { name, description });
    return res.data?.data;
  },

  // 2. Get Playlist by ID: GET /playlist/:playlistId
  async getPlaylistById(playlistId) {
    try {
      await authService.ensureGuestSession();
      const res = await api.get(`/playlist/${playlistId}`);
      return res.data?.data || null;
    } catch (err) {
      console.error(`Error fetching playlist ${playlistId}:`, err);
      return null;
    }
  },

  // 3. Get User Playlists: GET /playlist/user/:userId
  async getUserPlaylists(userId) {
    try {
      await authService.ensureGuestSession();
      const res = await api.get(`/playlist/user/${userId}`);
      return res.data?.data || [];
    } catch (err) {
      console.warn(`Error fetching user playlists for ${userId}:`, err);
      return [];
    }
  },

  // 4. Update Playlist: PATCH /playlist/:playlistId
  async updatePlaylist(playlistId, { name, description }) {
    const res = await api.patch(`/playlist/${playlistId}`, { name, description });
    return res.data?.data;
  },

  // 5. Delete Playlist: DELETE /playlist/:playlistId
  async deletePlaylist(playlistId) {
    const res = await api.delete(`/playlist/${playlistId}`);
    return res.data;
  },

  // 6. Add Video to Playlist: PATCH /playlist/add/:videoId/:playlistId
  async addVideoToPlaylist(videoId, playlistId) {
    const res = await api.patch(`/playlist/add/${videoId}/${playlistId}`);
    return res.data?.data;
  },

  // 7. Remove Video from Playlist: PATCH /playlist/remove/:videoId/:playlistId
  async removeVideoFromPlaylist(videoId, playlistId) {
    const res = await api.patch(`/playlist/remove/${videoId}/${playlistId}`);
    return res.data?.data;
  },
};
