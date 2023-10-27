import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { REQUEST_QUERY_CONSTANTS } from "../../utils/globalConstantUtil";
import moment from "moment";

// this is just to create a commit

export const getInvitations = createAsyncThunk(
  "/invitations/get-invitations",
  async (params) => {
    const response = await axios.get("/api/invitations/get-invitations");
    console.log(response.data);
    return response.data;
  },
);

// export const saveInvitations = createAsyncThunk(
//   "/offers/save-offer",
//   async (params) => {
//     console.log(params);
//     const name = params.name;
//     const description = params.description;
//     const offer_type = params.offer_type;
//     const subscription_type = params.subscription_type;
//     const amount = params.amount;
//     const max_quantity = params.max_quantity;
//     const subscriber_limit = params.subscriber_limit;
//
//     const payload = JSON.stringify({
//       name,
//       description,
//       offer_type,
//       subscription_type,
//       amount,
//       max_quantity,
//       subscriber_limit,
//     });
//
//     const response = await axios.post("/api/offers/save-offer", payload);
//     return response.data;
//   },
// );

// export const deleteOffer = createAsyncThunk(
//   "/offers/delete-offer-by-id",
//   async (params) => {
//     const offerId = params.offerId;
//
//     const response = await axios.patch(`/api/offers/delete-offer/${offerId}`);
//     return response.data;
//   },
// );

export const invitationSlice = createSlice({
  name: "invitations",
  initialState: {
    isLoading: false,
    invitations: [],
    totalCount: 0,
    skip: 0,
    noMoreQuery: false,
  },
  reducers: {
    resetForm: (state) => {
      state.skip = 0;
      state.totalCount = 0;
      state.invitations = [];
      state.noMoreQuery = false;
      state.isLoading = false;
    },
  },

  extraReducers: {
    [getInvitations.pending]: (state) => {
      state.isLoading = true;
    },
    [getInvitations.fulfilled]: (state, action) => {
      state.invitations = [...state.invitations, ...action.payload.invitations];
      if (state.totalCount !== action?.payload?.totalCount) {
        state.totalCount = action?.payload?.totalCount;
      }

      state.isLoading = false;
    },
    [getInvitations.rejected]: (state) => {
      state.isLoading = false;
    },

    // [saveOffer.pending]: (state) => {
    //   state.isLoading = true;
    // },
    // [saveOffer.fulfilled]: (state, action) => {
    //   console.log("saveOffer.fulfilled", action.payload);
    //   state.offers = [action.payload?.offer, ...state.offers];
    // },
    // [saveOffer.rejected]: (state) => {
    //   state.isLoading = false;
    // },
    //
    // [deleteOffer.pending]: (state) => {
    //   state.isLoading = true;
    // },
    // [deleteOffer.fulfilled]: (state, action) => {
    //   const indexToRemoved = state.offers.findIndex(
    //     (offer) => offer.id === action.payload?.offer?.id,
    //   );
    //
    //   if (indexToRemoved !== -1) {
    //     state.offers.splice(indexToRemoved, 1);
    //   }
    //   state.isLoading = false;
    // },
    // [deleteOffer.rejected]: (state) => {
    //   state.isLoading = false;
    // },
  },
});

export const { resetForm } = invitationSlice.actions;

export default invitationSlice.reducer;
