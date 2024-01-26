import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const getClientTransactions = createAsyncThunk('/transactions/client', async (params) => {
  const walletId = params.walletId;
  const from = params.fromDate;
  const to = params.toDate;
  const skip = params.skip;
  const limit = params.limit || 20;

  const response = await axios.get(`/api/transactions/get-transactions/${walletId}`, {
    params: {
      to,
      from,
      skip,
      limit
    }
  });

  return response.data;
});

export const getTransactions = createAsyncThunk('/all-transactions', async (params) => {
  const from = params.from;
  const to = params.to;
  const skip = params.skip;
  const limit = params.limit || 20;
  const response = await axios.get(`/api/transactions/get-transactions`, {
    params: {
      from,
      to
    }
  });

  return response.data;
});

export const getOperatorTypes = createAsyncThunk('/transactions/get-operator-types', async () => {
  const response = await axios.get(`/api/transactions/get-operator-types`, {});

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

/**
 * Asynchronously withdraws an amount from a specified wallet.
 *
 * @param {Object} payload - The data needed for the withdrawal transaction.
 * @param {number} payload.amount - The amount to be withdrawn.
 * @param {string} payload.phoneNumber - The phone number associated with the transaction.
 * @param {string} payload.operatorId - The ID of the operator handling the transaction.
 * @param {number} payload.operatorFee - The fee charged by the operator.
 * @param {string} payload.walletId - The unique identifier of the wallet.
 * @returns {Promise<Object>} The response data from the server.
 */
export const withdrawFromAccount = createAsyncThunk(
  '/transaction/withdraw-account',
  async ({ amount, phoneNumber, operatorId, operatorFee, walletId }) => {
    // Constructing the API endpoint with the walletId in the URL
    const endpoint = `/api/wallet/actions/withdraw/${walletId}`;

    try {
      // Performing the withdrawal operation via a POST request
      const response = await axios.post(endpoint, {
        amount: parseInt(amount),
        phone: phoneNumber,
        oid: parseInt(operatorId),
        fee: parseFloat(operatorFee)
      });
      // Returning the data received from the server
      return response.data;
    } catch (e) {
      // Throwing an error with the response's status text or a default message
      throw new Error(e.response?.statusText || e.message);
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
      const oldTransactionsLength = state.transactions?.length;
      state.transactions = [...state.transactions, ...action.payload.transactions];

      if (oldTransactionsLength === state.transactions?.length) {
        state.noMoreQuery = true;
      }
      state.isLoading = false;
    },
    [getClientTransactions.rejected]: (state) => {
      state.isLoading = false;
    },

    [getTransactions.pending]: (state) => {
      state.isLoading = true;
    },
    [getTransactions.fulfilled]: (state, action) => {
      state.transactions = [...action.payload.transactions];

      state.isLoading = false;
    },
    [getTransactions.rejected]: (state) => {
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

    [withdrawFromAccount.pending]: (state) => {
      state.isLoading = true;
    },
    [withdrawFromAccount.fulfilled]: (state, action) => {
      // state.transactions = [action.payload.transaction, ...state.transactions];
      // state.totalCount += 1;
      state.isLoading = false;
    },
    [withdrawFromAccount.rejected]: (state) => {
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
