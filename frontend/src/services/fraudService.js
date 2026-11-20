import api from './api'

export const fraudService = {
  stats: () => api.get('/fraud/stats'),
}
