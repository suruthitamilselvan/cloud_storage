const getStoredActivities = () => {
  try {
    const saved = localStorage.getItem('cloudvault_user_activities');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return [];
};

let localActivities = getStoredActivities();

const persistActivities = () => {
  try {
    localStorage.setItem('cloudvault_user_activities', JSON.stringify(localActivities));
  } catch (e) {
    // ignore
  }
};

export const activityService = {
  getActivities: () => {
    return localActivities;
  },

  logActivity: (type, title, description) => {
    const newAct = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type, // 'upload', 'create_folder', 'star', 'vault', 'trash'
      title,
      description,
      timestamp: 'Just now',
      rawDate: new Date().toISOString(),
    };
    localActivities = [newAct, ...localActivities];
    persistActivities();
    return newAct;
  },
};
