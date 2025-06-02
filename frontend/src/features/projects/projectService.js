import axiosInstance from './../../api/axiosInstance'

const API_URL = import.meta.env.VITE_API_URL + '/api/projects'

// Create a project
const createProject = async (projectData) => {
  const response = await axiosInstance.post(API_URL, projectData)
  return response.data
}

// Get all projects
const getAllProjects = async () => {
  const response = await axiosInstance.get(API_URL)
  return response.data
}

// Get a single project by ID
const getProjectById = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/${id}`)
  return response.data
}

// Delete a project by ID
const deleteProject = async (id) => {
  const response = await axiosInstance.delete(`/api/projects/${id}`)
  return response.data
}

/* const deleteProject = async (id) => {
  const response = await axiosInstance.delete(`projects/id`)
  return response.data
}
*/

// Get all projects created by a specific user
const getUserProjects = async () => {
  const response = await axiosInstance.get(`${API_URL}/user`)
  return response.data
}

// Update a project by ID
const updateProject = async (id, updatedData) => {
  const response = await axiosInstance.put(`${API_URL}/${id}`, updatedData)
  return response.data
}

// Get projects of currently logged in user
const getMyProjects = async () => {
  const response = await axiosInstance.get(`${API_URL}/my`)
  return response.data
}

const projectService = {
  createProject,
  getAllProjects,
  deleteProject,
  getProjectById,
  getUserProjects,
  updateProject,
  getMyProjects,
}

export default projectService
