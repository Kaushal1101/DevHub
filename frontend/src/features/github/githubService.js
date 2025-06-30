import axiosInstance from '../../api/axiosInstance';


export const commitToProposalBranch = async (payload) => {
  let token;
  try {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    token = storedUser?.token;
  } catch (error) {
    token = undefined;
  }

  // 
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const { data } = await axiosInstance.post('/api/github/commit-proposal', payload, config);
  return data;
};

export default { commitToProposalBranch };