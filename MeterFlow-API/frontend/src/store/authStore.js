import { create } from 'zustand'
import axios from 'axios'

axios.defaults.withCredentials = true

const authToken = localStorage.getItem('token')

if (authToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: authToken || null,
  loading: false,
  
  login: async (credentials) => {
    set({ loading: true })
    try {
      const { data } = await axios.post('/api/auth/login', credentials)
      set({ 
        user: data.user,
        token: data.accessToken
      })
      localStorage.setItem('token', data.accessToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
      return data
    } catch (error) {
      throw error.response?.data?.error || 'Login failed'
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    set({ user: null, token: null })
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  },

  setUser: (user) => set({ user }),

  checkAuth: async () => {
    if (!get().token) return null
    
    try {
      const { data } = await axios.get('/api/auth/profile')
      set({ user: data })
      return data
    } catch {
      get().logout()
      return null
    }
  }
}))
