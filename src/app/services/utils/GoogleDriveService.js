import { authFetch } from '../authFetch';

const API_URL = '/api';

export const GoogleDriveService = {
  uploadPaymentProofFile: async (sessionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    const { ok, data } = await authFetch(`${API_URL}/drive/upload-proof`, {
      method: 'POST',
      body: formData,
    });

    if (ok && data) return data;
    return { success: false, error: data?.error || 'Failed to upload file' };
  },
};
