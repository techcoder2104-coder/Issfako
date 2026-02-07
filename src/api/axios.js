import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lssnako-qu2r.vercel.app'

const api = axios.create({
  baseURL: API_BASE_URL
})

// Add token to requests and handle FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Don't set Content-Type for FormData - let browser set it
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  } else {
    delete config.headers['Content-Type']
  }

  return config
})

// Handle response errors
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      message: error.message
    })
    return Promise.reject(error)
  }
)

export default api
