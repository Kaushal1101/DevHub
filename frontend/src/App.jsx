import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout, getMe } from './features/auth/authSlice'

import Navbar from './components/Navbar'    
import HomePage from './pages/HomePage'
import CreateProject from './pages/CreateProject'
import Register from './pages/Register'
import Login from './pages/Login'
import ViewProject from './pages/ViewProject' 
import EditProfile from './pages/EditProfile'
import UserProfile from './pages/UserProfile'
import MyProfile from './pages/MyProfile'
import MyProjects from './pages/MyProjects'
import EditProject from './pages/EditProject'



const App = () => {
  return (
    <>
      <Navbar />     
      <main className="pt-4">  
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateProject />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path='/projects/:id' element={<ViewProject />} />
          <Route path='/create' element={<CreateProject />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/projects/:id/edit" element={<EditProject />} />

        </Routes>
      </main>

      <ToastContainer position="top-right" autoClose={3000} /> // change the duration accordingly
    </>
  )  
}

export default App
