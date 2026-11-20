import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  role: null,

  login: (userData, token) => {
    localStorage.setItem('payvault_token', token)
    localStorage.setItem('payvault_user', JSON.stringify(userData))
    set({
      user: userData,
      token,
      isAuthenticated: true,
      role: userData.role,
    })
  },

  logout: () => {
    localStorage.removeItem('payvault_token')
    localStorage.removeItem('payvault_user')
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
    })
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('payvault_token')
    const userRaw = localStorage.getItem('payvault_user')
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw)
        set({
          user,
          token,
          isAuthenticated: true,
          role: user.role,
        })
      } catch {
        localStorage.removeItem('payvault_token')
        localStorage.removeItem('payvault_user')
      }
    }
  },
}))

export default useAuthStore
