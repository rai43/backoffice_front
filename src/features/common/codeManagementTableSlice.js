import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment/moment';

export const codeManagementTableSlice = createSlice({
  name: 'codeManagementTable',
  initialState: {
    paginationCurrentPage: null,
    filters: {},
    totalPages: 0,
    paginationSize: 20
  },
  reducers: {
    setSettings: (state, action) => {
      const { paginationCurrentPage, filters, totalPages, paginationSize } = action.payload;

      state.paginationCurrentPage = paginationCurrentPage;
      state.filters = filters;
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

    setTotalPages: (state, action) => {
      const { totalPages } = action.payload;
      state.totalPages = totalPages;
    },

    setPaginationSize: (state, action) => {
      const { paginationSize } = action.payload;
      state.paginationSize = paginationSize;
    },

    resetAllCodeManagementSettings: (state, action) => {
      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
      state.paginationSize = 20;
    },

    resetTableCodeManagementSettings: (state, action) => {
      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
    }
  }
});

export const {
  setFilters,
  resetAllCodeManagementSettings,
  resetTableCodeManagementSettings,
  setSettings,
  setPaginationSize,
  setTotalPages,
  setPaginationCurrentPage
} = codeManagementTableSlice.actions;

export default codeManagementTableSlice.reducer;
