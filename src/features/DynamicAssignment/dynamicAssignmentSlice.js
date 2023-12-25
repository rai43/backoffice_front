import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { REQUEST_QUERY_CONSTANTS } from '../../utils/globalConstantUtil';
import moment from 'moment';

export const getNotAssignedOrders = createAsyncThunk(
  '/orders/get-all-not-assigned-orders',
  async (params) => {
    const from = params?.from;
    const to = params?.to;

    const response = await axios.get(`/api/order/get-not-assigned-orders`, {
      params: {
        from,
        to
      }
    });

    console.log(response.data);
    return response.data;
  }
);

export const markPresentLivreursPerZone = createAsyncThunk(
  '/dynamic/mark-present-livreurs-per-zone',
  async (params) => {
    const zone = params.zone;
    const livreurs = params.livreurs;

    const payload = JSON.stringify({ zone, livreurs });

    const response = await axios.post(
      `/api/dynamic-assignment/mark-present-livreurs-per-zone`,
      payload
    );

    console.log(response.data);
    return response.data;
  }
);

export const generateFiles = createAsyncThunk('/dynamic/generated-input-files', async (params) => {
  const response = await axios.get(`/api/dynamic-assignment/generate-input-files`);

  console.log(response.data);
  return response.data;
});

export const dynamicAssignment = createAsyncThunk(
  '/dynamic/assign-livreurs-to-orders',
  async (params) => {
    const response = await axios.get(`/api/dynamic-assignment/assign-livreurs-to-orders`);

    console.log(response.data);
    return response.data;
  }
);

export const notAsssignedOrderSlice = createSlice({
  name: 'notAsssignedOrder',
  initialState: {
    isLoading: false,
    orders: []
  },

  reducers: {
    resetForm: (state) => {
      state.isLoading = false;
      state.orders = [];
    }
  },

  extraReducers: {
    [getNotAssignedOrders.pending]: (state) => {
      state.isLoading = true;
    },
    [getNotAssignedOrders.fulfilled]: (state, action) => {
      state.orders = [...action.payload.orders];

      state.isLoading = false;
    },
    [getNotAssignedOrders.rejected]: (state) => {
      state.isLoading = false;
    },

    [dynamicAssignment.pending]: (state) => {
      state.isLoading = true;
    },
    [dynamicAssignment.fulfilled]: (state, action) => {
      state.isLoading = false;
    },
    [dynamicAssignment.rejected]: (state) => {
      state.isLoading = false;
    },

    [generateFiles.pending]: (state) => {
      state.isLoading = true;
    },
    [generateFiles.fulfilled]: (state, action) => {
      state.isLoading = false;
    },
    [generateFiles.rejected]: (state) => {
      state.isLoading = false;
    }
  }
});

export const { resetForm } = notAsssignedOrderSlice.actions;

export default notAsssignedOrderSlice.reducer;
