import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { commitToProposalBranch } from './githubService';

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Thunk to commit code
export const commitCode = createAsyncThunk(
  'github/commitCode',
  async (data, thunkAPI) => {
    try {
      return await commitToProposalBranch(data);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        'Unknown error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    resetGitHubState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(commitCode.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(commitCode.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(commitCode.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetGitHubState } = githubSlice.actions;
export default githubSlice.reducer;
