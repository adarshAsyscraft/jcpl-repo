import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import leadsService from "../../Services/leads";

const initialState = {
  loading: false,
  leads: [],
  error: "",
  params: {
    page: 1,
    limit: 10,
  },
  pagination: {},
  meta: {},
};

export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  (params = {}) => {
    return leadsService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);


const leadsSlice = createSlice({
  name: "leads",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchLeads.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchLeads.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.leads = payload.data.leads;
      state.pagination = payload.data.pagination;
      state.params.page = payload.data.pagination.currentPage;
      state.params.perPage = payload.data.pagination.limit;
      state.error = "";
    });
    builder.addCase(fetchLeads.rejected, (state, action) => {
      state.loading = false;
      state.leads = [];
      state.error = action.error.message;
    });
  },
});

export default leadsSlice.reducer;
