import { createSlice } from '@reduxjs/toolkit';

export const customersTableSlice = createSlice({
  name: 'customersTable',
  initialState: {
    personal: true,
    merchant: true,
    active: true,
    deleted: false,
    direction: 'DESC',
    limit: '500',
    phoneNumber: '',
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
        personal,
        merchant,
        active,
        deleted,
        direction,
        limit,
        phoneNumber,
        merchantId,
        merchantName,

        paginationCurrentPage,
        filters,
        totalPages,
        paginationSize
      } = action.payload;
      state.personal = personal;
      state.merchant = merchant;
      state.active = active;
      state.deleted = deleted;
      state.direction = direction;
      state.limit = limit;
      state.phoneNumber = phoneNumber;
      state.merchantId = merchantId;
      state.merchantName = merchantName;

      state.paginationCurrentPage = paginationCurrentPage;
      state.filters = filters;
      state.totalPages = totalPages;
      state.paginationSize = paginationSize;
    },

    setFieldValue: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },

    setPersonal: (state, action) => {
      const { personal } = action.payload;
      state.personal = personal;
    },

    setMerchant: (state, action) => {
      const { merchant } = action.payload;
      state.merchant = merchant;
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

    setPhoneNumber: (state, action) => {
      const { phoneNumber } = action.payload;
      state.phoneNumber = phoneNumber;
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

    resetAllCustomerSettings: (state, action) => {
      state.personal = true;
      state.merchant = true;
      state.active = true;
      state.deleted = false;
      state.direction = 'DESC';
      state.limit = '500';
      state.phoneNumber = '';
      state.merchantId = '';
      state.merchantName = '';

      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
      state.paginationSize = 20;
    },

    resetTableCustomerSettings: (state, action) => {
      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
    },

    resetSearchTransactionSettings: (state, action) => {
      state.personal = true;
      state.merchant = true;
      state.active = true;
      state.deleted = false;
      state.direction = 'DESC';
      state.limit = '500';
      state.phoneNumber = '';
      state.merchantId = '';
      state.merchantName = '';
    }
  }
});

export const {
  setSettings,
  resetAllCustomerSettings,
  resetSearchTransactionSettings,
  resetTableCustomerSettings,
  setPaginationCurrentPage,
  setActive,
  setDirection,
  setLimit,
  setDeleted,
  setFilters,
  setMerchant,
  setMerchantId,
  setFieldValue,
  setMerchantName,
  setPaginationSize,
  setTotalPages,
  setPersonal,
  setPhoneNumber
} = customersTableSlice.actions;

export default customersTableSlice.reducer;
