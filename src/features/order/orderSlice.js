import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const getOrders = createAsyncThunk('/orders/get-all', async (params) => {
  const orderStatus = params?.orderStatus;
  const paymentMethod = params?.paymentMethod;
  const searchPattern = params?.searchPattern;
  const searchPatternId = params?.searchPatternId || '';
  const minAmount = params.minAmount;
  const maxAmount = params.maxAmount;

  const cmdId = params.cmdId;
  const clientPhone = params.clientPhone;
  const merchantName = params.merchantName;
  const merchantPhone = params.merchantPhone;

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

      cmdId,
      clientPhone,
      merchantName,
      merchantPhone,

      to,
      from,
      skip
    }
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

export const setOrderStatusNoCheck = createAsyncThunk(
  '/orders/set-status-no-check',
  async (params) => {
    const commandId = params?.commandId;
    const status = params.status;

    const response = await axios.patch(
      `/api/order/set-order-status-no-check/${commandId}/${status}`,
      {}
    );

    console.log(response.data);
    return response.data;
  }
);

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
    InInProcessState: 0
  };
  console.log('data', data);

  data.map((order) => {
    stats.totalPaid += parseFloat(order?.total) || 0;
    stats.totalDiscount += parseFloat(order?.total_discount) || 0;
    stats.totalDeliveryAmount += parseFloat(order?.delivery_fee) || 0;
    // console.log(transaction?.delivery_status);
    if (order?.payment_method === 'STREET') {
      stats.street += 1;
    } else if (order?.payment_method === 'CASH') {
      stats.cash += 1;
    }

    if (
      order?.commande_commande_statuses[order?.commande_commande_statuses?.length - 1]
        ?.commande_status?.code === 'INPROGRESS'
    ) {
      stats.InProgressState += 1;
    }
    if (
      order?.commande_commande_statuses[order?.commande_commande_statuses?.length - 1]
        ?.commande_status?.code === 'PENDING'
    ) {
      stats.InPendingState += 1;
    } else if (
      order?.commande_commande_statuses[order?.commande_commande_statuses?.length - 1]
        ?.commande_status?.code === 'REGISTERED'
    ) {
      stats.InRegisteredState += 1;
    } else if (
      order?.commande_commande_statuses[order?.commande_commande_statuses?.length - 1]
        ?.commande_status?.code === 'INDELIVERY'
    ) {
      stats.InInDeliveryState += 1;
    } else if (
      order?.commande_commande_statuses[order?.commande_commande_statuses?.length - 1]
        ?.commande_status?.code === 'DELIVERED'
    ) {
      stats.InDeliveredState += 1;
    } else if (
      order?.commande_commande_statuses[order?.commande_commande_statuses?.length - 1]
        ?.commande_status?.code === 'CANCELED'
    ) {
      stats.InCanceledState += 1;
    } else if (
      order?.commande_commande_statuses[order?.commande_commande_statuses?.length - 1]
        ?.commande_status?.code === 'INPROCESS'
    ) {
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
    orderSkipCount: 0,
    noMoreQuery: false,
    totalCount: 0
  },

  reducers: {
    resetForm: (state) => {
      state.orderSkipCount = 0;
      state.totalCount = 0;
      state.orders = [];
      state.noMoreQuery = false;
      state.isLoading = false;
    }
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
      if (state.orderSkipCount === action.payload.skip) {
        state.noMoreQuery = true;
      } else {
        state.orderSkipCount = action.payload.skip;
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
      const indexToRemoved = state.orders.findIndex(
        (order) => order.id === action.payload?.order?.id
      );

      // If the object is found, replace it with the new object
      if (indexToRemoved !== -1) {
        state.orders[indexToRemoved] = action.payload?.order;
      }
      state.isLoading = false;
    },
    [setOrderStatus.rejected]: (state) => {
      state.isLoading = false;
    },

    [setOrderStatusNoCheck.pending]: (state) => {
      state.isLoading = true;
    },
    [setOrderStatusNoCheck.fulfilled]: (state, action) => {
      const indexToRemoved = state.orders.findIndex(
        (order) => order.id === action.payload?.order?.id
      );

      // If the object is found, replace it with the new object
      if (indexToRemoved !== -1) {
        state.orders[indexToRemoved] = action.payload?.order;
      }
      state.isLoading = false;
    },
    [setOrderStatusNoCheck.rejected]: (state) => {
      state.isLoading = false;
    }
  }
});

export const { resetForm } = orderSlice.actions;

export default orderSlice.reducer;
