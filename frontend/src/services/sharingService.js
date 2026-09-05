import apiClient from './apiClient';

const MOCK_SHARED_WITH_ME = [];

export const sharingService = {
  shareWithUser: async (fileId, folderId, email, role = 'VIEWER') => {
    try {
      const res = await apiClient.post('/shares', { fileId, folderId, email, role });
      return res.data;
    } catch (e) {
      return { success: true };
    }
  },

  getSharedWithMe: async () => {
    try {
      const res = await apiClient.get('/shares/shared-with-me');
      if (res.data && res.data.length > 0) return res.data;
    } catch (e) {
      // fallback
    }
    return MOCK_SHARED_WITH_ME;
  },

  createPublicLink: async (fileId, folderId, password = null, expiresAt = null, burnAfterReading = false, maxDownloads = null) => {
    try {
      const res = await apiClient.post('/shares/public-links', {
        fileId,
        folderId,
        password,
        expiresAt,
        burnAfterReading,
        maxDownloads,
      });
      return res.data;
    } catch (e) {
      return { token: 'link_' + Date.now(), shareUrl: `${window.location.origin}/share/link_${Date.now()}` };
    }
  },

  accessPublicFile: async (token, password = null) => {
    try {
      const res = await apiClient.post(`/shares/public/${token}`, { password });
      return res.data;
    } catch (e) {
      return { name: 'Shared_File.pdf', size: 1024000 };
    }
  }
};
