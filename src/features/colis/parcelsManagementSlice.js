import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import moment from 'moment/moment';

import { countStatuses } from '../../utils/colisUtils';

export const getColis = createAsyncThunk('/parcels-management/get-colis', async (params) => {
  const from = params.from || moment.utc().format('YYYY-MM-DD');
  const to = params.to || moment.utc().format('YYYY-MM-DD');
  const skip = params.skip;

  const response = await axios.get('/api/colis/get-colis', {
    params: {
      from,
      to,
      skip
    }
  });

  return response.data;
});

export const saveColis = createAsyncThunk('/parcels-management/save-colis', async (params) => {
  const pickup_phone_number = params.pickup_phone_number;
  const pickup_address_name = params.pickup_address_name;
  const delivery_phone_number = params.delivery_phone_number;
  const delivery_address_name = params.delivery_address_name;
  const fee = params.fee;
  const fee_payment = params.fee_payment;
  const price = params.price;
  const pickup_livreur_id = params.pickup_livreur_id;
  const delivery_livreur_id = params.delivery_livreur_id;
  console.log(params);

  const payload = JSON.stringify({
    pickup_phone_number,
    pickup_address_name,
    delivery_phone_number,
    delivery_address_name,
    fee,
    fee_payment,
    price,
    pickup_livreur_id,
    delivery_livreur_id
  });

  const response = await axios.post('/api/colis/save-colis', payload);
  return response.data;
});

export const saveColisBulk = createAsyncThunk(
  '/parcels-management/save-colis-bulk',
  async (params, { rejectWithValue }) => {
    const { parcels } = params;

    // Verify each parcel
    for (const parcel of parcels) {
      const {
        merchant_phone_number,
        pickup_phone_number,
        pickup_address_name,
        delivery_phone_number,
        delivery_address_name,
        fee_payment
        // fee,
        // price
      } = parcel;

      // Check for required fields
      if (
        !merchant_phone_number ||
        !pickup_phone_number ||
        !pickup_address_name ||
        !delivery_phone_number ||
        !delivery_address_name ||
        !fee_payment
        // fee === undefined ||
        // fee <= 0 ||
      ) {
        return rejectWithValue('One or more parcels are missing required fields.');
      }
    }

    // Construct the payload from the verified parcels
    const payload = JSON.stringify(parcels);

    // Send the request to the backend
    try {
      const response = await axios.post('/api/colis/save-colis-bulk', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateColis = createAsyncThunk(
  '/parcels-management/update-colis',
  async (params, { rejectWithValue }) => {
    const { parcel } = params;

    console.log({ params });

    const {
      id, // Assuming this is the unique identifier for the parcel
      merchant_phone_number,
      pickup_phone_number,
      pickup_address_name,
      delivery_phone_number,
      delivery_address_name,
      fee_payment
      // fee,
      // price
    } = parcel;

    // Check for required fields
    if (
      !id ||
      !merchant_phone_number ||
      !pickup_phone_number ||
      !pickup_address_name ||
      !delivery_phone_number ||
      !delivery_address_name ||
      !fee_payment
      // fee === undefined ||
      // fee <= 0 ||
      // || price === undefined
    ) {
      return rejectWithValue('Missing required fields for updating the parcel.');
    }

    // Construct the payload from the verified parcel
    // const payload = JSON.stringify(parcel);

    // Send the request to the backend for updating
    try {
      const response = await axios.put(`/api/colis/update-colis/${id}`, { ...parcel });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const changeColisStatus = createAsyncThunk(
  '/parcels-management/set-colis-status',
  async (params) => {
    const colisId = params?.colisId;
    const livreurId = params.livreurId ? params.livreurId : 'UNDEFINED';
    const action = params.action;
    let response = await axios.patch(
      `/api/colis/set-colis-status/${action}/${colisId}/${livreurId}`,
      {}
    );

    return response.data;
  }
);

export const deleteColis = createAsyncThunk('/parcels-management/delete-colis', async (params) => {
  const { colisId } = params;
  let response = await axios.patch(`/api/colis/delete-colis/${colisId}`);

  return response.data;
});

export const payColisMerchant = createAsyncThunk(
  '/parcels-management/pay-colis-merchant',
  async (params, { rejectWithValue }) => {
    const { colisId, amount } = params;

    // Send the request to the backend
    try {
      let response = await axios.post(`/api/colis/pay-colis-merchant/${colisId}`, {
        amount
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const payColisMerchantBulk = createAsyncThunk(
  '/parcels-management/pay-colis-merchant',
  async (params, { rejectWithValue }) => {
    const { paymentArray } = params;

    // Construct the payload from the verified parcels
    const payload = JSON.stringify(paymentArray);

    // Send the request to the backend
    try {
      let response = await axios.post(`/api/colis/pay-colis-merchant-bulk`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateColisPaymentStatus = createAsyncThunk(
  '/parcels-management/update-colis-payment-status',
  async (params, { rejectWithValue }) => {
    const { colisId, fee_payment, paid } = params;

    // Send the request to the backend
    try {
      let response = await axios.patch(`/api/colis/update-colis-payment-status/${colisId}`, {
        fee_payment,
        paid
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const parcelsManagementSlice = createSlice({
  name: 'parcelsManagement',
  initialState: {
    isLoading: false,
    colis: [],
    skip: 0,
    noMoreQuery: false,
    totalCount: 0,

    pendingCount: 0,
    registeredCount: 0,
    canceledCount: 0,
    assignedForCollectionCount: 0,
    collectionInProgressCount: 0,
    collectedCount: 0,
    notCollectedCount: 0,
    warehousedCount: 0,
    assignedForDeliveryCount: 0,
    waitingForDeliveryCount: 0,
    deliveryInProgressCount: 0,
    deliveredCount: 0,
    notDeliveredCount: 0,
    articleToReturnCount: 0,
    assignedForReturnCount: 0,
    returnInProgressCount: 0,
    returnedCount: 0,
    notReturnedCount: 0,
    refusedCount: 0,
    lostCount: 0
  },
  reducers: {
    resetForm: (state) => {
      state.isLoading = false;
      state.colis = [];
      state.skip = 0;
      state.noMoreQuery = false;
      state.totalCount = 0;

      state.pendingCount = 0;
      state.registeredCount = 0;
      state.canceledCount = 0;
      state.assignedForCollectionCount = 0;
      state.collectionInProgressCount = 0;
      state.collectedCount = 0;
      state.notCollectedCount = 0;
      state.warehousedCount = 0;
      state.assignedForDeliveryCount = 0;
      state.waitingForDeliveryCount = 0;
      state.deliveryInProgressCount = 0;
      state.deliveredCount = 0;
      state.notDeliveredCount = 0;
      state.articleToReturnCount = 0;
      state.assignedForReturnCount = 0;
      state.returnInProgressCount = 0;
      state.returnedCount = 0;
      state.notReturnedCount = 0;
      state.refusedCount = 0;
      state.lostCount = 0;
    }
  },

  extraReducers: {
    [getColis.pending]: (state) => {
      state.isLoading = true;
    },
    [getColis.fulfilled]: (state, action) => {
      state.colis = [...state.colis, ...action.payload.colis];

      // state.colis = [...action.payload?.colis];
      // state.totalCount = action.payload?.totalCount;
      state.pendingCount = action.payload?.pendingCount;
      state.articleToReturnCount = action.payload?.articleToReturnCount;
      state.registeredCount = action.payload?.registeredCount;
      state.canceledCount = action.payload?.canceledCount;
      state.assignedForCollectionCount = action.payload?.assignedForCollectionCount;
      state.collectionInProgressCount = action.payload?.collectionInProgressCount;
      state.collectedCount = action.payload?.collectedCount;
      state.notCollectedCount = action.payload?.notCollectedCount;
      state.warehousedCount = action.payload?.warehousedCount;
      state.assignedForDeliveryCount = action.payload?.assignedForDeliveryCount;
      state.waitingForDeliveryCount = action.payload?.waitingForDeliveryCount;
      state.deliveryInProgressCount = action.payload?.deliveryInProgressCount;
      state.deliveredCount = action.payload?.deliveredCount;
      state.notDeliveredCount = action.payload?.notDeliveredCount;
      state.assignedForReturnCount = action.payload?.assignedForReturnCount;
      state.returnInProgressCount = action.payload?.returnInProgressCount;
      state.returnedCount = action.payload?.returnedCount;
      state.notReturnedCount = action.payload?.notReturnedCount;
      state.refusedCount = action.payload?.refusedCount;
      state.lostCount = action.payload?.lostCount;

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
    [getColis.rejected]: (state) => {
      state.isLoading = false;
    },

    [changeColisStatus.pending]: (state) => {
      state.isLoading = true;
    },
    [changeColisStatus.fulfilled]: (state, action) => {
      const indexToRemoved = state.colis.findIndex(
        (order) => order.id === action.payload?.colis?.id
      );
      if (indexToRemoved !== -1) {
        state.colis[indexToRemoved] = action.payload?.colis;

        const stats = countStatuses(state.colis);
        state.pendingCount = stats?.pendingCount;
        state.articleToReturnCount = stats?.articleToReturnCount;
        state.registeredCount = stats?.registeredCount;
        state.canceledCount = stats?.canceledCount;
        state.assignedForCollectionCount = stats?.assignedForCollectionCount;
        state.collectionInProgressCount = stats?.collectionInProgressCount;
        state.collectedCount = stats?.collectedCount;
        state.notCollectedCount = stats?.notCollectedCount;
        state.warehousedCount = stats?.warehousedCount;
        state.assignedForDeliveryCount = stats?.assignedForDeliveryCount;
        state.waitingForDeliveryCount = stats?.waitingForDeliveryCount;
        state.deliveryInProgressCount = stats?.deliveryInProgressCount;
        state.deliveredCount = stats?.deliveredCount;
        state.notDeliveredCount = stats?.notDeliveredCount;
        state.assignedForReturnCount = stats?.assignedForReturnCount;
        state.returnInProgressCount = stats?.returnInProgressCount;
        state.returnedCount = stats?.returnedCount;
        state.notReturnedCount = stats?.notReturnedCount;
        state.refusedCount = stats?.refusedCount;
        state.lostCount = stats?.lostCount;
      }
      state.isLoading = false;
    },
    [changeColisStatus.rejected]: (state) => {
      state.isLoading = false;
    },

    [updateColis.pending]: (state) => {
      state.isLoading = true;
    },
    [updateColis.fulfilled]: (state, action) => {
      const indexToReplace = state.colis.findIndex(
        (order) => order.id === action.payload?.colis?.id
      );
      if (indexToReplace !== -1) {
        state.colis[indexToReplace] = action.payload?.colis;

        const stats = countStatuses(state.colis);
        state.pendingCount = stats?.pendingCount;
        state.articleToReturnCount = stats?.articleToReturnCount;
        state.registeredCount = stats?.registeredCount;
        state.canceledCount = stats?.canceledCount;
        state.assignedForCollectionCount = stats?.assignedForCollectionCount;
        state.collectionInProgressCount = stats?.collectionInProgressCount;
        state.collectedCount = stats?.collectedCount;
        state.notCollectedCount = stats?.notCollectedCount;
        state.warehousedCount = stats?.warehousedCount;
        state.assignedForDeliveryCount = stats?.assignedForDeliveryCount;
        state.waitingForDeliveryCount = stats?.waitingForDeliveryCount;
        state.deliveryInProgressCount = stats?.deliveryInProgressCount;
        state.deliveredCount = stats?.deliveredCount;
        state.notDeliveredCount = stats?.notDeliveredCount;
        state.assignedForReturnCount = stats?.assignedForReturnCount;
        state.returnInProgressCount = stats?.returnInProgressCount;
        state.returnedCount = stats?.returnedCount;
        state.notReturnedCount = stats?.notReturnedCount;
        state.refusedCount = stats?.refusedCount;
        state.lostCount = stats?.lostCount;
      }
      state.isLoading = false;
    },
    [updateColis.rejected]: (state) => {
      state.isLoading = false;
    },

    [saveColis.pending]: (state) => {
      state.isLoading = true;
    },
    [saveColis.fulfilled]: (state, action) => {
      state.colis = [action.payload?.colis, ...state?.colis];

      const stats = countStatuses(state.colis);
      state.pendingCount = stats?.pendingCount;
      state.articleToReturnCount = stats?.articleToReturnCount;
      state.registeredCount = stats?.registeredCount;
      state.canceledCount = stats?.canceledCount;
      state.assignedForCollectionCount = stats?.assignedForCollectionCount;
      state.collectionInProgressCount = stats?.collectionInProgressCount;
      state.collectedCount = stats?.collectedCount;
      state.notCollectedCount = stats?.notCollectedCount;
      state.warehousedCount = stats?.warehousedCount;
      state.assignedForDeliveryCount = stats?.assignedForDeliveryCount;
      state.waitingForDeliveryCount = stats?.waitingForDeliveryCount;
      state.deliveryInProgressCount = stats?.deliveryInProgressCount;
      state.deliveredCount = stats?.deliveredCount;
      state.notDeliveredCount = stats?.notDeliveredCount;
      state.assignedForReturnCount = stats?.assignedForReturnCount;
      state.returnInProgressCount = stats?.returnInProgressCount;
      state.returnedCount = stats?.returnedCount;
      state.notReturnedCount = stats?.notReturnedCount;
      state.refusedCount = stats?.refusedCount;
      state.lostCount = stats?.lostCount;
      state.isLoading = false;
    },
    [saveColis.rejected]: (state) => {
      state.isLoading = false;
    },

    [deleteColis.pending]: (state) => {
      state.isLoading = true;
    },
    [deleteColis.fulfilled]: (state, action) => {
      const indexToRemoved = state.colis.findIndex(
        (offer) => offer.id === action.payload?.colis?.id
      );

      if (indexToRemoved !== -1) {
        state.colis.splice(indexToRemoved, 1);
      }

      const stats = countStatuses(state.colis);
      state.pendingCount = stats?.pendingCount;
      state.articleToReturnCount = stats?.articleToReturnCount;
      state.registeredCount = stats?.registeredCount;
      state.canceledCount = stats?.canceledCount;
      state.assignedForCollectionCount = stats?.assignedForCollectionCount;
      state.collectionInProgressCount = stats?.collectionInProgressCount;
      state.collectedCount = stats?.collectedCount;
      state.notCollectedCount = stats?.notCollectedCount;
      state.warehousedCount = stats?.warehousedCount;
      state.assignedForDeliveryCount = stats?.assignedForDeliveryCount;
      state.waitingForDeliveryCount = stats?.waitingForDeliveryCount;
      state.deliveryInProgressCount = stats?.deliveryInProgressCount;
      state.deliveredCount = stats?.deliveredCount;
      state.notDeliveredCount = stats?.notDeliveredCount;
      state.assignedForReturnCount = stats?.assignedForReturnCount;
      state.returnInProgressCount = stats?.returnInProgressCount;
      state.returnedCount = stats?.returnedCount;
      state.notReturnedCount = stats?.notReturnedCount;
      state.refusedCount = stats?.refusedCount;
      state.lostCount = stats?.lostCount;

      state.isLoading = false;
    },
    [deleteColis.rejected]: (state) => {
      state.isLoading = false;
    },

    [saveColisBulk.pending]: (state) => {
      state.isLoading = true;
    },
    [saveColisBulk.fulfilled]: (state, action) => {
      console.log({ state: state?.colis });
      state.colis = [...action.payload?.colis, ...state?.colis];

      const stats = countStatuses(state.colis);
      state.pendingCount = stats?.pendingCount;
      state.articleToReturnCount = stats?.articleToReturnCount;
      state.registeredCount = stats?.registeredCount;
      state.canceledCount = stats?.canceledCount;
      state.assignedForCollectionCount = stats?.assignedForCollectionCount;
      state.collectionInProgressCount = stats?.collectionInProgressCount;
      state.collectedCount = stats?.collectedCount;
      state.notCollectedCount = stats?.notCollectedCount;
      state.warehousedCount = stats?.warehousedCount;
      state.assignedForDeliveryCount = stats?.assignedForDeliveryCount;
      state.waitingForDeliveryCount = stats?.waitingForDeliveryCount;
      state.deliveryInProgressCount = stats?.deliveryInProgressCount;
      state.deliveredCount = stats?.deliveredCount;
      state.notDeliveredCount = stats?.notDeliveredCount;
      state.assignedForReturnCount = stats?.assignedForReturnCount;
      state.returnInProgressCount = stats?.returnInProgressCount;
      state.returnedCount = stats?.returnedCount;
      state.notReturnedCount = stats?.notReturnedCount;
      state.refusedCount = stats?.refusedCount;
      state.lostCount = stats?.lostCount;
      state.isLoading = false;
    },
    [saveColisBulk.rejected]: (state) => {
      state.isLoading = false;
    },

    [payColisMerchant.pending]: (state) => {
      state.isLoading = true;
    },
    [payColisMerchant.fulfilled]: (state, action) => {
      const indexToReplaced = state.colis.findIndex(
        (colis) => colis.id === action.payload?.colis?.id
      );
      if (indexToReplaced !== -1) {
        state.colis[indexToReplaced] = action.payload?.colis;

        const stats = countStatuses(state.colis);
        state.pendingCount = stats?.pendingCount;
        state.articleToReturnCount = stats?.articleToReturnCount;
        state.registeredCount = stats?.registeredCount;
        state.canceledCount = stats?.canceledCount;
        state.assignedForCollectionCount = stats?.assignedForCollectionCount;
        state.collectionInProgressCount = stats?.collectionInProgressCount;
        state.collectedCount = stats?.collectedCount;
        state.notCollectedCount = stats?.notCollectedCount;
        state.warehousedCount = stats?.warehousedCount;
        state.assignedForDeliveryCount = stats?.assignedForDeliveryCount;
        state.waitingForDeliveryCount = stats?.waitingForDeliveryCount;
        state.deliveryInProgressCount = stats?.deliveryInProgressCount;
        state.deliveredCount = stats?.deliveredCount;
        state.notDeliveredCount = stats?.notDeliveredCount;
        state.assignedForReturnCount = stats?.assignedForReturnCount;
        state.returnInProgressCount = stats?.returnInProgressCount;
        state.returnedCount = stats?.returnedCount;
        state.notReturnedCount = stats?.notReturnedCount;
        state.refusedCount = stats?.refusedCount;
        state.lostCount = stats?.lostCount;
      }
      state.isLoading = false;
    },
    [payColisMerchant.rejected]: (state) => {
      state.isLoading = false;
    },

    [payColisMerchantBulk.pending]: (state) => {
      state.isLoading = true;
    },
    [payColisMerchantBulk.fulfilled]: (state, action) => {
      const successfulPayments = action?.payload?.bulkColisPayment?.successfulPayments;
      for (const payment of successfulPayments) {
        console.log({ successfulPayments, payment });
        const indexToReplaced = state.colis.findIndex((colis) => colis.id === payment?.colis?.id);
        if (indexToReplaced !== -1) {
          state.colis[indexToReplaced] = payment?.colis;
        }
      }

      const stats = countStatuses(state.colis);
      state.pendingCount = stats?.pendingCount;
      state.articleToReturnCount = stats?.articleToReturnCount;
      state.registeredCount = stats?.registeredCount;
      state.canceledCount = stats?.canceledCount;
      state.assignedForCollectionCount = stats?.assignedForCollectionCount;
      state.collectionInProgressCount = stats?.collectionInProgressCount;
      state.collectedCount = stats?.collectedCount;
      state.notCollectedCount = stats?.notCollectedCount;
      state.warehousedCount = stats?.warehousedCount;
      state.assignedForDeliveryCount = stats?.assignedForDeliveryCount;
      state.waitingForDeliveryCount = stats?.waitingForDeliveryCount;
      state.deliveryInProgressCount = stats?.deliveryInProgressCount;
      state.deliveredCount = stats?.deliveredCount;
      state.notDeliveredCount = stats?.notDeliveredCount;
      state.assignedForReturnCount = stats?.assignedForReturnCount;
      state.returnInProgressCount = stats?.returnInProgressCount;
      state.returnedCount = stats?.returnedCount;
      state.notReturnedCount = stats?.notReturnedCount;
      state.refusedCount = stats?.refusedCount;
      state.lostCount = stats?.lostCount;

      state.isLoading = false;
    },
    [payColisMerchantBulk.rejected]: (state) => {
      state.isLoading = false;
    },

    [updateColisPaymentStatus.pending]: (state) => {
      state.isLoading = true;
    },
    [updateColisPaymentStatus.fulfilled]: (state, action) => {
      const indexToReplaced = state.colis.findIndex(
        (colis) => colis.id === action.payload?.colis?.id
      );
      if (indexToReplaced !== -1) {
        state.colis[indexToReplaced] = action.payload?.colis;

        const stats = countStatuses(state.colis);
        state.pendingCount = stats?.pendingCount;
        state.articleToReturnCount = stats?.articleToReturnCount;
        state.registeredCount = stats?.registeredCount;
        state.canceledCount = stats?.canceledCount;
        state.assignedForCollectionCount = stats?.assignedForCollectionCount;
        state.collectionInProgressCount = stats?.collectionInProgressCount;
        state.collectedCount = stats?.collectedCount;
        state.notCollectedCount = stats?.notCollectedCount;
        state.warehousedCount = stats?.warehousedCount;
        state.assignedForDeliveryCount = stats?.assignedForDeliveryCount;
        state.waitingForDeliveryCount = stats?.waitingForDeliveryCount;
        state.deliveryInProgressCount = stats?.deliveryInProgressCount;
        state.deliveredCount = stats?.deliveredCount;
        state.notDeliveredCount = stats?.notDeliveredCount;
        state.assignedForReturnCount = stats?.assignedForReturnCount;
        state.returnInProgressCount = stats?.returnInProgressCount;
        state.returnedCount = stats?.returnedCount;
        state.notReturnedCount = stats?.notReturnedCount;
        state.refusedCount = stats?.refusedCount;
        state.lostCount = stats?.lostCount;
      }
      state.isLoading = false;
    },
    [updateColisPaymentStatus.rejected]: (state) => {
      state.isLoading = false;
    }
  }
});

export const { resetForm } = parcelsManagementSlice.actions;

export default parcelsManagementSlice.reducer;
