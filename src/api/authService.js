import api from './apiClient';

export const authService = {
  // Login with username or email + password
  async login({ username, email, password }) {
    const payload = {};
    if (email) payload.email = email;
    if (username) payload.username = username;
    payload.password = password;

    const res = await api.post('/users/login', payload);
    const data = res.data?.data;
    if (data?.accessToken) {
      localStorage.setItem('mytube_access_token', data.accessToken);
    }
    if (data?.refreshToken) {
      localStorage.setItem('mytube_refresh_token', data.refreshToken);
    }
    if (data?.user) {
      localStorage.setItem('mytube_user', JSON.stringify(data.user));
    }
    return data;
  },

  // Refresh Access Token: POST /users/refresh-token
  async refreshAccessToken() {
    const refreshToken = localStorage.getItem('mytube_refresh_token');
    const res = await api.post(
      '/users/refresh-token',
      refreshToken ? { refreshToken } : {}
    );
    const data = res.data?.data;
    if (data?.accessToken) {
      localStorage.setItem('mytube_access_token', data.accessToken);
    }
    if (data?.refreshToken) {
      localStorage.setItem('mytube_refresh_token', data.refreshToken);
    }
    return data;
  },

  // Register a new user
  async register(formData) {
    const res = await api.post('/users/register', formData);
    return res.data?.data;
  },

  // Logout
  async logout() {
    try {
      await api.post('/users/logout');
    } catch (e) {
      console.warn('Logout API call failed, clearing local session anyway', e);
    } finally {
      localStorage.removeItem('mytube_access_token');
      localStorage.removeItem('mytube_refresh_token');
      localStorage.removeItem('mytube_user');
      window.dispatchEvent(new Event('mytube_auth_cleared'));
    }
  },

  // Get current logged-in user profile
  async getCurrentUser() {
    const token = localStorage.getItem('mytube_access_token');
    if (!token) return null;
    try {
      const res = await api.get('/users/current-user');
      const user = res.data?.data;
      if (user) {
        localStorage.setItem('mytube_user', JSON.stringify(user));
      }
      return user;
    } catch {
      return null;
    }
  },

  // Change current user password
  async changePassword({ oldPassword, newPassword }) {
    const res = await api.post('/users/change-password', { oldPassword, newPassword });
    return res.data;
  },

  // Update account details (fullname, email)
  async updateAccountDetails({ fullname, email }) {
    const res = await api.patch('/users/update-account', { fullname, email });
    const updatedUser = res.data?.data;
    if (updatedUser) {
      const current = JSON.parse(localStorage.getItem('mytube_user') || '{}');
      const merged = { ...current, ...updatedUser };
      localStorage.setItem('mytube_user', JSON.stringify(merged));
    }
    return updatedUser;
  },

  // Update user avatar image (multipart/form-data)
  async updateAvatar(avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    const res = await api.patch('/users/avatar', formData);
    const updatedUser = res.data?.data;
    if (updatedUser) {
      const current = JSON.parse(localStorage.getItem('mytube_user') || '{}');
      const merged = { ...current, ...updatedUser };
      localStorage.setItem('mytube_user', JSON.stringify(merged));
    }
    return updatedUser;
  },

  // Update user cover/banner image (multipart/form-data)
  async updateCoverImage(coverImageFile) {
    const formData = new FormData();
    formData.append('coverImage', coverImageFile);
    const res = await api.patch('/users/cover-image', formData);
    const updatedUser = res.data?.data;
    if (updatedUser) {
      const current = JSON.parse(localStorage.getItem('mytube_user') || '{}');
      const merged = { ...current, ...updatedUser };
      localStorage.setItem('mytube_user', JSON.stringify(merged));
    }
    return updatedUser;
  },

  // Get user public channel profile by username
  async getUserChannel(username) {
    await this.ensureGuestSession();
    const res = await api.get(`/users/c/${username}`);
    return res.data?.data;
  },

  // Get current user watch history
  async getWatchHistory() {
    await this.ensureGuestSession();
    const res = await api.get('/users/history');
    return res.data?.data || [];
  },

  // Auto-acquire or ensure guest token so public routes can talk to API if protected
  async ensureGuestSession() {
    let token = localStorage.getItem('mytube_access_token');
    if (token) return token;

    try {
      const guestRes = await api.post('/users/login', {
        username: 'guest_1791983111578',
        password: 'GuestPass123!'
      });
      const data = guestRes.data?.data;
      if (data?.accessToken) {
        localStorage.setItem('mytube_guest_token', data.accessToken);
        if (!localStorage.getItem('mytube_access_token')) {
          localStorage.setItem('mytube_access_token', data.accessToken);
          localStorage.setItem('mytube_is_guest', 'true');
        }
        return data.accessToken;
      }
    } catch (e) {
      console.warn('Could not auto-login guest user, falling back to local guest mode', e);
    }
    return null;
  }
};
