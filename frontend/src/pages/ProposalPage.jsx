import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { deleteProposal, editProposal } from '../features/proposals/proposalSlice';
import { commitCode } from '../features/github/githubSlice';
import UpdateProposalModal from '../components/UpdateProposalModal';

const ProposalPage = () => {
  const { proposalId } = useParams();
  const location = useLocation();
  const passedProposal = location.state?.proposal;

  console.log("STATE", location.state);

  const { proposals } = useSelector((state) => state.proposals);
  const { user } = useSelector((state) => state.auth);

  // Search proposal if not passed in local storage
  let proposal = passedProposal;
  if (!proposal) {
    proposal = proposals.find((p) => p._id === proposalId);
  }

  console.log("PROP", proposalId);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State handling to edit proposal
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({
    title: proposal?.title || '',
    desc: proposal?.desc || '',
    mediaUrl: proposal?.mediaUrl || '',
    githubUrl: proposal?.githubUrl || '',
    branchName: proposal?.branchName || '',
  });

  // Used in case cannot get repo info readily
  const parseRepo = (url) => {
    try {
      const { pathname } = new URL(url);
      // pathname: "/owner/repo" or "/owner/repo.git"
      const [, owner, repoWithGit] = pathname.split('/');
      return {
        owner,
        repo: repoWithGit?.replace(/\.git$/, ''),
      };
    } catch {
      return { owner: '', repo: '' };
    }
  };

  const handleCommit = () => {
    if (!proposal) return;

    // Get repo owner and name
    let proposalOwner = proposal.owner || '';
    let proposalName  = proposal.repo  || '';

    // Fallback to parseRepo if owner and name info not available 
    if (!proposalOwner || !proposalName) {
      const parsed = parseRepo(proposal.githubUrl);
      proposalOwner = parsed.owner;
      proposalName  = parsed.repo;
    }

    if (!proposalOwner || !proposalName) {
      alert('Cannot find repository owner or name.');
      return;
    }

    // Ensure content is there, or else set default README
    const content  =
      proposal.content ||
      btoa(`# ${proposal.title}\n Merged via DevHub proposal ${proposal._id}`);
    
    const proposalId = proposal._id;

    const commitData = {
      proposalId,
      proposalOwner,
      proposalName,
      branchName: proposal.branchName,
      content,
      commitMessage: `Apply proposal "${proposal.title}"`,
    };

    console.log('Commit payload:', commitData);
    dispatch(commitCode(commitData));
  };

  // To update proposal info after update 
  const handleEditSubmit = (e) => {
    e.preventDefault();
    dispatch(editProposal({ id: proposal._id, data: formData }))
      .unwrap()
      .then(() => {
        // Fetch new proposal with edits from db
        fetch(`/api/proposals/${proposal._id}`)
          .then(res => res.json())
          .then(freshProposal => {
            navigate(`/proposals/${freshProposal._id}`, {
              // Update local storage with new proposal info
              state: { proposal: freshProposal },
              replace: true,
            });
          });
      });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      dispatch(deleteProposal(proposal._id)).then(() => {
        navigate(`/features/${proposal.feature?._id || proposal.feature}`);
      });
    }
  };

  if (!proposal) {
    return <div className="text-white p-8">Proposal not found.</div>;
  }

  useEffect(() => {
    console.log('Proposal object in page', proposal);
  }, [proposal]);

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold mb-2">{proposal.title}</h1>
          <p className="text-lg">{proposal.desc}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">GitHub Repository</h2>
          <a href={proposal.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline break-all" >
            {proposal.githubUrl}
          </a>
        </div>

        {proposal.mediaUrl && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Media</h2>
            {proposal.mediaUrl.endsWith('.mp4') ? (
              <video controls className="w-full max-w-2xl rounded">
                <source src={proposal.mediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={proposal.mediaUrl} alt="Proposal Media" className="w-full max-w-2xl rounded" />
            )}
          </div>
        )}

        {proposal.videoUrl && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Demo Video</h2>
            <video controls className="w-full max-w-2xl rounded">
              <source src={proposal.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        <div className="bg-gray-800 p-6 rounded-lg shadow-md space-y-2">
          <div>
            <strong>Proposer:</strong> {proposal.proposer?.username || 'Unknown'}
          </div>
          <div>
            <strong>Feature:</strong> {typeof proposal.feature === 'object' ? proposal.feature.title : proposal.feature}
          </div>
          <div>
            <strong>Status:</strong> {proposal.status || 'Pending'}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-right">
          {proposal.status === 'Approved' ? (
            <div className="text-green-400 font-semibold">
              Accepted at {proposal.acceptedAt ? new Date(proposal.acceptedAt).toLocaleString() : 'an unknown time'}
            </div>
          ) : (
            <>
              {user && proposal.proposer?._id === user._id && (
                <button onClick={() => setShowEdit(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mr-4" >
                  ✏️ Edit
                </button>
              )}
              <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" >
                Delete Proposal
              </button>
              <button onClick={handleCommit} disabled={!proposal.githubUrl} className={`${ proposal.githubUrl ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed' } text-white font-bold py-2 px-4 rounded ml-4`} >
                Commit to GitHub
              </button>
            </>
          )}
        </div>
      </div>
      <UpdateProposalModal
        show={showEdit}
        proposal={proposal}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleEditSubmit}
        onClose={() => setShowEdit(false)}
      />
    </div>
  );
};

export default ProposalPage;