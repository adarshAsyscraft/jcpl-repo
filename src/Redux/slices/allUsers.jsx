import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import usersService from "../../Services/users";

const initialState = {
  loading: false,
  allUsers: [],
  error: "",
  params: {
    page: 1,
    limit: 10,
  },
  pagination: {},
  meta: {},
};

export const fetchUsersNew = createAsyncThunk(
  "user/fetchUsers",
  (params = {}) => {
    return usersService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

const userSliceNew = createSlice({
  name: "user",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchUsersNew.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchUsersNew.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.allUsers = payload.data.users;
      state.pagination = payload.data.pagination;
      state.params.page = payload.data.pagination.currentPage;
      state.params.perPage = payload.data.pagination.limit;
      state.error = "";
    });
    builder.addCase(fetchUsersNew.rejected, (state, action) => {
      state.loading = false;
      state.allUsers = [];
      state.error = action.error.message;
    });
  },
});

export default userSliceNew.reducer;
