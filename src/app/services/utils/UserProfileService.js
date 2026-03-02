import { authFetch } from '../authFetch';

const API_URL = '/api';

export const UserProfileService = {
  getUserProfile: async (identifier) => {
    const isEmail = identifier.includes('@');
    let url = `${API_URL}/user/${identifier}`;
    if (isEmail) {
      url = `${API_URL}/user/by-email/${identifier}`;
    }

    const { ok, data } = await authFetch(url);

    if (!ok) {
      // Fallback for email
      if (isEmail) {
        const fallback = await authFetch(`${API_URL}/user/email/${identifier}`);
        if (fallback.ok && fallback.data) {
          return { success: true, data: fallback.data };
        }
      }
      return {
        success: false,
        error: data?.message || data?.error || 'User not found',
      };
    }

    return {
      success: data?.success !== false,
      data: data?.user || data,
    };
  },

  updateUserProfile: async (uid, profileData) => {
    const { ok, data } = await authFetch(`${API_URL}/user/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    if (ok && data) return data;
    return { success: false, error: data?.message || 'Failed to update profile' };
  },

  createUser: async (userData) => {
    const { ok, data } = await authFetch(`${API_URL}/user`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (ok && data) return data;
    return { success: false, error: data?.message || 'Failed to create user' };
  },

  getTutorCourses: async (id) => {
    const { ok, data } = await authFetch(
      `${API_URL}/courses?email=${encodeURIComponent(id)}`
    );
    if (ok && data) {
      return { success: true, data: data.courses || data.materias || [] };
    }
    return { success: false, error: 'Failed to fetch tutor courses' };
  },
};
