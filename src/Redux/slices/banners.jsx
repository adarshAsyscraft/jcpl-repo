import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import bannersService from "../../Services/banner";

const initialState = {
  loading: false,
  banners: [],
  error: "",
  params: {
    page: 1,
    limit: 10,
  },
  pagination: {},
  meta: {},
};

export const fetchBanners = createAsyncThunk(
  "banners/fetchBanners",
  (params = {}) => {
    return bannersService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);


const userSliceNew = createSlice({
  name: "banners",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchBanners.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchBanners.fulfilled, (state, action) => {
      const { payload } = action;
      // console.log(payload)
      state.loading = false;
      state.banners = payload.data;
      state.pagination = payload.pagination;
      // state.params.page = payload.pagination.currentPage;
      // state.params.perPage = payload.pagination.limit;
      state.error = "";
    });
    builder.addCase(fetchBanners.rejected, (state, action) => {
      state.loading = false;
      state.banners = [];
      state.error = action.error.message;
    });
  },
});

export default userSliceNew.reducer;
