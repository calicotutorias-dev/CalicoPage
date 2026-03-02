import { authFetch } from '../authFetch';

const API_URL = '/api';

export const JointAvailabilityService = {
  getJointAvailability: async (course) => {
    const { ok, data } = await authFetch(`${API_URL}/availability/joint/${course}`);
    if (!ok || !data) return [];
    return data;
  },
};
