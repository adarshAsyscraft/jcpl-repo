import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import trainersService from "../../Services/trainer";

const initialState = {
  loading: false,
  trainers: [],
  error: "",
  params: {
    page: 1,
    limit: 10,
  },
  pagination: {},
  meta: {},
};

export const fetchTrainers = createAsyncThunk(
  "trainers/fetchTrainers",
  (params = {}) => {
    return trainersService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);


const trainersSlice = createSlice({
  name: "trainers",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchTrainers.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchTrainers.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.trainers = payload.data.trainers;
      state.pagination = payload.data.pagination;
      state.params.page = payload.data.pagination.currentPage;
      state.params.perPage = payload.data.pagination.perPage;
      state.error = "";
    });
    builder.addCase(fetchTrainers.rejected, (state, action) => {
      state.loading = false;
      state.trainers = [];
      state.error = action.error.message;
    });
  },
});

export default trainersSlice.reducer;
