// src/redux/slices/expectedContainerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../Config/AppConstant';

const initialState = {
  loading: false,
  success: false,
  error: null,
  createdId: null,
};

// Thunk to create expected container
export const createExpectedContainer = createAsyncThunk(
  'expectedContainer/create',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/expectedContainers/createExpectedArrivalContainer`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response; // { id: 5 }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);

const expectedContainerSlice = createSlice({
  name: 'expectedContainer',
  initialState,
  reducers: {
    resetExpectedContainerState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.createdId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createExpectedContainer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createExpectedContainer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdId = action.payload.id;
      })
      .addCase(createExpectedContainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetExpectedContainerState } = expectedContainerSlice.actions;

export default expectedContainerSlice.reducer;
