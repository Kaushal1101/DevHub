import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../features/projects/projectSlice';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import { isErrored } from 'supertest/lib/test';


const parseGithubUrl = (urlStr) => {
  try {
    const url = new URL(urlStr);
    const [owner, repo] = url.pathname.slice(1).split('/');
    if (!owner || !repo) return null;
    return { owner, repo, url: urlStr };
  } catch (err) {
    return null;
  }
};

// Fetches full github tree structure of repository inputted, with error handling
const fetchGitHubTree = async (owner, repo) => {
  try {
    const { data: repoData } = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
    const branch = repoData.default_branch;
    const { data: treeData } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
    return treeData.tree.map(({ path, type }) => ({ path, type }));
  } catch (error) {
    toast.error('Repository not found or inaccessible.');
    return null;
  }
};

function CreateProject() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    access_type: 'public',
    tech_stack: [],
    tags: [],
    features: [{ title: '', desc: '' }],
    github_repo: { url: '', branch: '' },
    fileTree: []
  });

  // Seperated to allow users to input mutliple tags and tech stacks
  const [techInput, setTechInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const addTech = () => {
    if (techInput.trim()) {
      // Adds new techInput to previous array of tech stack stored in formData
      setFormData({ ...formData, tech_stack: [...formData.tech_stack, techInput.trim()] });
      // Resets field for next input
      setTechInput('');
    }
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  // Creates a new empty feature each time it's clicked
  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, { title: '', desc: '' }] });
  };
  
  // Populates empty feature with new feature field data (either title or desc)
  // Can't directly update like addTech since it's adding an object not single element
  const updateFeature = (index, field, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index][field] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  // Remove tag by index
  // Filter out based on index
  const removeTag = (indexToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, index) => index !== indexToRemove) });
  };

  const removeTech = (indexToRemove) => {
    setFormData({ ...formData, tech_stack: formData.tech_stack.filter((_, index) => index !== indexToRemove) });
  };

  const removeFeature = (indexToRemove) => {
    setFormData({ ...formData, features: formData.features.filter((_, index) => index !== indexToRemove) });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.desc || !formData.github_repo.url) {
      toast.error('Please fill in all required fields (Title, Description, GitHub URL)');
      return;
    }

    if (formData.tags.length > 8) {
      toast.error("Max 8 tags allowed")
      return;
    }

    const parsedRepo = parseGithubUrl(formData.github_repo.url);
    if (!parsedRepo) {
      toast.error('Invalid GitHub URL. Expected format: github.com/owner/repo');
      return;
    }
    parsedRepo.branch = formData.github_repo.branch || 'main';

    if (!user || !user._id) {
      toast.error('User not authenticated.');
      return;
    }

    // Make sure user owns repo
    try {
      await axios.post('/api/github/verify-repo', {
        owner: parsedRepo.owner,
        repo: parsedRepo.repo
      }, {
        headers: {
          Authorization: 'Bearer ' + user.github.access_token
        }
      });
    } catch (error) {
      console.log("HELLO", user.token, user.github)
      toast.error('You are not authorized to use this repository.');
      return;
    }

    // Send full fileTree to backend to preprocess
    const fileTree = await fetchGitHubTree(parsedRepo.owner, parsedRepo.repo);
    if (!fileTree) return;
    //console.log(fileTree)

    dispatch(createProject({ 
      ...formData, 
      github_repo: parsedRepo, 
      creator: user._id, 
      fileTree: fileTree,
      features: formData.features
    }));
    navigate('/');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Project</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="text" name="title" placeholder="Title" onChange={onChange} className="input input-bordered w-full" />
        <textarea name="desc" placeholder="Description" onChange={onChange} className="textarea textarea-bordered w-full" />
        <select name="access_type" onChange={onChange} className="select select-bordered w-full">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <div>
          <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="Add Tech" className="input input-bordered" />
          <button type="button" onClick={addTech} className="btn ml-2">Add</button>
          {/* Cancel button beside tech stack to remove it if needed */}
          <div className="mt-2">
            {formData.tech_stack.map((tech, index) => (
              <span key={index} className="badge mr-1 flex items-center">
                {tech}
                <button
                  type="button"
                  onClick={() => removeTech(index)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >X</button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add Tag" className="input input-bordered" />
          <button type="button" onClick={addTag} className="btn ml-2">Add</button>
          <div className="mt-2">
            {formData.tags.map((tag, index) => (
              <span key={index} className="badge mr-1 flex items-center">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >X</button>
              </span>
            ))}
          </div>
        </div>

        {/* Index included to keep track of features when updating */}
        {formData.features.map((feature, index) => (
          <div key={index} className="space-y-1">
            <input
              type="text"
              placeholder="Feature Title"
              value={feature.title}
              onChange={(e) => updateFeature(index, 'title', e.target.value)}
              className="input input-bordered w-full"
            />
            <input
              type="text"
              placeholder="Feature Description"
              value={feature.desc}
              onChange={(e) => updateFeature(index, 'desc', e.target.value)}
              className="input input-bordered w-full"
            />
            <button
              type="button"
              onClick={() => removeFeature(index)}
              className="btn btn-sm btn-error"
            >Remove</button>
          </div>
        ))}
        <button type="button" onClick={addFeature} className="btn">Add Feature</button>

        <input
          type="text"
          value={formData.github_repo.url}
          placeholder="GitHub Repo URL"
          onChange={(e) =>
            setFormData({
              ...formData,
              github_repo: { ...formData.github_repo, url: e.target.value }
            })
          }
          className="input input-bordered w-full"
        />
        <input
          type="text"
          value={formData.github_repo.branch}
          placeholder="Branch Name (default: main)"
          onChange={(e) =>
            setFormData({
              ...formData,
              github_repo: { ...formData.github_repo, branch: e.target.value }
            })
          }
          className="input input-bordered w-full"
        />

        <button type="submit" className="btn btn-primary">Create Project</button>
      </form>
      {/* Used to show errors when input incomplete */}
      <ToastContainer />
    </div>
  );
}

export default CreateProject;