import api from './api'

export const chatbotService = {
  chat: (data) =>
    api.post('/ai/chat', data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('payvault_token')}`,
      },
    }),
  sessions: () => api.get('/ai/sessions'),
  messages: (id) => api.get(`/ai/sessions/${id}/messages`),
}
