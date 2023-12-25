import { createSlice } from '@reduxjs/toolkit';

export const livreursTableSlice = createSlice({
  name: 'livreursTable',
  initialState: {
    active: true,
    deleted: false,
    direction: 'DESC',
    limit: '500',
    livreurInfo: '',

    paginationCurrentPage: null,
    filters: {},
    totalPages: 0,
    paginationSize: 20
  },
  reducers: {
    setSettings: (state, action) => {
      const {
        active,
        deleted,
        direction,
        limit,
        livreurInfo,

        paginationCurrentPage,
        filters,
        totalPages,
        paginationSize
      } = action.payload;
      state.active = active;
      state.deleted = deleted;
      state.direction = direction;
      state.limit = limit;
      state.livreurInfo = livreurInfo;

      state.paginationCurrentPage = paginationCurrentPage;
      state.filters = filters;
      state.totalPages = totalPages;
      state.paginationSize = paginationSize;
    },

    setActive: (state, action) => {
      const { active } = action.payload;
      state.active = active;
    },

    setDeleted: (state, action) => {
      const { deleted } = action.payload;
      state.deleted = deleted;
    },

    setDirection: (state, action) => {
      const { direction } = action.payload;
      state.direction = direction;
    },

    setLimit: (state, action) => {
      const { limit } = action.payload;
      state.limit = limit;
    },

    setLivreurInfo: (state, action) => {
      const { livreurInfo } = action.payload;
      state.livreurInfo = livreurInfo;
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

    resetAllLivreurSettings: (state, action) => {
      state.active = true;
      state.deleted = false;
      state.direction = 'DESC';
      state.limit = '500';
      state.livreurInfo = '';

      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
      state.paginationSize = 20;
    },

    resetTableLivreurSettings: (state, action) => {
      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
    },

    resetSearchLivreurSettings: (state, action) => {
      state.active = true;
      state.deleted = false;
      state.direction = 'DESC';
      state.limit = '500';
      state.livreurInfo = '';
    }
  }
});

export const {
  setSettings,
  resetAllLivreurSettings,
  resetSearchLivreurSettings,
  resetTableLivreurSettings,
  setPaginationCurrentPage,
  setActive,
  setDirection,
  setLimit,
  setLivreurInfo,
  setDeleted,
  setFilters,

  setPaginationSize,
  setTotalPages
} = livreursTableSlice.actions;

export default livreursTableSlice.reducer;
