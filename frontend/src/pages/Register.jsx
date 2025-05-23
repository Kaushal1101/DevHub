import React from 'react'
import {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'
import { FaUser } from 'react-icons/fa'
import {register, reset} from '../features/auth/authSlice'
import Spinner from '../components/Spinner'


function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    password2: '',
    role: '',
    github: '',
    techstack: '',
  })

  const { full_name, username, email, password, password2, role, github, techstack } = formData

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {user, isLoading, isError, isSuccess, message} = useSelector(
    (state) => state.auth)

  useEffect(() => {
    if(isError) {
      toast.error(message)
    }

    if(isSuccess || user) {
      navigate('/')
    }

    dispatch(reset())

  }, [user, isError, isSuccess, message, navigate, dispatch])


  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    if(password != password2) {
      toast.error('Passwords do not match')
    } else {
      const userData = {
        full_name,
        username,
        email,
        password,
        role,
        github,
        techstack,
      }

      dispatch(register(userData))
    }
  }

  if(isLoading) {
    return <Spinner />
  }

  return (
    <>
    <section className='heading'>
      <h1>
        <FaUser /> Register
      </h1>
      <p>Please create an account</p>
    </section>

    <section className='form'>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <input type='text' className='form-control' id='full_name' name='full_name' value={full_name} placeholder='Enter your full name' onChange={onChange} required/>
        </div>

        <div className="form-group">
          <input type='text' className='form-control' id='username' name='username' value={username} placeholder='Enter your username' onChange={onChange} required/>
        </div>

        <div className="form-group">
          <input type='email' className='form-control' id='email' name='email' value={email} placeholder='Enter your email' onChange={onChange} required/>
        </div>

        <div className="form-group">
          <input type='password' className='form-control' id='password' name='password' value={password} placeholder='Enter your password' onChange={onChange} required/>
        </div>

        <div className="form-group">
          <input type='password' className='form-control' id='password2' name='password2' value={password2} placeholder='Confirm password' onChange={onChange} required/>
        </div>

        <div className="form-group">
          <select className='form-control' id='role' name='role' value={role} onChange={onChange} required>
            <option value=''>Select Role</option>
            <option value='Student'>Student</option>
            <option value='Employee'>Employee</option>
            <option value='Company'>Company</option>
          </select>
        </div>

        <div className="form-group">
          <input type='text' className='form-control' id='github' name='github' value={github} placeholder='GitHub Profile URL' onChange={onChange}/>
        </div>

        <div className="form-group">
          <input type='text' className='form-control' id='techstack' name='techstack' value={techstack} placeholder='Tech Stack' onChange={onChange}/>
        </div>

        <div className="form-group">
          <button type="submit" className='btn btn-block'>
            Submit
          </button>
        </div>
      </form>
    </section>
    </>
  )
}

export default Register