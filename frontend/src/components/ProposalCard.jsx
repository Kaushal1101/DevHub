function ProposalCard({ proposal }) {
  if (!proposal) {
    return <p className="text-red-500">No proposal data available.</p>;
  }

  return (
    <div className="bg-zinc-900 text-white shadow-md rounded p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">{proposal.title}</h2>
      <p className="text-gray-300 mb-2">{proposal.desc}</p>
      <div className="text-sm text-gray-400 mb-1">Proposer: <span className="font-medium">{proposal.proposer?.username || proposal.proposer}</span></div>
      {proposal.notes && proposal.notes.length > 0 && (
        <div className="mb-2">
          <p className="text-sm text-gray-400 mb-1 font-semibold">Notes:</p>
          <ul className="list-disc list-inside text-gray-300">
            {proposal.notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Will be replaced with picture to render and clickable card to url page */}
      {/* {proposal.mediaUrl && (
        <div className="relative pb-[56.25%] h-0 overflow-hidden rounded mb-2">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={proposal.mediaUrl}
            title="Proposal Video"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )} */}
      {proposal.githubUrl && (
        <div
          className="text-sm text-blue-400 mb-1"
          dangerouslySetInnerHTML={{
            __html: `<a href="${proposal.githubUrl}" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline;">GitHub Repo</a>`
          }}
        />
      )}
      <p className="text-sm text-gray-400 mb-1">Status: <span className="font-medium">{proposal.status}</span></p>
      <p className="text-sm text-gray-400">Submitted on: {new Date(proposal.createdAt).toLocaleDateString()}</p>
    </div>
  );
}

export default ProposalCard;
