import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

export const colisControlPanelTableSlice = createSlice({
  name: 'colisControlPanelTable',
  initialState: {
    from: moment.utc().format('YYYY-MM-DD'),
    to: moment.utc().format('YYYY-MM-DD'),

    paginationCurrentPage: null,
    filters: {},
    totalPages: 0,
    paginationSize: 20
  },
  reducers: {
    setSettings: (state, action) => {
      const {
        from,
        to,

        paginationCurrentPage,
        filters,
        totalPages,
        paginationSize
      } = action.payload;
      state.from = from;
      state.to = to;

      state.paginationCurrentPage = paginationCurrentPage;
      state.filters = filters;
      state.totalPages = totalPages;
      state.paginationSize = paginationSize;
    },

    setFrom: (state, action) => {
      const { from } = action.payload;
      state.from = from;
    },

    setTo: (state, action) => {
      const { to } = action.payload;
      state.to = to;
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

    resetAllControlPanelSettings: (state, action) => {
      state.from = moment.utc().subtract(7, 'd').format('YYYY-MM-DD');
      state.to = moment.utc().add(1, 'days').format('YYYY-MM-DD');

      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
      state.paginationSize = 20;
    },

    resetTableControlPanelSettings: (state, action) => {
      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
    },

    resetSearchControlPanelSettings: (state, action) => {
      state.from = moment.utc().subtract(7, 'd').format('YYYY-MM-DD');
      state.to = moment.utc().add(1, 'days').format('YYYY-MM-DD');
    }
  }
});

export const {
  setFilters,
  resetAllControlPanelSettings,
  resetSearchControlPanelSettings,
  setFrom,
  resetTableControlPanelSettings,
  setTo,
  setSettings,
  setPaginationSize,
  setTotalPages,
  setPaginationCurrentPage
} = colisControlPanelTableSlice.actions;

export default colisControlPanelTableSlice.reducer;
