import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import attendanceService from '../../Services/attendance';

// Fetch All
export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getAll();
      console.log("response::",response)
      if (response.data.length > 0) {
        return response.data;
      } else {
        return rejectWithValue('Failed to fetch attendance records');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Network Error');
    }
  }
);

// Create
export const createAttendance = createAsyncThunk(
  'attendance/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await attendanceService.create(data);
      if (response.success) {
        toast.success('Attendance marked successfully!');
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to mark attendance');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

// Update
export const updateAttendance = createAsyncThunk(
  'attendance/update',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.update(id, updatedData);
      if (response.success) {
        toast.success('Attendance updated successfully!');
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to update attendance');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

// Delete
export const deleteAttendance = createAsyncThunk(
  'attendance/delete',
  async (id, { rejectWithValue }) => {
    try {
      await attendanceService.delete(id);
      toast.success('Attendance deleted successfully!');
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong.');
    }
  }
);

// Slice
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.data = [action.payload, ...state.data];
      })
      .addCase(createAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default attendanceSlice.reducer;
