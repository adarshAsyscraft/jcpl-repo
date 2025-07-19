import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../Config/AppConstant";

// Async thunk to fetch container types with token
export const fetchContainerTypes = createAsyncThunk(
  "containerTypes/fetchContainerTypes",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // Retrieve token from localStorage
      const response = await fetch(`${API_URL}/containerTypes/viewAll-containerType`, {
        method: "GET",  
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include token in request headers
        },
      });
      const data = await response.json();
      console.log(data, "this is data in container slice");
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch container types");
      }
      return data.data; // Return the container types array
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const containerTypeSlice = createSlice({
  name: "containerTypes",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export default containerTypeSlice.reducer;
