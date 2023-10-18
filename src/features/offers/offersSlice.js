import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { REQUEST_QUERY_CONSTANTS } from "../../utils/globalConstantUtil";
import moment from "moment";

// this is just to create a commit

export const getOffers = createAsyncThunk(
  "/offers/get-offers",
  async (params) => {
    const response = await axios.get("/api/sms-providers/get-offers");
    console.log(response.data);
    return response.data;
  },
);

// export const changeSmsProvider = createAsyncThunk(
//   "/sms-providers/change-sms-providers",
//   async (params) => {
//     const operatorId = params.operatorId;
//     const provider = params.provider;
//
//     const payload = JSON.stringify({ provider });
//
//     const response = await axios.post(
//       `/api/sms-providers/change-sms-provider/${operatorId}`,
//       payload,
//     );
//     return response.data;
//   },
// );

export const offersSlice = createSlice({
  name: "offers",
  initialState: {
    isLoading: false,
    offers: [],
    totalCount: 0,
  },
  reducers: {
    resetForm: (state) => {
      state.skip = 0;
      state.totalCount = 0;
      state.offers = [];
      state.noMoreQuery = false;
    },
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

    // [changeSmsProvider.pending]: (state) => {
    //   state.isLoading = true;
    // },
    // [changeSmsProvider.fulfilled]: (state, action) => {
    //   const indexToRemoved = state.providers.findIndex(
    //     (provider) => provider.id === action.payload?.provider?.id,
    //   );
    //
    //   if (indexToRemoved !== -1) {
    //     state.providers[indexToRemoved] = action.payload?.provider;
    //   }
    //   state.isLoading = false;
    // },
    // [changeSmsProvider.rejected]: (state) => {
    //   state.isLoading = false;
    // },
  },
});

export const { resetForm } = offersSlice.actions;

export default offersSlice.reducer;
