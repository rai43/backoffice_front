import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { REQUEST_QUERY_CONSTANTS } from '../../utils/globalConstantUtil';
import moment from 'moment';

// this is just to create a commit

export const getOffers = createAsyncThunk('/offers/get-offers', async (params) => {
  const response = await axios.get('/api/offers/get-offers');
  console.log(response.data);
  return response.data;
});

export const saveOffer = createAsyncThunk('/offers/save-offer', async (params) => {
  console.log(params);
  const name = params.name;
  const description = params.description;
  const offer_type = params.offer_type;
  const subscription_type = params.subscription_type;
  const amount = params.amount;
  const max_quantity = params.max_quantity;
  const subscriber_limit = params.subscriber_limit;

  const payload = JSON.stringify({
    name,
    description,
    offer_type,
    subscription_type,
    amount,
    max_quantity,
    subscriber_limit
  });

  const response = await axios.post('/api/offers/save-offer', payload);
  return response.data;
});

export const deleteOffer = createAsyncThunk('/offers/delete-offer-by-id', async (params) => {
  const offerId = params.offerId;

  const response = await axios.patch(`/api/offers/delete-offer/${offerId}`);
  return response.data;
});

export const offersSlice = createSlice({
  name: 'offers',
  initialState: {
    isLoading: false,
    offers: [],
    totalCount: 0
  },
  reducers: {
    resetForm: (state) => {
      state.skip = 0;
      state.totalCount = 0;
      state.offers = [];
      state.noMoreQuery = false;
    }
  },

  extraReducers: {
    [getOffers.pending]: (state) => {
      state.isLoading = true;
    },
    [getOffers.fulfilled]: (state, action) => {
      state.offers = [...action.payload?.offers];
      state.totalCount = action.payload?.totalCount;
      state.isLoading = false;
    },
    [getOffers.rejected]: (state) => {
      state.isLoading = false;
    },

    [saveOffer.pending]: (state) => {
      state.isLoading = true;
    },
    [saveOffer.fulfilled]: (state, action) => {
      console.log('saveOffer.fulfilled', action.payload);
      state.offers = [action.payload?.offer, ...state.offers];
    },
    [saveOffer.rejected]: (state) => {
      state.isLoading = false;
    },

    [deleteOffer.pending]: (state) => {
      state.isLoading = true;
    },
    [deleteOffer.fulfilled]: (state, action) => {
      const indexToRemoved = state.offers.findIndex(
        (offer) => offer.id === action.payload?.offer?.id
      );

      if (indexToRemoved !== -1) {
        state.offers.splice(indexToRemoved, 1);
      }
      state.isLoading = false;
    },
    [deleteOffer.rejected]: (state) => {
      state.isLoading = false;
    }

    // [saveOffer.pending]: (state) => {
    //   state.isLoading = true;
    // },
    // [saveOffer.fulfilled]: (state, action) => {
    //   const indexToRemoved = state.providers.findIndex(
    //     (provider) => provider.id === action.payload?.provider?.id,
    //   );
    //
    //   if (indexToRemoved !== -1) {
    //     state.providers[indexToRemoved] = action.payload?.provider;
    //   }
    //   state.isLoading = false;
    // },
    // [saveOffer.rejected]: (state) => {
    //   state.isLoading = false;
    // },
  }
});

export const { resetForm } = offersSlice.actions;

export default offersSlice.reducer;
