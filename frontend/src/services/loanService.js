import api from './api'

export const loanService = {
  apply: (data) => api.post('/loans/apply', data),
  myLoans: () => api.get('/loans/my-loans'),
  getById: (id) => api.get(`/loans/${id}`),
  pending: () => api.get('/loans/pending'),
  approve: (id, data) => api.put(`/loans/${id}/approve`, data),
  reject: (id, data) => api.put(`/loans/${id}/reject`, data),
  calculateEmi: (data) => api.post('/loans/calculate-emi', data),
}
