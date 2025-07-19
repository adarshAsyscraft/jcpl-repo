import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import yardService from '../../Services/yard';

// Fetch All Yards
export const fetchYards = createAsyncThunk(
  'yards/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await yardService.getAll();
      if (response.success > 0) {
        return response.data.data;
      } else {
        return rejectWithValue('No yards found');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch yards');
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

// Create Yard
export const createYard = createAsyncThunk(
  'yards/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await yardService.create(data);
      if (response.success) {
        toast.success('Yards Created successfully!');
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to create yard');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

// Update Yard
export const updateYard = createAsyncThunk(
  'yards/update',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await yardService.update(id, updatedData);
      if (response.success) {
        toast.success('Yards Updated successfully!');
        return response.data;
      } else {
        toast.error(response.message || 'Failed to update yard');
        return rejectWithValue(response.message || 'Failed to update yard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update yard.');
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

// Delete Yard
export const deleteYard = createAsyncThunk(
  'yards/delete',
  async (id, { rejectWithValue }) => {
    try {
      await yardService.delete(id);
      toast.success('Yards Deleted successfully!');
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

// Search Yard
export const searchYards = createAsyncThunk(
  'yards/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await yardService.search(query);
      if (response.data.length > 0) {
        return response.data;
      } else {
        return rejectWithValue('No yards found');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);

// Yard Slice
const yardSlice = createSlice({
  name: 'yards',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchYards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchYards.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchYards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createYard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createYard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = [action.payload, ...state.data];
      })
      .addCase(createYard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateYard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateYard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((yard) =>
          yard.id === action.payload.id ? action.payload : yard
        );
      })
      .addCase(updateYard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteYard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteYard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((yard) => yard.id !== action.payload);
      })
      .addCase(deleteYard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(searchYards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchYards.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(searchYards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default yardSlice.reducer;
