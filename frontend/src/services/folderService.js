import apiClient from './apiClient';
import { activityService } from './activityService';

const INITIAL_MOCK_FOLDERS = [];
const LEGACY_MOCK_IDS = ['fld1', 'fld2', 'fld3', 'fld4'];

const getStoredFolders = () => {
  try {
    const saved = localStorage.getItem('cloudvault_user_folders');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Purge legacy default mock folders
        return parsed.filter((f) => !LEGACY_MOCK_IDS.includes(String(f.id)));
      }
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_MOCK_FOLDERS;
};

let localFolders = getStoredFolders();

const persistFolders = () => {
  try {
    localStorage.setItem('cloudvault_user_folders', JSON.stringify(localFolders));
  } catch (e) {
    // ignore
  }
};

export const folderService = {
  createFolder: async (name, parentId = null) => {
    const newFolder = {
      id: 'fld_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: name,
      parentId: parentId,
      isStarred: false,
      isTrashed: false,
    };
    localFolders.push(newFolder);
    persistFolders();

    try {
      activityService.logActivity('create_folder', 'Created folder', `Created folder "${name}".`);
    } catch (e) {
      // ignore
    }

    try {
      await apiClient.post('/folders', { name, parentId });
    } catch (e) {
      // ignore
    }

    return newFolder;
  },

  getFolders: async (parentId = null) => {
    try {
      const res = await apiClient.get('/folders', { params: parentId ? { parentId } : {} });
      if (res.data && res.data.length > 0) {
        const userBackendFolders = res.data.filter((f) => !LEGACY_MOCK_IDS.includes(String(f.id)));
        if (userBackendFolders.length > 0) {
          const backendIds = new Set(userBackendFolders.map((f) => f.id));
          return [
            ...userBackendFolders.filter((f) => (parentId ? f.parentId === parentId : !f.parentId)),
            ...localFolders.filter((f) => (parentId ? f.parentId === parentId : !f.parentId) && !f.isTrashed && !backendIds.has(f.id)),
          ];
        }
      }
    } catch (e) {
      // ignore
    }
    return localFolders.filter((f) => (parentId ? f.parentId === parentId : !f.parentId) && !f.isTrashed);
  },

  getBreadcrumbs: async (folderId) => {
    if (!folderId) return [];
    try {
      const res = await apiClient.get(`/folders/${folderId}/breadcrumbs`);
      if (res.data && res.data.length > 0) return res.data;
    } catch (e) {
      // fallback
    }

    const trail = [];
    let current = localFolders.find((f) => f.id === folderId);
    while (current) {
      trail.unshift({ id: current.id, name: current.name });
      current = current.parentId ? localFolders.find((f) => f.id === current.parentId) : null;
    }
    return trail;
  },

  moveToTrash: async (folderId) => {
    localFolders = localFolders.map((f) => (f.id === folderId ? { ...f, isTrashed: true } : f));
    persistFolders();
    try {
      await apiClient.delete(`/folders/${folderId}/trash`);
    } catch (e) {
      // ignore
    }
    return localFolders.find((f) => f.id === folderId);
  },
};

