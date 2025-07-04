import AddFeatureModal from '../components/AddFeatureModal'
import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Spinner from '../components/Spinner'
import { getProjectById, resetSelectedProject } from '../features/projects/projectSlice'
import { addComment } from '../features/projects/projectService'
import { toast } from 'react-toastify'

function ViewProject() {
  const { id } = useParams()
  //console.log("Project ID from URL:", id);//
  const location = useLocation()
  const dispatch = useDispatch()

  // State and reducer for localProject, which is fetched from previous page immediately
  const [localProject, setLocalProject] = useState(location.state?.project)

  // Extra states for code snippet on the side
  const [openFileContent, setOpenFileContent] = useState(null);
  const [openFileName, setOpenFileName] = useState('');

  // State for comment input
  const [commentText, setCommentText] = useState('');

  const { user } = useSelector((state) => state.auth)

  // Seletected project is from react fetch calls, which takes longer than local
  const { selectedProject, isLoading, isError, message } = useSelector((state) => state.projects)

  useEffect(() => {
    dispatch(getProjectById(id)) // Always fetch full project data

    return () => {
      dispatch(resetSelectedProject())
    }
  }, [id, dispatch])

  // Prefer selectedProject if it exists, else fall back to localProject
  const projectToShow = selectedProject || localProject;

  // Get sorted file tree from project
  const fileTree = projectToShow?.fileTree;

  // Tree node with opening actions 
  function TreeNode({ node }) {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState('');
    const isFolder = node.type === 'tree';

    const toggleOpen = async () => {
      if (isFolder) {
        setOpen(!open);
      } else {
        setOpen(!open);
        if (!content && node.path) {
          try {
            // Open code snippet to the side by fetching raw url
            const owner = projectToShow.github_repo.owner;
            const repo = projectToShow.github_repo.repo;
            const branch = projectToShow.github_repo.default_branch || 'main';

            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${node.path}`.replace(/\/+/g, '/').replace(':/', '://');

            const response = await fetch(rawUrl);

            if (!response.ok) throw new Error('Failed to fetch content');

            const text = await response.text();
            setOpenFileContent(text);
            setOpenFileName(node.name);

          } catch (error) {
            console.error(error);
            setOpenFileContent('// Error loading content');
            setOpenFileName(node.name);
          }
        } else {
          setOpenFileContent(null);
          setOpenFileName('');
        }
      }
    };

    return (
      <div className="ml-4">
        {/* Folder/file fonts with onClick */}
        <div
          className={`cursor-pointer ${isFolder ? 'font-bold text-white' : 'text-gray-300'}`}
          onClick={toggleOpen}
        >
          {/* Folder icons for better UI*/}
          {isFolder ? (open ? '📬' : '📪') : '✉️'} {node.name}
        </div>
        {/* Recursively render children if folder opened */}
        {isFolder && open && node.children && (
          <div className="ml-4">
            {node.children.map((child, index) => (
              <TreeNode key={index} node={child} />
            ))}
          </div>
        )}
        {/* Display file content */}
        {!isFolder && open && (
          <div className="bg-base-300 text-white text-xs mt-2 p-2 rounded overflow-x-auto whitespace-pre-wrap">
            {content || 'Loading...'}
          </div>
        )}
      </div>
    );
  }

  // Renders stored fileTree using tree nodes
  function renderTree(tree) {
    return tree.map((node, index) => <TreeNode key={index} node={node} />);
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await addComment({ projectId: id, text: commentText });
      toast.success('Comment added');
      setCommentText('');
      dispatch(getProjectById(id));
    } catch (err) {
      toast.error('Failed to add comment');
    }
  }

  if (isLoading) return <Spinner />
  if (isError) return <p className="error">{message}</p>
  if (!projectToShow) return <p>Project entry not found.</p>

  return (
    // Flex box so code snippet can open to the side
    <div className="flex h-screen">
      {/* Split screenn when snippet opens */}
      <div className={`flex-1 p-6 transition-all duration-300 ${openFileContent ? 'w-1/2' : 'w-full'}`}>

        {/* Project Title, Creator, and Description */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title text-3xl font-bold">{projectToShow.title}</h2>
            <p className="text-sm text-gray-500">
              Created by{' '}
              <a
                href={`/users/${projectToShow.creator._id}`}
                className="font-semibold text-indigo-500 hover:underline"
              >
                {projectToShow.creator.username}
              </a>
            </p>
            <p className="text-white text-lg mt-4">{projectToShow.desc}</p>
          </div>
        </div>

        {/* Add Feature Button */}
        <div className="flex justify-end mb-2">
          <button
            className="btn btn-accent btn-sm"
            onClick={() => document.getElementById('add_feature_modal').showModal()}
          >
            ➕ Add Feature
          </button>
        </div>

        {/* Features */}
        {projectToShow.features?.length > 0 && (
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h3 className="card-title text-xl font-semibold mb-2">Features Wanted</h3>
              <div className="flex flex-wrap gap-2">
                {projectToShow.features.map((feature, index) => (
                  feature && feature.title ? (
                    <Link
                      key={index}
                      to={`/features/${feature._id}`}
                      className="badge badge-secondary text-sm hover:underline"
                    >
                      {feature.title}
                    </Link>
                  ) : null
                ))}
              </div>
            </div>
          </div>
        )}

        {/* File Tree */}
        {/* Use existing fileTree in database to render */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-xl font-semibold">File Structure</h3>
            <div className="bg-base-200 p-4 rounded overflow-x-auto text-sm font-mono min-w-full">
              {fileTree
                ? Array.isArray(fileTree) && fileTree.length > 0
                  ? renderTree(fileTree)
                  : 'No files found in the repository.'
                : 'Loading file structure...'}
            </div>
          </div>
        </div>

        {/* Container for tags and tech together */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Tech Stack */}
          <div className="card bg-base-100 shadow-xl flex-1">
            <div className="card-body text-sm">
              <h3 className="card-title text-md font-semibold">Tech Stack</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {projectToShow.tech_stack.map((tech, index) => (
                  <span key={index} className="badge badge-primary text-xs">{tech}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="card bg-base-100 shadow-xl flex-1">
            <div className="card-body text-sm">
              <h3 className="card-title text-md font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {projectToShow.tags.map((tag, index) => (
                  <span key={index} className="badge badge-primary text-xs">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Repository */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h3 className="card-title text-xl font-semibold">Repository URL</h3>
            <a href={projectToShow.github_repo.url} target="_blank" rel="noopener noreferrer" className="link link-primary">
              {projectToShow.github_repo.url}
            </a>
          </div>
        </div>

        {/* Comments Section */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h3 className="card-title text-xl font-semibold mb-2">Comments</h3>
            {projectToShow.comments?.length > 0 ? (
              <ul className="space-y-4">
                {projectToShow.comments.map((comment) => (
                  <li key={comment._id} className="bg-base-200 p-3 rounded shadow-sm">
                    <p className="text-sm text-gray-400 mb-1">
                      {comment.user?.full_name || comment.user?.username || 'User'}
                    </p>
                    <p className="text-white">{comment.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No comments yet.</p>
            )}

            {/* Comment Input */}
            {user && (
              <form onSubmit={handleCommentSubmit} className="mt-4">
                <textarea
                  className="textarea textarea-bordered w-full text-white bg-base-200"
                  placeholder="Leave a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                />
                <button type="submit" className="btn btn-primary mt-2" disabled={!commentText.trim()}>
                  Post Comment
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* File Snippet */}
      {openFileContent && (
        <div className="w-1/2 bg-base-300 text-white p-4 shadow-lg overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold">{openFileName}</h4>
            <button onClick={() => setOpenFileContent(null)} className="btn btn-sm btn-error">Close</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm font-mono">{openFileContent}</pre>
        </div>
      )}

      {/* Add Feature Modal */}
      <AddFeatureModal projectId={projectToShow._id} />
    </div>
  );
}

export default ViewProject;
