import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'
import useAuthStore from '../store/authStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { login, logout: storeLogout, loadFromStorage, user, token, isAuthenticated, role } =
    useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      loadFromStorage()
      const storedToken = localStorage.getItem('payvault_token')
      if (storedToken) {
        try {
          const { data } = await authService.me()
          login(data, storedToken)
        } catch {
          storeLogout()
        }
      }
      setLoading(false)
    }
    init()
  }, [loadFromStorage, login, storeLogout])

  const loginUser = async (credentials) => {
    const { data } = await authService.login(credentials)
    login(data.user, data.accessToken)
    return data
  }

  const registerUser = async (payload) => {
    const { data } = await authService.register(payload)
    return data
  }

  // Auth-code flow returns { code }; ID-token flow returns { credential }
  const googleLogin = async (credentialResponse) => {
    try {
      const { data } = await authService.googleLogin({
        code: credentialResponse.code || credentialResponse.credential,
      })
      login(data.user, data.accessToken)
      return data
    } catch (error) {
      throw error
    }
  }

  const getCurrentUser = async () => {
    const { data } = await authService.me()
    const currentToken = localStorage.getItem('payvault_token')
    login(data, currentToken)
    return data
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // ignore logout API errors
    } finally {
      storeLogout()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        role,
        loading,
        loginUser,
        registerUser,
        googleLogin,
        getCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
