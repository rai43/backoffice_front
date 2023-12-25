import { createSlice } from '@reduxjs/toolkit';

export const merchantMenuTableSlice = createSlice({
  name: 'merchantMenuTable',
  initialState: {
    active: true,
    deleted: false,
    direction: 'DESC',
    limit: '100',
    merchantId: '',
    merchantNameLabel: '',
    status: 'ALL',
    availability: '',

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
        merchantId,
        merchantNameLabel,
        status,
        availability,

        paginationCurrentPage,
        filters,
        totalPages,
        paginationSize
      } = action.payload;
      state.active = active;
      state.deleted = deleted;
      state.direction = direction;
      state.limit = limit;
      state.merchantId = merchantId;
      state.merchantNameLabel = merchantNameLabel;
      state.status = status;
      state.availability = availability;

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

    setStatus: (state, action) => {
      const { status } = action.payload;
      state.status = status;
    },

    setMerchantId: (state, action) => {
      const { merchantId } = action.payload;
      state.merchantId = merchantId;
    },

    setMerchantNameLabel: (state, action) => {
      const { merchantNameLabel } = action.payload;
      state.merchantNameLabel = merchantNameLabel;
    },

    setAvailability: (state, action) => {
      const { availability } = action.payload;
      state.availability = availability;
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

    resetAllMerchantMenuSettings: (state, action) => {
      state.active = true;
      state.deleted = false;
      state.direction = 'DESC';
      state.limit = '500';
      state.merchantId = '';
      state.merchantNameLabel = '';
      state.status = 'ALL';
      state.availability = '';

      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
      state.paginationSize = 20;
    },

    resetTableMerchantMenuSettings: (state, action) => {
      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
    },

    resetSearchMerchantMenuSettings: (state, action) => {
      state.active = true;
      state.deleted = false;
      state.direction = 'DESC';
      state.limit = '500';
      state.livreurInfo = '';
    }
  }
});

export const {
  setActive,
  setDirection,
  setDeleted,
  setSettings,
  setStatus,
  setMerchantId,
  setMerchantNameLabel,
  setLimit,
  setFilters,
  resetAllMerchantMenuSettings,
  resetSearchMerchantMenuSettings,
  resetTableMerchantMenuSettings,
  setAvailability,
  setPaginationSize,
  setTotalPages,
  setPaginationCurrentPage
} = merchantMenuTableSlice.actions;

export default merchantMenuTableSlice.reducer;
