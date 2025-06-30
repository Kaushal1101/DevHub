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
import GithubRegister from './pages/GithubRegister'
import GithubSuccess from './pages/GithubSuccess'
import GithubError from './pages/GitHubError'
import FeaturePage from './pages/FeaturePage'
import ChatSpace from './pages/ChatSpace'
import ChatRoom from './pages/ChatRoom'
import ProposalPage from './pages/ProposalPage'



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
          <Route path="/github-register" element={<GithubRegister />} />
          <Route path="/github-success" element={<GithubSuccess />} />
          <Route path="/github-error" element={<GithubError />} />
          <Route path="/features/:id" element={<FeaturePage />} />
          <Route path="/chats" element={<ChatSpace />} />
          <Route path="/chats/:chatId" element={<ChatRoom />} />
          
          {/* Catch-all route for 404 */}
          <Route path="/proposals/:id" element={<ProposalPage />} />
        </Routes>
      </main>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )  
}

export default App
