import api from './api'

export const reportService = {
  generate: (data) => api.post('/reports/generate', data),
  myReports: () => api.get('/reports/my-reports'),
}
