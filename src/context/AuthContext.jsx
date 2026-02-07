import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('adminToken'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [token])

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/auth/admin-login', { email, password })
      localStorage.setItem('adminToken', data.token)
      setToken(data.token)
      setAdmin(data.admin)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      return true
    } catch (error) {
      throw error.response?.data?.error || 'Login failed'
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
    setAdmin(null)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
