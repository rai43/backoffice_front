import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { REQUEST_QUERY_CONSTANTS } from '../../utils/globalConstantUtil';
import moment from 'moment';

export const getArticlesBySearch = createAsyncThunk('/articles/article-search', async (params) => {
  const searchPattern = params.searchPattern || '';

  const response = await axios.get('/api/articles/article-search', {
    params: {
      searchPattern: searchPattern
    }
  });
  return response.data.merchants;
});
export const getDiscounts = createAsyncThunk(
  '/discount-management/get-discounts',
  async (params) => {
    const from = params.from || moment.utc().subtract(7, 'days').format('YYYY-MM-DD');
    const to = params.to || moment.utc().add(1, 'days').format('YYYY-MM-DD');

    const response = await axios.get('/api/discounts/get-discounts', {
      params: {
        from: from,
        to: to
      }
    });
    console.log(response.data);
    return response.data;
  }
);

export const saveDiscounts = createAsyncThunk(
  '/discount-management/save-discount',
  async (params) => {
    const fromDisplay = params.fromDisplay || moment.utc().subtract(7, 'days').toDate();
    const toDisplay = params.toDisplay || moment.utc().toDate();
    const from = params.from;
    const to = params.to;
    const discount_type = params.type;
    const value = params.value;
    const description = params.description;
    const articles = params.articles;

    const payload = JSON.stringify({
      from,
      to,
      fromDisplay,
      toDisplay,
      discount_type,
      value,
      description,
      articles
    });

    const response = await axios.post('/api/discounts/save-dicounts', payload);
    return response.data;
  }
);

export const updateDiscount = createAsyncThunk(
  '/discount-management/update-discount-by-id',
  async (params) => {
    const from = moment.utc(params.from).toDate();
    const to = moment.utc(params.to).toDate();
    const discount_type = params.type;
    const value = params.value;
    const description = params.description;
    const discount = params.discount;

    const payload = JSON.stringify({
      from,
      to,
      discount_type,
      value,
      description
    });

    const response = await axios.post(`/api/discounts/update-dicount/${discount}`, payload);
    return response.data;
  }
);

export const toggleDiscountStatus = createAsyncThunk(
  '/discount-management/toggle-discount-status',
  async (params) => {
    const discountId = params.discountId;

    const response = await axios.patch(`/api/discounts/toggle-discount-status/${discountId}`);

    console.log(response.data);

    return response.data;
  }
);

export const deleteDiscount = createAsyncThunk(
  '/discount-management/delete-discount-by-id',
  async (params) => {
    const discountId = params.discountId;

    const response = await axios.patch(`/api/discounts/delete-discount/${discountId}`);
    return response.data;
  }
);

export const discountManagementSlice = createSlice({
  name: 'livreurs',
  initialState: {
    isLoading: false,
    discounts: [],
    totalCount: 0
  },
  reducers: {
    resetFrom: (state) => {
      state.skip = 0;
      state.livreurs = [];
      state.noMoreQuery = false;
    }
  },

  extraReducers: {
    [getDiscounts.pending]: (state) => {
      state.isLoading = true;
    },
    [getDiscounts.fulfilled]: (state, action) => {
      state.discounts = [...action.payload?.discounts];
      state.isLoading = false;
    },
    [getDiscounts.rejected]: (state) => {
      state.isLoading = false;
    },

    [saveDiscounts.pending]: (state) => {
      state.isLoading = true;
    },
    [saveDiscounts.fulfilled]: (state, action) => {
      state.discounts = [...action.payload?.discounts];
      state.isLoading = false;
    },
    [saveDiscounts.rejected]: (state) => {
      state.isLoading = false;
    },

    [updateDiscount.pending]: (state) => {
      state.isLoading = true;
    },
    [updateDiscount.fulfilled]: (state, action) => {
      const indexToRemoved = state.discounts.findIndex(
        (discount) => discount.id === action.payload?.discount?.id
      );

      if (indexToRemoved !== -1) {
        state.discounts[indexToRemoved] = action.payload?.discount;
      }
      state.isLoading = false;
    },
    [updateDiscount.rejected]: (state) => {
      state.isLoading = false;
    },

    [toggleDiscountStatus.pending]: (state) => {
      state.isLoading = true;
    },
    [toggleDiscountStatus.fulfilled]: (state, action) => {
      const indexToRemoved = state.discounts.findIndex(
        (discount) => discount.id === action.payload?.discount?.id
      );

      if (indexToRemoved !== -1) {
        state.discounts[indexToRemoved] = action.payload?.discount;
      }
      state.isLoading = false;
    },
    [toggleDiscountStatus.rejected]: (state) => {
      state.isLoading = false;
    },

    [deleteDiscount.pending]: (state) => {
      state.isLoading = true;
    },
    [deleteDiscount.fulfilled]: (state, action) => {
      const indexToRemoved = state.discounts.findIndex(
        (discount) => discount.id === action.payload?.discount?.id
      );

      if (indexToRemoved !== -1) {
        state.discounts.splice(indexToRemoved, 1);
      }
      state.isLoading = false;
    },
    [deleteDiscount.rejected]: (state) => {
      state.isLoading = false;
    }
  }
});

export const { resetFrom } = discountManagementSlice.actions;

export default discountManagementSlice.reducer;
