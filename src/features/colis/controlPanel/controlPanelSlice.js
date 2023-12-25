import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import moment from 'moment/moment';

export const getColisStatistics = createAsyncThunk(
  '/control-panel/get-colis-statistics',
  async (params) => {
    const from = params.from || moment.utc().format('YYYY-MM-DD');
    const to = params.to || moment.utc().format('YYYY-MM-DD');

    const response = await axios.get('/api/colis/get-colis-statistics', {
      params: {
        from: from,
        to: to
      }
    });
    return response.data;
  }
);

export const controlPanelSlice = createSlice({
  name: 'controlPanelColis',
  initialState: {
    isLoading: false,
    colis: [],
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
    resetFrom: (state) => {
      state.skip = 0;
      state.livreurs = [];
      state.noMoreQuery = false;
    }
  },

  extraReducers: {
    [getColisStatistics.pending]: (state) => {
      state.isLoading = true;
    },
    [getColisStatistics.fulfilled]: (state, action) => {
      state.colis = [...action.payload?.colis];
      state.totalCount = action.payload?.totalCount;
      state.pendingCount = action.payload?.pendingCount;
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
      state.isLoading = false;
    },
    [getColisStatistics.rejected]: (state) => {
      state.isLoading = false;
    }
  }
});

export const { resetFrom } = controlPanelSlice.actions;

export default controlPanelSlice.reducer;
