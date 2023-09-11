import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getUserTypesContent = createAsyncThunk(
  "/user-types/content",
  async (params) => {
    const active = params.active;
    const inactive = params.inactive;
    const response = await axios.get(
      `/api/user-type/get-user-type/${active}/${inactive}`,
    );
    return response.data;
  },
);

export const userTypeSlice = createSlice({
  name: "userTypes",
  initialState: {
    isLoading: false,
    userTypes: [],
  },
  reducers: {
    resetFrom: (state) => {
      state.from = 0;
      state.users = [];
    },
  },

  extraReducers: {
    [getUserTypesContent.pending]: (state) => {
      state.isLoading = true;
    },
    [getUserTypesContent.fulfilled]: (state, action) => {
      state.userTypes = action.payload.userTypes;
      state.isLoading = false;
    },
    [getUserTypesContent().rejected]: (state) => {
      state.isLoading = false;
    },
  },
});

export const { resetFrom } = userTypeSlice.actions;

export default userTypeSlice.reducer;
