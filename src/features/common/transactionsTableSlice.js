import { createSlice } from '@reduxjs/toolkit';

export const transactionsTableSlice = createSlice({
  name: 'transactionsTable',
  initialState: {
    paginationCurrentPage: null,
    filters: {},
    transactionType: 'ALL',
    minAmount: 0,
    maxAmount: 0,
    totalPages: 0,
    paginationSize: 20
  },
  reducers: {
    setSettings: (state, action) => {
      const {
        paginationCurrentPage,
        filters,
        transactionType,
        minAmount,
        maxAmount,
        totalPages,
        paginationSize
      } = action.payload;
      state.paginationCurrentPage = paginationCurrentPage;
      state.filters = filters;
      state.transactionType = transactionType;
      state.minAmount = minAmount;
      state.maxAmount = maxAmount;
      state.totalPages = totalPages;
      state.paginationSize = paginationSize;
    },

    setPaginationCurrentPage: (state, action) => {
      const { paginationCurrentPage } = action.payload;
      state.paginationCurrentPage = paginationCurrentPage;
    },

    setFilters: (state, action) => {
      const { filters } = action.payload;
      state.filters = filters;
    },

    setTransactionType: (state, action) => {
      const { transactionType } = action.payload;
      state.transactionType = transactionType;
    },

    setMinAmount: (state, action) => {
      const { minAmount } = action.payload;
      state.minAmount = minAmount;
    },

    setMaxAmount: (state, action) => {
      const { maxAmount } = action.payload;
      state.maxAmount = maxAmount;
    },

    setTotalPages: (state, action) => {
      const { totalPages } = action.payload;
      state.totalPages = totalPages;
    },

    setPaginationSize: (state, action) => {
      const { paginationSize } = action.payload;
      state.paginationSize = paginationSize;
    },

    resetAllTransactionSettings: (state, action) => {
      state.paginationCurrentPage = null;
      state.filters = {};
      state.transactionType = 'ALL';
      state.minAmount = 0;
      state.maxAmount = 0;
      state.totalPages = 0;
      state.paginationSize = 20;
    },

    resetTableTransactionSettings: (state, action) => {
      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
    },

    resetSearchTransactionSettings: (state, action) => {
      state.transactionType = 'ALL';
      state.minAmount = 0;
      state.maxAmount = 0;
    }
  }
});

export const {
  setSettings,
  setPaginationCurrentPage,
  setFilters,
  setTransactionType,
  setMinAmount,
  setMaxAmount,
  setPaginationSize,
  setTotalPages,
  resetAllTransactionSettings,
  resetSearchTransactionSettings,
  resetTableTransactionSettings
} = transactionsTableSlice.actions;

export default transactionsTableSlice.reducer;
