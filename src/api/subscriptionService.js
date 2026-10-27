import api from './apiClient';
import { authService } from './authService';

export const subscriptionService = {
  // 1. Toggle Channel Subscription: POST /subscriptions/c/:channelId
  async toggleSubscription(channelId) {
    const res = await api.post(`/subscriptions/c/${channelId}`);
    return res.data?.data;
  },

  // 2. Get Subscribers of a Channel: GET /subscriptions/c/:channelId
  async getChannelSubscribers(channelId) {
    try {
      await authService.ensureGuestSession();
      const res = await api.get(`/subscriptions/c/${channelId}`);
      const raw = res.data?.data || [];
      // Normalize [{ subscriber: { ... } }] or [{ ...subscriber }]
      return raw.map((item) => {
        if (item.subscriber && typeof item.subscriber === 'object') {
          return {
            ...item.subscriber,
            subscriptionRecordId: item._id,
            subscribedAt: item.createdAt,
          };
        }
        return item;
      });
    } catch (err) {
      console.warn(`Error fetching subscribers for channel ${channelId}:`, err);
      return [];
    }
  },

  // 3. Get Channels a User Has Subscribed To: GET /subscriptions/u/:subscriberId
  async getSubscribedChannels(subscriberId) {
    try {
      await authService.ensureGuestSession();
      const res = await api.get(`/subscriptions/u/${subscriberId}`);
      const raw = res.data?.data || [];
      // Normalize [{ subscribedChannel: { ... } }] or [{ ...channel }]
      return raw.map((item) => {
        if (item.subscribedChannel && typeof item.subscribedChannel === 'object') {
          return {
            ...item.subscribedChannel,
            subscriptionRecordId: item._id,
            subscribedAt: item.createdAt,
          };
        }
        return item;
      });
    } catch (err) {
      console.warn(`Error fetching subscribed channels for user ${subscriberId}:`, err);
      return [];
    }
  },
};
