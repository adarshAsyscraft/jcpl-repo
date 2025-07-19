import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import transactionsService from "../../Services/transactions";

const initialState = {
  loading: false,
  transactions: [],
  error: "",
  params: {
    // page: 1,
    // limit: 10,
  },
  pagination: {},
  meta: {},
};

export const fetchTransactions = createAsyncThunk(
  "leads/fetchTransactions",
  (params = {}) => {
    return transactionsService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);


const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchTransactions.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchTransactions.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.transactions = payload.data.transactions;
      state.pagination = payload.data.pagination;
      state.params.page = payload.data.pagination.currentPage;
      state.params.perPage = payload.data.pagination.limit;
      state.error = "";
    });
    builder.addCase(fetchTransactions.rejected, (state, action) => {
      state.loading = false;
      state.transactions = [];
      state.error = action.error.message;
    });
  },
});

export default transactionsSlice.reducer;
