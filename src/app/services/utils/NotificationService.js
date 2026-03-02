import { authFetch } from '../authFetch';

const API_URL = '/api';

export const NotificationService = {
  getNotifications: async (userId) => {
    if (!userId) return [];
    const { ok, data } = await authFetch(`${API_URL}/notifications/user/${userId}`);
    if (!ok || !data) return [];
    return data;
  },

  getUnreadNotifications: async (userId) => {
    if (!userId) return [];
    const { ok, data } = await authFetch(`${API_URL}/notifications/user/${userId}/unread`);
    if (!ok || !data) return [];
    return data;
  },

  markAsRead: async (notificationId) => {
    if (!notificationId) return false;
    const { ok } = await authFetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
    return ok;
  },

  getTutorNotifications: async (email) => {
    const result = await NotificationService.getNotifications(email);
    if (Array.isArray(result)) return result;
    if (result && Array.isArray(result.notifications)) return result.notifications;
    if (result && result.data && Array.isArray(result.data)) return result.data;
    return [];
  },

  getStudentNotifications: async (email) => {
    const result = await NotificationService.getNotifications(email);
    if (Array.isArray(result)) return result;
    if (result && Array.isArray(result.notifications)) return result.notifications;
    if (result && result.data && Array.isArray(result.data)) return result.data;
    return [];
  },

  markNotificationAsRead: async (notificationId) => {
    return NotificationService.markAsRead(notificationId);
  },

  markAllAsRead: async (email, role) => {
    return true;
  },
};
