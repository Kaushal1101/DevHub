import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMyProjects, deleteProject } from '../features/projects/projectSlice'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify'

export default function MyProjects() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { myProjects, isLoading, isError, message } = useSelector(state => state.projects)

  useEffect(() => {
    dispatch(getMyProjects())
  }, [dispatch])

  useEffect(() => {
    if (isError && message) toast.error(message)
  }, [isError, message])

  // Handles the deletion of the project (dialog box to confirm)
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this project?')) {
      dispatch(deleteProject(id))
        .unwrap()
        .then(() => toast.success('Project deleted'))
        .catch(err => toast.error(err))
    }
  }

  if (isLoading) return <Spinner />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-center mb-8">My Projects</h2>

        {myProjects?.length === 0 && (
          <p className="text-center text-slate-300">You have not created any projects yet.</p>
        )}

        {myProjects?.map((proj) => (
          <div key={proj._id} className="card bg-gray-800 shadow-xl text-white">
            <div className="card-body">
              <h3 className="card-title text-xl font-bold text-white">{proj.title}</h3>
              <p className="text-gray-300">{proj.desc}</p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/projects/${proj._id}`)}
                  className="btn btn-sm bg-indigo-500 hover:bg-indigo-600 text-white"
                >       
                  View
                </button>
                <button
                  onClick={() => navigate(`/projects/${proj._id}/edit`)}
                  className="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(proj._id)}
              className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

        ))}
      </div>
    </div>
  )
}
