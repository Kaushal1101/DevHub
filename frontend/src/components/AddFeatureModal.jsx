import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createFeature } from '../features/featuresLogic/featureSlice';

function AddFeatureModal({ projectId }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const { isLoading } = useSelector((state) => state.features);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    dispatch(createFeature({ title, desc, project: projectId }));
    setTitle('');
    setDesc('');
    // Closes popup and goes back to page
    document.getElementById('add_feature_modal').close();
    window.refresh();
  };

  return (
    <dialog id="add_feature_modal" className="modal">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto">
        <h3 className="text-2xl font-bold mb-6 text-center text-white">Add New Feature</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2 text-white">Feature Title</label>
            <input
              type="text"
              placeholder="e.g. Chat Integration"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-white">Feature Description (optional)</label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe this feature"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Feature'}
            </button>
            <button
              type="button"
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
              onClick={() => document.getElementById('add_feature_modal').close()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export default AddFeatureModal;
