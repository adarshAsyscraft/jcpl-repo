import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transporterService from '../../Services/transporter';
import { toast } from 'react-toastify';

export const fetchTransporters = createAsyncThunk(
  'transporters/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transporterService.getAll();
      console.log(response, "this is transporter response slice")
      if (response.success) {
        return response.data.map((item) => ({
          ...item,
          id: item.id,
        }));
      } else {
        return rejectWithValue('Failed to fetch transporters');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Network Error');
    }
  }
);

export const createTransporter = createAsyncThunk(
  'transporters/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await transporterService.create(data);
      if (response.success) {
        toast.success("Transporter Created successfully!");
        return response.data;
      } else {
        toast.error(response.message || 'Failed to create transporter');
        return rejectWithValue(response.message || 'Failed to create transporter');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

// Update
export const updateTransporter = createAsyncThunk(
  'transporters/update',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await transporterService.update(id, updatedData);
      if (response.success) {
        return response;
      } else {
        return rejectWithValue(response.message || 'Failed to update transporter');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

// Delete
export const deleteTransporter = createAsyncThunk(
  'transporters/deleteTransporter',
  async (id, { rejectWithValue }) => {
    try {
      await transporterService.delete(id);
      toast.success('Transporter deleted successfully!');
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

export const searchTransporters = createAsyncThunk(
  'transporters/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await transporterService.search(query);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue('No transporters found');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);


const transporterSlice = createSlice({
  name: 'transporters',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTransporters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransporters.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTransporters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createTransporter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransporter.fulfilled, (state, action) => {
        state.loading = false;
        state.data = [action.payload, ...state.data];
      })
      .addCase(createTransporter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateTransporter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransporter.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((transporter) =>
          transporter.id === action.payload.id ? action.payload : transporter
        );
      })
      .addCase(updateTransporter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteTransporter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransporter.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(
          (transporter) => transporter.id !== action.payload
        );
      })
      .addCase(deleteTransporter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search
      .addCase(searchTransporters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchTransporters.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(searchTransporters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

  },
});

export default transporterSlice.reducer;
