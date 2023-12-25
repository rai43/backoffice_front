import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { useDispatch } from 'react-redux';

import { replaceClientObjectByUpdatedOne } from '../client/clientSlice';

export const getClientTransactions = createAsyncThunk('/transactions/client', async (params) => {
  const wallet = params.wallet;
  const transactionType = params.transactionType;
  const from = params.from;
  const to = params.to;
  const skip = params.skip;

  const response = await axios.get(`/api/transaction/get-transactions/${wallet}`, {
    params: {
      transactionType,
      to,
      from,
      skip
    }
  });

  return response.data;
});

export const getOperatorTypes = createAsyncThunk('/transactions/get-operator-types', async () => {
  const response = await axios.get(`/api/transaction/get-operator-types`, {});

  return response.data;
});

export const creditAccountToServer = createAsyncThunk(
  '/transaction/credit-account',
  async (payload) => {
    const { wallet, amount, accountType } = payload;

    try {
      const response = await axios.post(`/api/wallet/actions/credit/${accountType}/${wallet}`, {
        amount
      });
      return response.data;
    } catch (e) {
      throw new Error(e.statusText);
    }
  }
);

export const debitAccountToServer = createAsyncThunk(
  '/transaction/debit-account',
  async (payload) => {
    const { wallet, amount, accountType } = payload;

    try {
      const response = await axios.post(`/api/wallet/actions/debit/${accountType}/${wallet}`, {
        amount
      });
      return response.data;
    } catch (e) {
      throw new Error(e.statusText);
    }
  }
);

export const switchWalletStatus = createAsyncThunk(
  '/transaction/wallet/switch-status',
  async (payload) => {
    const { wallet } = payload;

    try {
      const response = await axios.patch(`/api/wallet/actions/block/${wallet}`);

      return response.data;
    } catch (e) {
      throw new Error(e.statusText);
    }
  }
);

export const generateStatistics = createAsyncThunk('/transactions/statistics', async (params) => {
  const { data, clientPhoneNumber } = params;
  const stats = {
    transactionsInCount: 0,
    transactionsOutCount: 0,
    transactionsInAmount: 0,
    transactionsOutAmount: 0,
    paymentsCount: 0,
    paymentsAmount: 0,
    topupsCount: 0,
    topupsAmount: 0,
    withdrawalsCount: 0,
    withdrawalsAmount: 0,
    bonusCount: 0,
    bonusAmount: 0
  };

  data.map((transaction) => {
    const transactionType = transaction?.transaction_type?.libelle || '';
    if (
      transactionType === 'BONUS' ||
      transactionType === 'RECHARGEMENT_MOBILE_MONEY' ||
      transactionType === 'RECHARGEMENT_STREET' ||
      transactionType === 'RECHARGEMENT'
    ) {
      stats.transactionsInCount += 1;
      stats.transactionsInAmount += parseFloat(transaction?.amount) || 0;
    } else {
      stats.transactionsOutCount += 1;
      stats.transactionsOutAmount += parseFloat(transaction?.amount) || 0;
    }
    if (transactionType === 'PAYMENT') {
      stats.paymentsCount += 1;
      console.log('trans: ', transaction?.reference, transaction?.amount);
      stats.paymentsAmount += parseFloat(transaction?.amount) || 0;
    } else if (transactionType === 'RETRAIT') {
      stats.withdrawalsCount += 1;
      stats.withdrawalsAmount += parseFloat(transaction?.amount) || 0;
    } else if (transactionType === 'BONUS') {
      stats.bonusCount += 1;
      stats.bonusAmount += parseFloat(transaction?.amount) || 0;
    } else if (
      transactionType === 'RECHARGEMENT_MOBILE_MONEY' ||
      transactionType === 'RECHARGEMENT_STREET' ||
      transactionType === 'RECHARGEMENT'
    ) {
      stats.topupsCount += 1;
      stats.topupsAmount += parseFloat(transaction?.amount) || 0;
    }
  });

  return stats;
});

export const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    isLoading: false,
    currentClientPhoneNumber: '',
    transactions: [],
    operator_operation_types: [],
    skip: 0,
    noMoreQuery: false,
    totalCount: 0
  },

  reducers: {
    resetForm: (state) => {
      state.skip = 0;
      state.totalCount = 0;
      state.transactions = [];
      state.isLoading = false;
      state.noMoreQuery = false;
      state.currentClientPhoneNumber = '';
    }
  },

  extraReducers: {
    [getClientTransactions.pending]: (state) => {
      state.isLoading = true;
    },
    [getClientTransactions.fulfilled]: (state, action) => {
      state.transactions = [...state.transactions, ...action.payload.transactions];
      if (state.totalCount !== action.payload.totalCount) {
        state.totalCount = action.payload.totalCount;
      }
      if (state.skip === action.payload.skip) {
        state.noMoreQuery = true;
      } else {
        state.skip = action.payload.skip;
      }
      state.isLoading = false;
    },
    [getClientTransactions.rejected]: (state) => {
      state.isLoading = false;
    },

    [creditAccountToServer.pending]: (state) => {
      state.isLoading = true;
    },
    [creditAccountToServer.fulfilled]: (state, action) => {
      state.transactions = [action.payload.transaction, ...state.transactions];
      state.totalCount += 1;
      state.isLoading = false;
    },
    [creditAccountToServer.rejected]: (state) => {
      state.isLoading = false;
    },

    [debitAccountToServer.pending]: (state) => {
      state.isLoading = true;
    },
    [debitAccountToServer.fulfilled]: (state, action) => {
      state.transactions = [action.payload.transaction, ...state.transactions];
      state.totalCount += 1;
      state.isLoading = false;
    },
    [debitAccountToServer.rejected]: (state) => {
      state.isLoading = false;
    },

    [getOperatorTypes.pending]: (state) => {
      // state.isLoading = true;
    },
    [getOperatorTypes.fulfilled]: (state, action) => {
      state.operator_operation_types = [...action.payload?.operatorTypes];
    },
    [getOperatorTypes.rejected]: (state) => {
      // state.isLoading = false;
    },

    [switchWalletStatus.pending]: (state) => {
      state.isLoading = true;
    },
    [switchWalletStatus.fulfilled]: (state, action) => {
      state.isLoading = false;
    },
    [switchWalletStatus.rejected]: (state) => {
      state.isLoading = false;
    }
  }
});

export const { resetForm } = transactionSlice.actions;

export default transactionSlice.reducer;
