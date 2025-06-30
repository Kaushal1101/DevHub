import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { deleteFeature } from '../features/featuresLogic/featureSlice';
import { useNavigate, Link } from 'react-router-dom';
import { getProposalsByFeature } from '../features/proposals/proposalSlice';
import ProposalCard from '../components/ProposalCard';
import AddProposalModal from '../components/AddProposalModal';

function FeaturePage() {
  const { id } = useParams();
  const [feature, setFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const proposals = useSelector((state) => state.proposals?.proposals.proposals || []);

  //console.log("PROPOSALS", proposals, Array.isArray(proposals));

  useEffect(() => {
    const getFeature = async () => {
      try {
        const response = await axios.get(`/api/features/${id}`);
        setFeature(response.data);
        dispatch(getProposalsByFeature(id));
        setLoading(false);
      } catch (err) {
        setError('Failed to load feature.');
        setLoading(false);
      }
    };

    getFeature();
  }, [id, dispatch]);

  useEffect(() => {
    if (!showModal) {
      dispatch(getProposalsByFeature(id));
    }
  }, [showModal, id, dispatch]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      dispatch(deleteFeature(id)).then(() => navigate('/'));
    }
  };

  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;

  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-2">{feature.title}</h1>
      <p className="text-gray-700">{feature.desc}</p>
      <button onClick={handleDelete} className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
        Delete Feature
      </button>
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Proposals</h2>
          <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" >
            Add Proposal
          </button>
        </div>
        {showModal && (
          <AddProposalModal featureId={id} onClose={() => setShowModal(false)} />
        )}
        <div className="space-y-4">
          {Array.isArray(proposals) ? (
            proposals.length > 0 ? (
              proposals.map((proposal) => (
                <div key={proposal._id}>
                  <div>
                    <Link to={`/proposals/${proposal._id}`} state={{ proposal }}>
                      <ProposalCard proposal={proposal} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No proposals available.</p>
            )
          ) : (
            <p className="text-gray-500">Loading proposals...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FeaturePage;