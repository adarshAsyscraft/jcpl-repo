import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import containerTypeService from '../../Services/containerType';

export const fetchContainerTypes = createAsyncThunk(
  'containerTypes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await containerTypeService.getAll();
      if (response.success) {
        // toast.success("ContainerType data fetched successfully!");
        return response.data;
      } else {
        return rejectWithValue('Failed to fetch transporters');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Network Error');
    }
  }
);

export const createContainerTypes = createAsyncThunk(
  'containersType/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await containerTypeService.create(data);
      if (response.success) {
        toast.success("ContainerType Created successfully!");
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to create Container Types');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

// Update
export const updateContainerTypes = createAsyncThunk(
  'containerTypes/update',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await containerTypeService.update(id, updatedData);
      if (response.success) {
        toast.success("ContainerType Updated successfully!");
        return response;
      }else {
        return rejectWithValue(response.message || 'Failed to update container types');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

// Delete
export const deleteConatinerTypes = createAsyncThunk(
  'containerTypes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await containerTypeService.delete(id);
      toast.success("ContainerType Deleted successfully!");
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

export const searchContainerTypes = createAsyncThunk(
  'containerTypes/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await containerTypeService.search(query);
      if (response.length > 0) {
        return response;
      } else {
        return rejectWithValue('No ContainerTypes found');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);


const containerTypeSlice = createSlice({
  name: 'containerTypes',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchContainerTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContainerTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchContainerTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createContainerTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContainerTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.data = [action.payload, ...state.data];
      })
      .addCase(createContainerTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateContainerTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContainerTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((transporter) =>
          transporter.id === action.payload.id ? action.payload : transporter
        );
      })
      .addCase(updateContainerTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteConatinerTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteConatinerTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(
          (transporter) => transporter.id !== action.payload
        );
      })
      .addCase(deleteConatinerTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search
      .addCase(searchContainerTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchContainerTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(searchContainerTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

  },
});

export default containerTypeSlice.reducer;
