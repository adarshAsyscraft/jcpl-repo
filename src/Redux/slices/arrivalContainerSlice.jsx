// src/redux/slices/arrivalContainerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import arrivalContainerService from "../../Services/arrivalContainer";

// CREATE Arrival Container
export const createArrivalContainer = createAsyncThunk(
  "arrivalContainer/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await arrivalContainerService.create(formData);
      return response;
      
    } catch (error) {
      // Optional: log the error for debugging
      console.error("Thunk error:", error);
      return rejectWithValue(error.response?.data?.message || "Something went wrong.");
    }
  }
);

const arrivalContainerSlice = createSlice({
  name: "arrivalContainer",
  initialState: {
    createdArrivalContainer: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createArrivalContainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArrivalContainer.fulfilled, (state, action) => {
        state.loading = false;
        state.createdArrivalContainer = action.payload;
      })
      .addCase(createArrivalContainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Optional: notify the user via toast when an error occurs
        // toast.error(action.payload);
      });
  },
});

export default arrivalContainerSlice.reducer;
