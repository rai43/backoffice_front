import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { replaceClientObjectByUpdatedOne } from '../client/clientSlice';
import { useDispatch } from 'react-redux';

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
			skip,
		},
	});

	console.log(response.data);
	return response.data;
});

export const getClientsTransactions = createAsyncThunk('/transactions/clients', async (params) => {
	console.log('params', params);
	const transactionType = params.transactionType;
	const from = params.from;
	const to = params.to;
	const skip = params.skip;
	const minAmount = params.minAmount || 0;
	const maxAmount = params.maxAmount || 0;
	const searchPattern = params.searchPattern || 'null';

	const response = await axios.get(`/api/transaction/get-transactions`, {
		params: {
			transactionType,
			to,
			minAmount,
			maxAmount,
			from,
			skip,
			searchPattern,
		},
	});

	console.log(response.data);
	return response.data;
});

export const creditAccountToServer = createAsyncThunk('/transaction/credit-account', async (payload) => {
	const { wallet, amount, accountType } = payload;

	try {
		const response = await axios.post(`/api/wallet/actions/credit/${accountType}/${wallet}`, {
			amount,
		});
		console.log('response', response);
		return response.data;
	} catch (e) {
		throw new Error(e.statusText);
	}
});

export const debitAccountToServer = createAsyncThunk('/transaction/debit-account', async (payload) => {
	const { wallet, amount, accountType } = payload;

	try {
		const response = await axios.post(`/api/wallet/actions/debit/${accountType}/${wallet}`, {
			amount,
		});
		console.log('response', response);
		return response.data;
	} catch (e) {
		throw new Error(e.statusText);
	}
});

export const switchWalletStatus = createAsyncThunk('/transaction/wallet/switch-status', async (payload) => {
	const { wallet } = payload;

	try {
		const response = await axios.patch(`/api/wallet/actions/block/${wallet}`);

		console.log('response', response);
		return response.data;
	} catch (e) {
		throw new Error(e.statusText);
	}
});

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
		bonusAmount: 0,
	};

	data.map((transaction) => {
		// const isReceiver = transaction?.receiver_wallet?.client?.phone_number === clientPhoneNumber;
		// if (transaction?.receiver_wallet?.client?.phone_number === clientPhoneNumber || transaction?.sender_wallet?.client?.phone_number !== clientPhoneNumber) {
		// 	stats.transactionsInCount += 1;
		// 	stats.transactionsInAmount += transaction?.amount || 0;
		// } else {
		// 	stats.transactionsOutCount += 1;
		// 	stats.transactionsOutAmount += transaction?.amount || 0;
		// }

		const transactionType = transaction?.transaction_type?.libelle || '';
		if (transactionType === 'BONUS' || transactionType === 'RECHARGEMENT_MOBILE_MONEY' || transactionType === 'RECHARGEMENT_STREET' || transactionType === 'RECHARGEMENT') {
			stats.transactionsInCount += 1;
			stats.transactionsInAmount += transaction?.amount || 0;
		} else {
			stats.transactionsOutCount += 1;
			stats.transactionsOutAmount += transaction?.amount || 0;
		}
		if (transactionType === 'PAYMENT') {
			stats.paymentsCount += 1;
			stats.paymentsAmount += transaction?.amount || 0;
		} else if (transactionType === 'RETRAIT') {
			stats.withdrawalsCount += 1;
			stats.withdrawalsAmount += transaction?.amount || 0;
		} else if (transactionType === 'BONUS') {
			stats.bonusCount += 1;
			stats.bonusAmount += transaction?.amount || 0;
		} else if (transactionType === 'RECHARGEMENT_MOBILE_MONEY' || transactionType === 'RECHARGEMENT_STREET' || transactionType === 'RECHARGEMENT') {
			stats.topupsCount += 1;
			stats.topupsAmount += transaction?.amount || 0;
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
		skip: 0,
		noMoreQuery: false,
		totalCount: 0,
	},

	reducers: {
		resetForm: (state) => {
			state.from = 0;
			state.transactions = [];
			state.noMoreQuery = false;
			state.currentClientPhoneNumber = '';
		},
	},

	extraReducers: {
		// Actions to get the users - (get request)
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

		[getClientsTransactions.pending]: (state) => {
			state.isLoading = true;
		},
		[getClientsTransactions.fulfilled]: (state, action) => {
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
		[getClientsTransactions.rejected]: (state) => {
			state.isLoading = false;
		},
		// ========= ooooo =========

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

		[switchWalletStatus.pending]: (state) => {
			state.isLoading = true;
		},
		[switchWalletStatus.fulfilled]: (state, action) => {
			state.isLoading = false;
		},
		[switchWalletStatus.rejected]: (state) => {
			state.isLoading = false;
		},
		// ========= ooooo =========
	},
});

export const { resetForm } = transactionSlice.actions;

export default transactionSlice.reducer;
