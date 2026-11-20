import api from './api'

export const analyticsService = {
  dashboard: () => api.get('/analytics/dashboard'),
  metrics: () => api.get('/reports/metrics'),
}
