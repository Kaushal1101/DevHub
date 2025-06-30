import { FaGithub } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'

export default function GithubRegister() {
  const navigate = useNavigate()

  const handleGithubAuth = () => {
    // Extract user JWT token from local storage
    // Use this to identify user during github login
    // Allows us to match user and github info 
    const token = localStorage.getItem('token')

    if (!token) {
      console.error('Token not found')
      return
    }

    try {
      // Cannot send token to identify user
      // Instead use it to find userId to send to backend
      const decoded = jwtDecode(token)
      const userId = decoded.id

      if (!userId) {
        console.error('User ID not found in token')
        return
      }

      // Add userid to url, it will get passed through callback to us
      window.location.href = `http://localhost:5001/auth/github?userId=${userId}&scope=repo,user:email`

    } catch (err) {
      console.error('Failed to decode token:', err)
    }
  }

  const skipGithub = () => {
    navigate('/')
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-gray-50 text-slate-900 shadow-xl rounded-2xl border border-slate-200">
        <div className="card-body p-8 space-y-5 text-center">
          <FaGithub className="text-4xl text-indigo-500 mx-auto mb-2 bg-white p-2 rounded-full shadow-sm" />
          <h1 className="text-2xl font-bold">Connect Your GitHub</h1>
          <p className="text-sm text-slate-500">
            To join or create projects on DevHub, we need access to your GitHub profile.
          </p>

          <button onClick={handleGithubAuth} className="w-full bg-black hover:bg-gray-800 text-white font-semibold rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition">
            <FaGithub className="text-lg" />
            Sign in with GitHub
          </button>

          <button onClick={skipGithub} className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg px-4 py-2 transition">
            Skip for now
          </button>
        </div>
      </div>
    </section>
  )
}