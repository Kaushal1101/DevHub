// Import redix toolkit for global state management
import { configureStore } from '@reduxjs/toolkit';

// Import the slice reducer for managing project-related state
import projectReducer from '../features/projects/projectSlice';

//Import the auth reducer 
import authReducer from '../features/auth/authSlice'

// Redux initialization to maintain state in the app using reducers
export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
  },
});

export default store;