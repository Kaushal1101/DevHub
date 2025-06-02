import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaSignInAlt } from 'react-icons/fa'
import { login, reset } from '../features/auth/authSlice'
import Spinner from '../components/Spinner'

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const { username, password } = formData

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    if (isError && message) {
      toast.error(message)
      dispatch(reset())
    }
  }, [isError, message, dispatch])

  useEffect(() => {
    if (isSuccess || user) {
      navigate('/')
      dispatch(reset())
    }
  }, [isSuccess, user, navigate, dispatch])

  /* Accidentally mutated the state directly LOL
  const onChange = (e) => {
    formData[e.target.name] = e.target.value
  */

  const onChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch(login({ username, password }))
  }

  if (isLoading) return <Spinner />

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="card w-full max-w-sm bg-slate-100 text-slate-900 shadow-2xl rounded-2xl border border-slate-200">
        <div className="card-body p-8 space-y-6">
          <div className="text-center">
            <FaSignInAlt className="text-5xl text-indigo-500 mx-auto mb-3 bg-white p-3 rounded-full shadow-sm" />
            <h2 className="text-3xl font-bold">Welcome Back</h2>
            <p className="text-sm text-slate-500">Log in to your DevHub account</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="Username"
              className="input input-bordered w-full bg-white"
              autoComplete="username"
              required
            />
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Password"
              className="input input-bordered w-full bg-white"
              autoComplete="current-password"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold tracking-wide shadow-lg transition rounded-lg px-4 py-2 border-none"
            >
              Login
            </button>
          </form>

          <p className="text-sm text-center text-slate-600 mt-2">
            Don’t have an account?{' '}
            <a href="/register" className="link text-indigo-500 font-semibold">
              Register
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
