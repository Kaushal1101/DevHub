import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';

function AddProposalModal({ featureId, onClose }) {
  // Add image/video option later
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [branchName, setBranchName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !attachmentUrl || !githubUrl || !branchName) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Disables all buttons during submission
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post(
        '/api/proposals',
        {
          feature: featureId,
          title: title,
          desc: description,
          attachmentUrl: attachmentUrl,
          githubUrl: githubUrl,
          branchName: branchName
        },
      );
      setSubmitting(false);
      onClose();
    } catch (err) {
      console.log("ERROR", err);
      toast.error('Failed to add proposal.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-[#1f2937] text-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-white">Add New Proposal</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-white">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded bg-[#111827] text-white border-gray-600" required disabled={submitting}/>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-white">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded bg-[#111827] text-white border-gray-600" required disabled={submitting} />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-white">Attachment URL</label>
            <input type="text" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} className="w-full border px-3 py-2 rounded bg-[#111827] text-white border-gray-600" required disabled={submitting} />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-white">GitHub URL</label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full border px-3 py-2 rounded bg-[#111827] text-white border-gray-600"
              required
              disabled={submitting}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-white">Branch Name</label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="w-full border px-3 py-2 rounded bg-[#111827] text-white border-gray-600"
              required
              disabled={submitting}
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-4 px-4 py-2 rounded border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors" disabled={submitting} >
              Cancel
            </button>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={submitting} >
              {submitting ? 'Adding...' : 'Add Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProposalModal;
