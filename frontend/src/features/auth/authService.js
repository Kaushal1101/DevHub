import axiosInstance from './../../api/axiosInstance'

const API_URL = import.meta.env.VITE_API_URL + '/api/users' // fixed the API_URL (was showing /api twice in browser console)

// Register user (fixed registering issue not showing in database)
const register = async (userData) => {
        //console.log('Registering user with data:', userData)
        const response = await axiosInstance.post(API_URL, userData)

        //console.log('Recieved response:', response.data)
        if(response.data) {
            localStorage.setItem('user', JSON.stringify(response.data))
            localStorage.setItem('token', response.data.token)
        }

        return response.data   
}

// Login user
const login = async (userData) => {
  const response = await axiosInstance.post(API_URL + '/login', userData)
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data))
    localStorage.setItem('token', response.data.token)
  }
  return response.data
}

// Logout user
const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
}

// Get current user data
const getMe = async () => {
  const response = await axiosInstance.get(API_URL + '/me')
  return response.data
}

// Update user profile
const updateProfile = async (data) => {
  const response = await axiosInstance.put('/api/users/me', data)
  return response.data
}

const authService = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
}

export default authService
