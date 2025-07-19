import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { API_URL } from "../../Config/AppConstant";
import { v4 as uuidv4 } from "uuid"; // for fallback id

// Fetch ICDs
export const fetchICDs = createAsyncThunk("icd/fetchICDs", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.get(`${API_URL}/icds/viewAll-ICD`, config);
    
    return response.data.data.map((item) => ({
      ...item,
      id: item.id || uuidv4(),
    }));
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to fetch ICDs.");
    return rejectWithValue(error.response?.data?.message || "Something went wrong.");
  }
});

// Create ICD
export const createICD = createAsyncThunk("icd/createICD", async (icdData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(`${API_URL}/icds/create-icd-yard`, icdData, config);
    toast.success("ICD created successfully!");
    const data = response.data.data || {};
    return { ...data, id: data.id || uuidv4() }; // assign id if missing
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to create ICD.");
    return rejectWithValue(error.response?.data?.message || "Something went wrong.");
  }
});

// Delete ICD
export const deleteICD = createAsyncThunk("icd/deleteICD", async (id, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.delete(`${API_URL}/icds/deleteICD/${id}`, config);
    toast.success(response.data.message || "ICD deleted successfully!");
    return id;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete ICD.");
    return rejectWithValue(error.response?.data?.message || "Something went wrong.");
  }
});

// Update ICD
export const updateICD = createAsyncThunk("icd/updateICD", async ({ id, data }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const response = await axios.put(`${API_URL}/icds/updateICD/${id}`, data, config);
    toast.success("ICD updated successfully!");
    return { id, ...data };
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update ICD.");
    return rejectWithValue(error.response?.data?.message || "Something went wrong.");
  }
});

// ICD Slice
const icdSlice = createSlice({
  name: "icd",
  initialState: {
    icds: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch ICDs
      .addCase(fetchICDs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchICDs.fulfilled, (state, action) => {
        state.loading = false;
        state.icds = action.payload;
      })
      .addCase(fetchICDs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create ICD
      .addCase(createICD.pending, (state) => {
        state.loading = true;
      })
      .addCase(createICD.fulfilled, (state, action) => {
        state.loading = false;
        state.icds.push(action.payload);
      })
      .addCase(createICD.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete ICD
      .addCase(deleteICD.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteICD.fulfilled, (state, action) => {
        state.loading = false;
        state.icds = state.icds.filter((icd) => icd.id !== action.payload);
      })
      .addCase(deleteICD.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update ICD
      .addCase(updateICD.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateICD.fulfilled, (state, action) => {
        state.loading = false;
        state.icds = state.icds.map((icd) =>
          icd.id === action.payload.id ? { ...icd, ...action.payload } : icd
        );
      })
      .addCase(updateICD.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default icdSlice.reducer;
