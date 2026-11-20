import api from './api'

export const creditService = {
  getScore: () => api.get('/credit/score'),
  initialize: () => api.post('/credit/initialize'),
  simulate: (data) => api.post('/credit/simulate', data),
  history: () => api.get('/credit/history'),
}
