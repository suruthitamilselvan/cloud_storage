import apiClient from './apiClient';
import { activityService } from './activityService';

const LEGACY_MOCK_FILE_IDS = ['1', '2', '3', '4', '5', 'r1', 'r2', 'r3', 'r4', 'r5'];

const isLegacyMockFile = (file) => {
  if (!file) return true;
  if (!file.id || typeof file.id !== 'string') return true;
  // All user-uploaded files have IDs generated starting with 'f_'
  if (file.id.startsWith('f_')) return false;
  // Non-'f_' files are legacy mock data and should be purged
  return true;
};

const getStoredFiles = () => {
  try {
    const saved = localStorage.getItem('cloudvault_user_files');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((f) => !isLegacyMockFile(f));
      }
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_MOCK_FILES;
};

let localFiles = getStoredFiles();

const persistFiles = () => {
  try {
    localStorage.setItem('cloudvault_user_files', JSON.stringify(localFiles));
  } catch (e) {
    // ignore
  }
};

// Immediately persist cleaned list to clear any stale mock files in browser storage
persistFiles();

export const fileService = {
  checkDuplicate: (name, folderId) => {
    return localFiles.find(
      (f) => f.name.toLowerCase() === name.toLowerCase() && (folderId ? f.folderId === folderId : !f.folderId) && !f.isTrashed
    );
  },

  uploadFile: async (
    file,
    folderId = null,
    isEncrypted = false,
    encryptionIv = null,
    onUploadProgress,
    handleDuplicateMode = 'replace'
  ) => {
    if (onUploadProgress) onUploadProgress(40);

    let fileName = file.name || 'Uploaded_File';

    if (handleDuplicateMode === 'keep_both') {
      const parts = fileName.split('.');
      const ext = parts.length > 1 ? '.' + parts.pop() : '';
      const base = parts.join('.');
      fileName = `${base} (1)${ext}`;
    } else if (handleDuplicateMode === 'replace') {
      localFiles = localFiles.filter(
        (f) => !(f.name.toLowerCase() === fileName.toLowerCase() && (folderId ? f.folderId === folderId : !f.folderId) && !f.isTrashed)
      );
    }

    let previewUrl = null;
    const isImageFile = (file.type && file.type.includes('image')) || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(fileName);
    if (isImageFile && file instanceof Blob) {
      try {
        previewUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      } catch (e) {
        previewUrl = null;
      }
    }

    const fileExt = fileName.split('.').pop()?.toUpperCase() || 'FILE';

    const newFile = {
      id: 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: fileName,
      size: file.size || 1024,
      mimeType: file.type || (isImageFile ? 'image/png' : 'application/octet-stream'),
      type: fileExt,
      folderId: folderId,
      tags: isEncrypted ? 'encrypted,secure-vault' : isImageFile ? 'image,uploaded' : 'uploaded',
      isStarred: false,
      isEncrypted: isEncrypted,
      encryptionIv: encryptionIv,
      previewUrl: previewUrl,
      timeAgo: 'Just now',
      extractedText: 'Extracted text content for ' + fileName,
    };

    localFiles = [newFile, ...localFiles];
    persistFiles();

    try {
      activityService.logActivity('upload', 'Uploaded new file', `${fileName} was uploaded to CloudVault.`);
    } catch (e) {
      // ignore
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) formData.append('folderId', folderId);
      if (isEncrypted) formData.append('isEncrypted', 'true');
      if (encryptionIv) formData.append('encryptionIv', encryptionIv);

      await apiClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => onUploadProgress && p.total && onUploadProgress(Math.round((p.loaded * 100) / p.total)),
      });
    } catch (err) {
      // Backend offline or fallback
    }

    if (onUploadProgress) onUploadProgress(100);
    return newFile;
  },

  getAllFiles: async () => {
    return localFiles.filter((f) => !f.isTrashed && !isLegacyMockFile(f));
  },

  getFiles: async (folderId = null) => {
    try {
      const res = await apiClient.get('/files', { params: folderId ? { folderId } : {} });
      if (res.data && res.data.length > 0) {
        const userBackendFiles = res.data.filter((f) => !isLegacyMockFile(f));
        if (userBackendFiles.length > 0) {
          const backendIds = new Set(userBackendFiles.map((f) => f.id));
          const combined = [...localFiles.filter((f) => !backendIds.has(f.id)), ...userBackendFiles];
          return combined.filter((f) => !f.isEncrypted && !f.isTrashed && (folderId ? f.folderId === folderId : !f.folderId));
        }
      }
    } catch (err) {
      // ignore
    }

    if (!folderId) {
      // Root / My Drive: return all user-uploaded files so Archive Catalog lists uploaded documents
      return localFiles.filter((f) => !f.isEncrypted && !f.isTrashed && !isLegacyMockFile(f));
    }

    // Specific Folder view: return files inside this folder ONLY
    return localFiles.filter((f) => f.folderId === folderId && !f.isEncrypted && !f.isTrashed && !isLegacyMockFile(f));
  },

  getVaultFiles: async () => {
    try {
      const res = await apiClient.get('/files/vault');
      if (res.data && res.data.length > 0) return res.data;
    } catch (err) {
      // ignore
    }
    return localFiles.filter(f => f.isEncrypted && !f.isTrashed);
  },

  getStarredFiles: async () => {
    try {
      const res = await apiClient.get('/files/starred');
      if (res.data && res.data.length > 0) return res.data;
    } catch (err) {
      // ignore
    }
    return localFiles.filter(f => f.isStarred && !f.isTrashed);
  },

  getTrashedFiles: async () => {
    try {
      const res = await apiClient.get('/files/trash');
      if (res.data && res.data.length > 0) return res.data;
    } catch (err) {
      // ignore
    }
    return localFiles.filter(f => f.isTrashed);
  },

  toggleStar: async (fileId) => {
    const target = localFiles.find((f) => f.id === fileId);
    localFiles = localFiles.map((f) => (f.id === fileId ? { ...f, isStarred: !f.isStarred } : f));
    persistFiles();
    if (target) {
      try {
        activityService.logActivity('star', target.isStarred ? 'Unstarred item' : 'Starred item', `Updated star status for ${target.name}.`);
      } catch (e) {
        // ignore
      }
    }
    try {
      await apiClient.post(`/files/${fileId}/star`);
    } catch (err) {
      // ignore
    }
    return localFiles.find((f) => f.id === fileId);
  },

  moveToTrash: async (fileId) => {
    const target = localFiles.find((f) => f.id === fileId);
    localFiles = localFiles.map((f) => (f.id === fileId ? { ...f, isTrashed: true } : f));
    persistFiles();
    if (target) {
      try {
        activityService.logActivity('trash', 'Moved item to Trash', `${target.name} was moved to Trash.`);
      } catch (e) {
        // ignore
      }
    }
    try {
      await apiClient.delete(`/files/${fileId}/trash`);
    } catch (err) {
      // ignore
    }
    return localFiles.find((f) => f.id === fileId);
  },

  restoreFromTrash: async (fileId) => {
    localFiles = localFiles.map(f => f.id === fileId ? { ...f, isTrashed: false } : f);
    try {
      await apiClient.post(`/files/${fileId}/restore`);
    } catch (err) {
      // ignore
    }
    return localFiles.find(f => f.id === fileId);
  },

  deletePermanently: async (fileId) => {
    localFiles = localFiles.filter(f => f.id !== fileId);
    try {
      await apiClient.delete(`/files/${fileId}/purge`);
    } catch (err) {
      // ignore
    }
    return true;
  },

  addComment: async (fileId, content, xPos = null, yPos = null, pageNumber = 1) => {
    try {
      const res = await apiClient.post(`/files/${fileId}/comments`, { content, xPos, yPos, pageNumber });
      return res.data;
    } catch (err) {
      return { id: 'c_' + Date.now(), userFullName: 'Alex Mercer', content, createdAt: new Date().toISOString() };
    }
  },

  getComments: async (fileId) => {
    try {
      const res = await apiClient.get(`/files/${fileId}/comments`);
      return res.data;
    } catch (err) {
      return [
        { id: 'c1', userFullName: 'Sarah Connor', content: 'Approved initial draft specifications.' },
        { id: 'c2', userFullName: 'Alex Mercer', content: 'Updated architecture diagram on page 2.' }
      ];
    }
  },

  searchFiles: async (query) => {
    const q = query.toLowerCase();
    return localFiles.filter(f =>
      f.name.toLowerCase().includes(q) || (f.tags && f.tags.toLowerCase().includes(q)) || (f.extractedText && f.extractedText.toLowerCase().includes(q))
    );
  }
};
