import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import forwarderService from '../../Services/forwarders';
// Fetch All
export const fetchForwarders = createAsyncThunk(
  'forwarders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await forwarderService.getAll();
      if (response.data.length > 0) {
        return response.data.map((item) => ({
          ...item,
          id: item.id,
        }));
      } else {
        return rejectWithValue('Failed to fetch forwarders');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Network Error');
    }
  }
);

// Create
export const createForwarder = createAsyncThunk(
  'forwarders/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await forwarderService.create(data);
      if (response.success) {
        toast.success("Forwarder Created Successfully!")
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to create forwarder');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

// Update
export const updateForwarder = createAsyncThunk(
  'forwarders/update',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await forwarderService.update(id, updatedData);
      if (response.success) {
        return response;
      } else {
        return rejectWithValue(response.message || 'Failed to update forwarder');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

// Delete
export const deleteForwarder = createAsyncThunk(
  'forwarders/delete',
  async (id, { rejectWithValue }) => {
    try {
      await forwarderService.delete(id);
      toast.success("Forwarder Deleted Successfully!")
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

// Search
export const searchForwarders = createAsyncThunk(
  'forwarders/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await forwarderService.search(query);
      if (response.data.length > 0) {
        return response.data;
      } else {
        return rejectWithValue('No forwarders found');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);

// Slice
const forwarderSlice = createSlice({
  name: 'forwarders',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchForwarders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForwarders.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchForwarders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createForwarder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createForwarder.fulfilled, (state, action) => {
        state.loading = false;
        state.data = [action.payload, ...state.data];
      })
      .addCase(createForwarder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateForwarder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateForwarder.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(updateForwarder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteForwarder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteForwarder.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteForwarder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search
      .addCase(searchForwarders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchForwarders.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(searchForwarders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default forwarderSlice.reducer;
