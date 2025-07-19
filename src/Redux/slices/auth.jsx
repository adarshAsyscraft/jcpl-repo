import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import adminService from '../../Services/admin';

// Fetch Admin Data Thunk
export const fetchAdmin = createAsyncThunk(
  'admin/fetchAdmin',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.get({
        ...initialState.defaultParams,
        ...params,
      });
      // console.log(response)
      return response; // Resolve with the response
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // console.log("auth-working")
        // Token is invalid or expired
        return rejectWithValue('Session expired. Please log in again.');
      }
      return rejectWithValue(error.message || 'Failed to fetch admin data');
    }
  }
);


// Initial State
const token = localStorage.getItem('token');
const initialState = {
  user: null,
  token: token || null,
  isAuthenticated: !!token,
  loading: false,
  error: null,
  defaultParams: {
    limit: 10,
    page: 1,
  },
  sessionExpired: false, // Add a flag for session expiration
};

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.sessionExpired = false;
      localStorage.setItem('token', action.payload.token); // Persist token
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.sessionExpired = false;
      localStorage.removeItem('token');
      localStorage.removeItem('profileURL');
      localStorage.removeItem('auth0_profile');
      localStorage.removeItem('Name');
      localStorage.setItem('authenticated', false);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data; // Assuming the API returns user data
      })
      .addCase(fetchAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';

        if (action.payload === 'Session expired. Please log in again.') {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.sessionExpired = true; // Set session expired flag
          localStorage.removeItem('token');
          localStorage.setItem('authenticated', false);
        }
      });
  },
});

// Export Actions and Reducer
export const { setLogin, logout } = authSlice.actions;
export default authSlice.reducer;
