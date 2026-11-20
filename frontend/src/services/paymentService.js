import api from './api'

export const paymentService = {
  payEmi: (data) => api.post('/payments/pay-emi', data),
  history: () => api.get('/payments/history'),
}
