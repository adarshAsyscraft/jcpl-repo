import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import gymsService from "../../Services/gyms";

const initialState = {
  loading: false,
  gyms: [],
  error: "",
  params: {
    page: 1,
    limit: 10,
  },
  pagination: {},
  meta: {},
};

export const fetchGyms = createAsyncThunk(
  "gyms/fetchGyms",
  (params = {}) => {
    return gymsService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);


const gymsSlice = createSlice({
  name: "gyms",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchGyms.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchGyms.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.gyms = payload.data.users;
      state.pagination = payload.data.pagination;
      state.params.page = payload.data.pagination.currentPage;
      state.params.perPage = payload.data.pagination.limit;
      state.error = "";
    });
    builder.addCase(fetchGyms.rejected, (state, action) => {
      state.loading = false;
      state.gyms = [];
      state.error = action.error.message;
    });
  },
});

export default gymsSlice.reducer;
