import axios from 'axios';
import axiosInstance from '../../api/axiosInstance';

const API_URL = '/api/proposals/';

// Get all proposals by feature ID
export const getProposalsByFeature = async (featureId) => {
  const response = await axios.get(`/api/features/${featureId}/proposals`);
  return response.data;
};

// Get single proposal by ID
export const getProposalById = async (proposalId) => {
  const response = await axios.get(API_URL + proposalId);
  return response.data;
};

export const deleteProposal = async (proposalId) => {
  await axiosInstance.delete(API_URL + proposalId);
};

const proposalService = {
  getProposalsByFeature,
  getProposalById,
  deleteProposal,
};

export default proposalService;