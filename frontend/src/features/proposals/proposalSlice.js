import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import proposalService from './proposalService';

const initialState = {
  proposals: [],
  selectedProposal: null,
  isLoading: false,
  isError: false,
  message: ''
};


export const getProposalsByFeature = createAsyncThunk(
  'proposals/getByFeature',
  async (featureId, thunkAPI) => {
    try {
      return await proposalService.getProposalsByFeature(featureId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getProposalById = createAsyncThunk(
  'proposals/getById',
  async (proposalId, thunkAPI) => {
    try {
      return await proposalService.getProposalById(proposalId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteProposal = createAsyncThunk(
  'proposals/delete',
  async (proposalId, thunkAPI) => {
    try {
      await proposalService.deleteProposal(proposalId);
      return proposalId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const proposalSlice = createSlice({
  name: 'proposals',
  initialState,
  reducers: {
    resetProposalState: (state) => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProposalsByFeature.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProposalsByFeature.fulfilled, (state, action) => {
        //console.log("BLUD", action.payload);
        state.isLoading = false;
        state.proposals = action.payload;
      })
      .addCase(getProposalsByFeature.rejected, (state, action) => {
        console.log("BLEDGE");
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getProposalById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProposalById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProposal = action.payload;
      })
      .addCase(getProposalById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteProposal.fulfilled, (state, action) => {
        if (Array.isArray(state.proposals)) {
          state.proposals = state.proposals.filter(p => p._id !== action.payload);
        }
      });
  }
});

export const { resetProposalState } = proposalSlice.actions;
export default proposalSlice.reducer;
