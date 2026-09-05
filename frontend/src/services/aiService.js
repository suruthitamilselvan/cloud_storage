import apiClient from './apiClient';

export const aiService = {
  summarizeFile: async (fileId) => {
    const res = await apiClient.get(`/ai/summarize/${fileId}`);
    return res.data.summary;
  },

  chatWithDocument: async (fileId, question) => {
    const res = await apiClient.post('/ai/chat', { fileId, question });
    return res.data.answer;
  }
};
