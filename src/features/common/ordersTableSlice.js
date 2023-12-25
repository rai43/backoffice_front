import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

export const ordersTableSlice = createSlice({
  name: 'ordersTable',
  initialState: {
    orderStatus: 'ALL',
    paymentMethod: 'ALL',
    from: moment.utc().format('YYYY-MM-DD'),
    to: moment.utc().add(1, 'days').format('YYYY-MM-DD'),
    minAmount: 0,
    maxAmount: 0,
    searchPattern: '',
    cmdId: '',
    clientPhone: '',
    merchantName: 'ALL',
    merchantPhone: '',

    paginationCurrentPage: null,
    filters: {},
    totalPages: 0,
    paginationSize: 20
  },
  reducers: {
    setSettings: (state, action) => {
      const {
        orderStatus,
        paymentMethod,
        from,
        to,
        minAmount,
        maxAmount,
        searchPattern,
        cmdId,
        clientPhone,
        merchantName,
        merchantPhone,

        paginationCurrentPage,
        filters,
        totalPages,
        paginationSize
      } = action.payload;
      state.orderStatus = orderStatus;
      state.paymentMethod = paymentMethod;
      state.from = from;
      state.to = to;
      state.minAmount = minAmount;
      state.maxAmount = maxAmount;
      state.searchPattern = searchPattern;
      state.cmdId = cmdId;
      state.clientPhone = clientPhone;
      state.merchantName = merchantName;
      state.merchantPhone = merchantPhone;

      state.paginationCurrentPage = paginationCurrentPage;
      state.filters = filters;
      state.totalPages = totalPages;
      state.paginationSize = paginationSize;
    },

    setOrderStatus: (state, action) => {
      const { orderStatus } = action.payload;
      state.orderStatus = orderStatus;
    },

    setPaymentMethod: (state, action) => {
      const { paymentMethod } = action.payload;
      state.paymentMethod = paymentMethod;
    },

    setFrom: (state, action) => {
      const { from } = action.payload;
      state.from = from;
    },

    setTo: (state, action) => {
      const { to } = action.payload;
      state.to = to;
    },

    setMinAmount: (state, action) => {
      const { minAmount } = action.payload;
      state.minAmount = minAmount;
    },

    setMaxAmount: (state, action) => {
      const { maxAmount } = action.payload;
      state.maxAmount = maxAmount;
    },

    setSearchPattern: (state, action) => {
      const { searchPattern } = action.payload;
      state.searchPattern = searchPattern;
    },

    setCmdId: (state, action) => {
      const { cmdId } = action.payload;
      state.cmdId = cmdId;
    },

    setClientPhone: (state, action) => {
      const { clientPhone } = action.payload;
      state.clientPhone = clientPhone;
    },

    setMerchantPhone: (state, action) => {
      const { merchantPhone } = action.payload;
      state.merchantPhone = merchantPhone;
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

    resetAllOrdersSettings: (state, action) => {
      state.orderStatus = 'ALL';
      state.paymentMethod = 'ALL';
      state.from = moment.utc().format('YYYY-MM-DD');
      state.to = moment.utc().add(1, 'days').format('YYYY-MM-DD');
      state.minAmount = 0;
      state.maxAmount = 0;
      state.searchPattern = '';
      state.cmdId = '';
      state.clientPhone = '';
      state.merchantName = 'ALL';
      state.merchantPhone = '';

      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
      state.paginationSize = 20;
    },

    resetTableOrdersSettings: (state, action) => {
      state.paginationCurrentPage = null;
      state.filters = {};
      state.totalPages = 0;
    },

    resetSearchOrdersSettings: (state, action) => {
      state.orderStatus = 'ALL';
      state.paymentMethod = 'ALL';
      state.from = moment.utc().format('YYYY-MM-DD');
      state.to = moment.utc().add(1, 'days').format('YYYY-MM-DD');
      state.minAmount = 0;
      state.maxAmount = 0;
      state.searchPattern = '';
      state.cmdId = '';
      state.clientPhone = '';
      state.merchantName = 'ALL';
      state.merchantPhone = '';
    }
  }
});

export const {
  setSettings,
  resetAllOrdersSettings,
  resetSearchOrdersSettings,
  resetTableOrdersSettings,
  setMerchantName,
  setMerchantPhone,
  setClientPhone,
  setCmdId,
  setFrom,
  setFilters,
  setMaxAmount,
  setMinAmount,
  setOrderStatus,
  setPaginationSize,
  setSearchPattern,
  setPaymentMethod,
  setTo,
  setTotalPages,
  setPaginationCurrentPage
} = ordersTableSlice.actions;

export default ordersTableSlice.reducer;
