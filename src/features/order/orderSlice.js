import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const getOrders = createAsyncThunk('/orders/get-all', async (params) => {
	const orderStatus = params?.orderStatus;
	const paymentMethod = params?.paymentMethod;
	const searchPattern = params?.searchPattern;
	const searchPatternId = params?.searchPatternId || '';
	const minAmount = params.minAmount;
	const maxAmount = params.maxAmount;
	const from = params?.from;
	const to = params?.to;
	const skip = params?.skip;

	const response = await axios.get(`/api/order/get-orders`, {
		params: {
			orderStatus,
			paymentMethod,
			searchPattern,
			searchPatternId,
			minAmount,
			maxAmount,
			to,
			from,
			skip,
		},
	});

	console.log(response.data);
	return response.data;
});

export const setOrderStatus = createAsyncThunk('/orders/set-status', async (params) => {
	const commandId = params?.commandId;
	const livreurId = params.livreurId ? params.livreurId : 'UNDEFINED';
	const isDelete = params.isDelete;
	const isChangeLivreur = params.isChangeLivreur;
	let response;

	if (isChangeLivreur) {
		response = await axios.patch(`/api/order/assign-livreur/${commandId}/${livreurId}`, {});
	} else if (isDelete) {
		response = await axios.patch(`/api/order/cancel-order/${commandId}`, {});
	} else {
		response = await axios.patch(`/api/order/set-order-status/${commandId}/${livreurId}`, {});
	}

	console.log(response.data);
	return response.data;
});

export const generateStatistics = createAsyncThunk('/transactions/statistics', async (params) => {
	const { data } = params;
	const stats = {
		totalOrders: data?.length || 0,
		totalPaid: 0,
		totalDiscount: 0,
		cash: 0,
		street: 0,
		totalDeliveryAmount: 0,
		InProgressState: 0,
		InPendingState: 0,
		InRegisteredState: 0,
		InInDeliveryState: 0,
		InDeliveredState: 0,
		InCanceledState: 0,
		InInProcessState: 0,
	};
	console.log('data', data);

	data.map((transaction) => {
		stats.totalPaid += parseFloat(transaction?.total) || 0;
		stats.totalDiscount += parseFloat(transaction?.total_discount) || 0;
		stats.totalDeliveryAmount += parseFloat(transaction?.delivery_fee) || 0;
		// console.log(transaction?.delivery_status);
		if (transaction?.payment_method === 'STREET') {
			stats.street += 1;
		} else if (transaction?.payment_method === 'CASH') {
			stats.cash += 1;
		}

		if (transaction?.delivery_status === 'INPROGRESS') {
			stats.InProgressState += 1;
		}
		if (transaction?.delivery_status === 'PENDING') {
			stats.InPendingState += 1;
		} else if (transaction?.delivery_status === 'REGISTERED') {
			stats.InRegisteredState += 1;
		} else if (transaction?.delivery_status === 'INDELIVERY') {
			stats.InInDeliveryState += 1;
		} else if (transaction?.delivery_status === 'DELIVERED') {
			stats.InDeliveredState += 1;
		} else if (transaction?.delivery_status === 'CANCELED') {
			stats.InCanceledState += 1;
		} else if (transaction?.delivery_status === 'INPROCESS') {
			stats.InInProcessState += 1;
		}
	});

	return stats;
});

export const orderSlice = createSlice({
	name: 'orders',
	initialState: {
		isLoading: false,
		orders: [],
		skip: 0,
		noMoreQuery: false,
		totalCount: 0,
	},

	reducers: {
		resetForm: (state) => {
			state.from = 0;
			state.orders = [];
			state.noMoreQuery = false;
		},
	},

	extraReducers: {
		[getOrders.pending]: (state) => {
			state.isLoading = true;
		},
		[getOrders.fulfilled]: (state, action) => {
			state.orders = [...state.orders, ...action.payload.orders];
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
		[getOrders.rejected]: (state) => {
			state.isLoading = false;
		},

		[setOrderStatus.pending]: (state) => {
			state.isLoading = true;
		},
		[setOrderStatus.fulfilled]: (state, action) => {
			const indexToRemoved = state.orders.findIndex((order) => order.id === action.payload?.order?.id);

			// If the object is found, replace it with the new object
			if (indexToRemoved !== -1) {
				state.orders[indexToRemoved] = action.payload?.order;
			}
			state.isLoading = false;
		},
		[setOrderStatus.rejected]: (state) => {
			state.isLoading = false;
		},
	},
});

export const { resetForm } = orderSlice.actions;

export default orderSlice.reducer;
