import { createSlice } from '@reduxjs/toolkit';

export const merchantSettingsTableSlice = createSlice({
  name: 'merchantSettingsTable',
  initialState: {
    active: true,
    deleted: false,
    direction: 'DESC',
    limit: '30',
    merchantId: '',
    merchantName: '',

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
        merchantName,

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
      state.merchantName = merchantName;

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

    setMerchantId: (state, action) => {
      const { merchantId } = action.payload;
      state.merchantId = merchantId;
    },

    setMerchantName: (state, action) => {
      const { merchantName } = action.payload;
      state.merchantName = merchantName;
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

    resetAllMerchantSettingsSettings: (state, action) => {
      state.active = true;
      state.deleted = false;
      state.direction = 'DESC';
      state.limit = '500';
      state.merchantId = '';
      state.merchantName = '';

      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
      state.paginationSize = 20;
    },

    resetTableMerchantSettingsSettings: (state, action) => {
      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
    },

    resetSearchMerchantSettingsSettings: (state, action) => {
      state.active = true;
      state.deleted = false;
      state.direction = 'DESC';
      state.limit = '500';
      state.merchantId = '';
      state.merchantName = '';
    }
  }
});

export const {
  setActive,
  resetAllMerchantSettingsSettings,
  resetSearchMerchantSettingsSettings,
  setMerchantName,
  resetTableMerchantSettingsSettings,
  setMerchantId,
  setDeleted,
  setLimit,
  setSettings,
  setFilters,
  setDirection,
  setPaginationSize,
  setTotalPages,
  setPaginationCurrentPage
} = merchantSettingsTableSlice.actions;

export default merchantSettingsTableSlice.reducer;
