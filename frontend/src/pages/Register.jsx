import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaUser } from 'react-icons/fa'
import { register, reset } from '../features/auth/authSlice'
import Spinner from '../components/Spinner'


export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    password2: '',
    role: '',
    github: '',
    techstack: [],
  })

  const [techInput, setTechInput] = useState('');

  const {
    full_name,
    username,
    email,
    password,
    password2,
    role,
    techstack,
  } = formData

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
      navigate('/github-register')
      dispatch(reset())
    }
  }, [isSuccess, user, navigate, dispatch])

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const addTech = () => {
    if (techInput.trim()) {
      setFormData({ ...formData, techstack: [...formData.techstack, techInput.trim()] });
      setTechInput('');
    }
  };

  const removeTech = (indexToRemove) => {
    setFormData({
      ...formData,
      techstack: formData.techstack.filter((_, index) => index !== indexToRemove),
    });
  };

  const onSubmit = (e) => {
    e.preventDefault()
    if (password !== password2) {
      toast.error('Passwords do not match')
    } else {
      dispatch(
        register({
          full_name,
          username,
          email,
          password,
          role,
          techstack,
        })
      )
    }
  }

  if (isLoading) return <Spinner />

  const inputStyle =
    'w-full px-4 py-3 rounded-md bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition'

  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-gray-50 text-slate-900 shadow-xl rounded-2xl border border-slate-200">
        <div className="card-body p-8 space-y-5">
          <div className="text-center">
            <FaUser className="text-4xl text-indigo-500 mx-auto mb-2 bg-white p-2 rounded-full shadow-sm" />
            <h1 className="text-2xl font-bold">Create Your Account</h1>
            <p className="text-sm text-slate-500">
              Join DevHub and connect with developers worldwide.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <input name="full_name" value={full_name} onChange={onChange} placeholder="Full Name" className={inputStyle} required/>
            <input name="username" value={username} onChange={onChange} placeholder="Username" className={inputStyle} required />
            <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" className={inputStyle} required/>
            <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" className={inputStyle} required/>
            <input type="password" name="password2" value={password2} onChange={onChange} placeholder="Confirm Password" className={inputStyle} required />

            <select name="role" value={role} onChange={onChange} className={inputStyle} required>
              <option value="" disabled>
                Select Your Role
              </option>
              <option>Student</option>
              <option>Developer</option>
              
              <option>Company</option>
            </select>

            <div>
              <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="Add Tech Stack" className={inputStyle} />

              <button type="button" onClick={addTech} className="mt-2 w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium rounded-md px-4 py-2 transition">
                Add Tech
              </button>
              <div className="mt-2 flex flex-wrap gap-2" >
                {techstack.map((tech, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">
                    {tech}
                    <button type="button" onClick={() => removeTech(index) } className="ml-2 text-red-500 hover:text-red-700">
                      X
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold tracking-wide shadow-md transition rounded-lg px-4 py-2 border-none">
              Register
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
            <Link to="/login" className="text-indigo-500 font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
