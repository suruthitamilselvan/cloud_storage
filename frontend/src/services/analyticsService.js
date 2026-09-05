import apiClient from './apiClient';
import { fileService } from './fileService';

export const analyticsService = {
  getSummary: async () => {
    try {
      const res = await apiClient.get('/analytics/summary');
      if (res.data && res.data.totalStorageUsed) return res.data;
    } catch (e) {
      // ignore
    }

    const files = await fileService.getAllFiles();
    const totalStorageUsed = files.reduce((acc, f) => acc + (Number(f.size) || 0), 0);
    const totalStorageLimit = 16106127360; // 15 GB

    let docSize = 0, docCount = 0;
    let imgSize = 0, imgCount = 0;
    let vidSize = 0, vidCount = 0;
    let othSize = 0, othCount = 0;

    files.forEach((f) => {
      const sz = Number(f.size) || 0;
      const type = (f.type || f.mimeType || '').toLowerCase();
      if (type.includes('pdf') || type.includes('doc') || type.includes('txt') || type.includes('xls') || type.includes('ppt')) {
        docSize += sz;
        docCount++;
      } else if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg') || type.includes('webp')) {
        imgSize += sz;
        imgCount++;
      } else if (type.includes('video') || type.includes('mp4') || type.includes('mov') || type.includes('avi')) {
        vidSize += sz;
        vidCount++;
      } else {
        othSize += sz;
        othCount++;
      }
    });

    const denom = totalStorageUsed || 1;
    const categoryBreakdown = [
      { category: 'Documents', size: docSize, fileCount: docCount, percentage: parseFloat(((docSize / denom) * 100).toFixed(1)) },
      { category: 'Images', size: imgSize, fileCount: imgCount, percentage: parseFloat(((imgSize / denom) * 100).toFixed(1)) },
      { category: 'Videos', size: vidSize, fileCount: vidCount, percentage: parseFloat(((vidSize / denom) * 100).toFixed(1)) },
      { category: 'Other', size: othSize, fileCount: othCount, percentage: parseFloat(((othSize / denom) * 100).toFixed(1)) },
    ];

    return {
      totalStorageUsed,
      totalStorageLimit,
      categoryBreakdown,
    };
  }
};
