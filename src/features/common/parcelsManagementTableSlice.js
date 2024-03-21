import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment/moment';

export const parcelsManagementTableSlice = createSlice({
  name: 'parcelsManagementTable',
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

    getFromAndToDates: (state, action) => {
      return {
        from: state.from,
        to: state.to
      };
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

    resetAllParcelsManagementSettings: (state, action) => {
      state.from = moment.utc().subtract(7, 'd').format('YYYY-MM-DD');
      state.to = moment.utc().add(1, 'days').format('YYYY-MM-DD');

      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
      state.paginationSize = 20;
    },

    resetTableParcelsManagementSettings: (state, action) => {
      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
    },

    resetSearchParcelsManagementSettings: (state, action) => {
      state.from = moment.utc().subtract(7, 'd').format('YYYY-MM-DD');
      state.to = moment.utc().add(1, 'days').format('YYYY-MM-DD');
    }
  }
});

export const {
  getFromAndToDates,
  setFilters,
  resetAllParcelsManagementSettings,
  resetSearchParcelsManagementSettings,
  setFrom,
  resetTableParcelsManagementSettings,
  setTo,
  setSettings,
  setPaginationSize,
  setTotalPages,
  setPaginationCurrentPage
} = parcelsManagementTableSlice.actions;

export default parcelsManagementTableSlice.reducer;
