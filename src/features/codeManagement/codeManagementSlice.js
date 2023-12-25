import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import moment from 'moment';

export const getCodes = createAsyncThunk('/code-management/get-codes', async () => {
  const response = await axios.get('/api/discounts/get-codes');
  console.log(response.data);
  return response.data;
});

export const saveCode = createAsyncThunk('/discount-management/save-code', async (params) => {
  const from = params.from;
  const to = params.to;
  const description = params.description;
  const discount_type = params.discount_type;
  const discount = params.discount;
  const min_amount = params.min_amount;
  const active = params.active;
  const one_time_code = params.one_time_code;

  const payload = JSON.stringify({
    from,
    to,
    discount_type,
    discount,
    min_amount,
    description,
    active,
    one_time_code
  });

  const response = await axios.post('/api/discounts/save-code', payload);
  return response.data;
});

export const updateCode = createAsyncThunk(
  '/discount-management/update-code-by-id',
  async (params) => {
    const from = params.from;
    const to = params.to;
    const description = params.description;
    const discount_type = params.discount_type;
    const discount = params.discount;
    const min_amount = params.min_amount;
    const active = params.active;
    const one_time_code = params.one_time_code;
    const code_id = params.code_id;

    const payload = JSON.stringify({
      from,
      to,
      discount_type,
      discount,
      min_amount,
      description,
      active,
      one_time_code
    });

    const response = await axios.post(`/api/discounts/update-code/${code_id}`, payload);
    return response.data;
  }
);

export const toggleCodeStatus = createAsyncThunk(
  '/discount-management/toggle-code-status',
  async (params) => {
    const code_id = params.code_id;

    const response = await axios.patch(`/api/discounts/toggle-code-status/${code_id}`);
    return response.data;
  }
);

export const deleteCode = createAsyncThunk(
  '/discount-management/delete-discount-by-id',
  async (params) => {
    const code_id = params.code_id;

    const response = await axios.patch(`/api/discounts/delete-code/${code_id}`);
    return response.data;
  }
);

export const codeManagementSlice = createSlice({
  name: 'codes',
  initialState: {
    isLoading: false,
    noMoreQuery: false,
    codes: [],
    skip: 0,
    totalCount: 0
  },
  reducers: {
    resetFrom: (state) => {
      state.skip = 0;
      state.totalCount = 0;
      state.codes = [];
      state.isLoading = false;
      state.noMoreQuery = false;
    }
  },

  extraReducers: {
    [getCodes.pending]: (state) => {
      state.isLoading = true;
    },
    [getCodes.fulfilled]: (state, action) => {
      state.codes = [...action.payload?.codes];
      state.isLoading = false;
      state.totalCount = action.payload?.totalCount;
    },
    [getCodes.rejected]: (state) => {
      state.isLoading = false;
    },

    [saveCode.pending]: (state) => {
      state.isLoading = true;
    },
    [saveCode.fulfilled]: (state, action) => {
      state.codes = [action.payload?.code, ...state?.codes];
      state.isLoading = false;
    },
    [saveCode.rejected]: (state) => {
      state.isLoading = false;
    },

    [updateCode.pending]: (state) => {
      state.isLoading = true;
    },
    [updateCode.fulfilled]: (state, action) => {
      const indexToRemoved = state.codes.findIndex(
        (discount) => discount.id === action.payload?.code?.id
      );

      if (indexToRemoved !== -1) {
        if (action?.payload?.code?.id) {
          state.codes[indexToRemoved] = action.payload?.code;
        } else {
          state.codes.splice(indexToRemoved, 1);
        }
      }

      state.isLoading = false;
    },
    [updateCode.rejected]: (state) => {
      state.isLoading = false;
    },

    [toggleCodeStatus.pending]: (state) => {
      state.isLoading = true;
    },
    [toggleCodeStatus.fulfilled]: (state, action) => {
      const indexToRemoved = state.codes.findIndex((code) => code.id === action.payload?.code?.id);

      if (indexToRemoved !== -1) {
        state.codes.splice(indexToRemoved, 1);
      }
      state.isLoading = false;
    },
    [toggleCodeStatus.rejected]: (state) => {
      state.isLoading = false;
    },

    [deleteCode.pending]: (state) => {
      state.isLoading = true;
    },
    [deleteCode.fulfilled]: (state, action) => {
      const indexToRemoved = state.codes.findIndex((code) => code.id === action.payload?.code?.id);

      if (indexToRemoved !== -1) {
        state.codes.splice(indexToRemoved, 1);
      }
      state.isLoading = false;
    },
    [deleteCode.rejected]: (state) => {
      state.isLoading = false;
    }
  }
});

export const { resetFrom } = codeManagementSlice.actions;

export default codeManagementSlice.reducer;
