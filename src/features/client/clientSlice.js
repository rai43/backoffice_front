import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { REQUEST_QUERY_CONSTANTS } from '../../utils/globalConstantUtil';

export const getClientsContent = createAsyncThunk('/clients/content', async (params) => {
  const skip = params.skip;
  const active = params.active;
  const deleted = params.deleted;
  const personal = params.personal;
  const merchant = params.merchant;
  const direction = params.direction || 'DESC';
  const limit = params.limit || 1000;
  const searchPattern = params.searchPattern || '';
  const phoneNumber = params.phoneNumber || '';
  const merchantId = parseInt(params.merchantId) || 0;
  const merchantName = params.merchantName || '';

  const accountType =
    personal && merchant
      ? REQUEST_QUERY_CONSTANTS.ALL
      : personal && !merchant
      ? REQUEST_QUERY_CONSTANTS.CLIENT_SLICE.ACCOUNT_TYPES.PERSONAL_ACCOUNT
      : !personal && merchant
      ? REQUEST_QUERY_CONSTANTS.CLIENT_SLICE.ACCOUNT_TYPES.MERCHANT_ACCOUNT
      : REQUEST_QUERY_CONSTANTS.NOTHING;

  const status =
    active && deleted
      ? REQUEST_QUERY_CONSTANTS.ALL
      : active && !deleted
      ? REQUEST_QUERY_CONSTANTS.STATUS_ACTIVE.IS_ACTIVE
      : !active && deleted
      ? REQUEST_QUERY_CONSTANTS.STATUS_DELETED.IS_DELETED
      : REQUEST_QUERY_CONSTANTS.NOTHING;

  // const isDeleted = REQUEST_QUERY_CONSTANTS.STATUS_DELETED.IS_NOT_DELETED;
  // :account-type/:is-active/:is-deleted/:from/:limit/:searchPattern
  const response = await axios.get(`/api/client/get-clients`, {
    params: {
      accountType: accountType,
      status: status,
      searchPattern: searchPattern,
      direction: direction,
      phoneNumber,
      merchantId,
      merchantName,
      skip: skip,
      limit: limit
    }
  });

  console.log(response.data);
  return response.data;
});

export const switchClientAccountStatusToServer = createAsyncThunk(
  '/clients/switch-account-status',
  async (clientId) => {
    try {
      const response = await axios.patch(`/api/client/switch-client-account-status/${clientId}`);
      return response.data;
    } catch (e) {
      throw new Error(e.statusText);
    }
  }
);

export const blockClientPaymentMethod = createAsyncThunk(
  '/clients/block-client-payment-method',
  async (payload) => {
    const { clientId, methodString, action } = payload;
    try {
      const response = await axios.patch(
        `/api/client/block-client-payment-method/${clientId}/${methodString}/${action}`
      );
      return response.data;
    } catch (e) {
      throw new Error(e.statusText);
    }
  }
);

export const createPersonalClientAccount = createAsyncThunk(
  '/clients/create-account-personal',
  async (payload) => {
    try {
      // :personal or :merchant or :livreur
      const response = await axios.post(`/api/client/create-client-account/personal`, payload);
      console.log(response);
      return response.data;
    } catch (e) {
      throw new Error(e.statusText);
    }
  }
);

export const modifyPersonalClientAccount = createAsyncThunk(
  '/clients/modify-account-personal',
  async (payload) => {
    try {
      const clientId = payload.clientId;
      const merchantId = payload.merchantId || 'null';
      delete payload.clientId;
      delete payload.merchantId;

      // :personal or :merchant or :livreur
      const response = await axios.post(
        `/api/client/modify-client-account/personal/${clientId}/${merchantId}`,
        payload
      );
      console.log(response);
      return response.data;
    } catch (e) {
      throw new Error(e.statusText);
    }
  }
);

export const createMerchantClientAccount = createAsyncThunk(
  '/clients/create-account-merchant',
  async (payload) => {
    try {
      const formData = new FormData();
      console.log(payload.registration);
      formData.append('profile_picture', payload.registration.profile_picture);
      formData.append('registration', JSON.stringify(payload.registration));
      formData.append('locations', JSON.stringify(payload.locations));
      formData.append('workDays', JSON.stringify(payload.workDays));
      console.log(formData);

      // :personal or :merchant or :livreur
      const response = await axios.post(`/api/client/create-client-account/merchant`, formData, {
        headers: {
          'Content-type': 'multipart/form-data'
        }
      });
      console.log(response);
      return response.data;
    } catch (e) {
      throw new Error(e.statusText);
    }
  }
);

export const modifyMerchantClientAccount = createAsyncThunk(
  '/clients/modify-account-merchant',
  async (payload) => {
    try {
      console.log(payload.registration);
      console.log('payload.registration.profile_picture', payload.registration.profile_picture);
      console.log(
        'payload.registration.profile_picture 2',
        payload?.registration?.profile_picture?.size
      );
      const clientId = payload.clientId;
      const merchantId = payload.merchantId || 'null';
      let response;
      if (
        !payload?.registration?.profile_picture?.size &&
        payload?.registration?.profile_picture?.includes('https://res.cloudinary.com/')
      ) {
        const postPayload = JSON.stringify({
          registration: payload.registration,
          locations: payload.locations,
          workDays: payload.workDays
        });

        response = await axios.post(
          `/api/client/modify-client-account-img-cloud/merchant/${clientId}/${merchantId}`,
          postPayload
        );
      } else {
        console.log('in 2');
        const formData = new FormData();
        formData.append('profile_picture', payload.registration.profile_picture);
        formData.append('registration', JSON.stringify(payload.registration));
        formData.append('locations', JSON.stringify(payload.locations));
        formData.append('workDays', JSON.stringify(payload.workDays));
        console.log(formData);

        // :personal or :merchant or :livreur
        response = await axios.post(
          `/api/client/modify-client-account/merchant/${clientId}/${merchantId}`,
          formData,
          {
            headers: {
              'Content-type': 'multipart/form-data'
            }
          }
        );
      }

      console.log(response);
      return response.data;
    } catch (e) {
      throw new Error(e.statusText);
    }
  }
);

export const turnClientIntoMerchantAccount = createAsyncThunk(
  '/clients/turn-client-into-merchant',
  async (payload) => {
    try {
      const clientId = payload.clientId;

      const formData = new FormData();
      formData.append('profile_picture', payload.registration.profile_picture);
      formData.append('registration', JSON.stringify(payload.registration));
      formData.append('locations', JSON.stringify(payload.locations));
      formData.append('workDays', JSON.stringify(payload.workDays));

      delete payload.clientId;
      // :personal or :merchant or :livreur
      const response = await axios.post(
        `/api/client/turn-client-into-merchant/${clientId}`,
        formData,
        {
          headers: {
            'Content-type': 'multipart/form-data'
          }
        }
      );
      console.log(response);
      return response.data;
    } catch (e) {
      throw new Error(e.statusText);
    }
  }
);

export const updateMerchantSchedule = createAsyncThunk(
  '/clients/update-merchant-schedule',
  async (payload) => {
    try {
      const merchantId = payload.merchantId;

      const response = await axios.post(
        `/api/client/update-merchant-schedule/${merchantId}`,
        JSON.stringify({ workDays: payload.workDays })
      );
      console.log(response);
      return response.data;
    } catch (e) {
      throw new Error(e.statusText);
    }
  }
);

export const clientSlice = createSlice({
  name: 'clients',
  initialState: {
    isLoading: false,
    clients: [],
    skip: 0,
    noMoreQuery: false,
    totalCount: 0
  },
  reducers: {
    resetFrom: (state) => {
      state.skip = 0;
      state.clients = [];
      state.noMoreQuery = false;
    },

    replaceClientObjectByUpdatedOne: (state, action) => {
      const indexToRemoved = state.clients.findIndex(
        (client) => client.id === action.payload?.client?.id
      );

      // If the object is found, replace it with the new object
      if (indexToRemoved !== -1) {
        state.clients[indexToRemoved] = action.payload.client;
      }
      state.isLoading = false;
    }
  },

  extraReducers: {
    // Actions to get the clients - (get request)
    [getClientsContent.pending]: (state) => {
      state.isLoading = true;
    },
    [getClientsContent.fulfilled]: (state, action) => {
      // Append the newly fetched users to the list
      state.clients = [...state.clients, ...action.payload.clients];
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
    [getClientsContent.rejected]: (state) => {
      state.isLoading = false;
    },
    // ========= ooooo =========

    // Actions for switch client account status
    // (patch request as it consists of setting the is_deleted field to true in the db)
    [switchClientAccountStatusToServer.pending]: (state) => {
      state.isLoading = true;
    },
    [switchClientAccountStatusToServer.fulfilled]: (state, action) => {
      const indexToRemoved = state.clients.findIndex(
        (client) => client.id === action.payload?.client?.id
      );

      // If the object is found, replace it with the new object
      if (indexToRemoved !== -1) {
        state.clients.splice(indexToRemoved, 1);
      }
      state.isLoading = false;
    },
    [switchClientAccountStatusToServer.rejected]: (state) => {
      state.isLoading = false;
    },

    [createPersonalClientAccount.pending]: (state) => {
      state.isLoading = true;
    },
    [createPersonalClientAccount.fulfilled]: (state, action) => {
      state.clients = [action.payload.client, ...state.clients];
      state.totalCount += 1;
      state.isLoading = false;
    },
    [createPersonalClientAccount.rejected]: (state) => {
      state.isLoading = false;
    },

    [modifyPersonalClientAccount.pending]: (state) => {
      state.isLoading = true;
    },
    [modifyPersonalClientAccount.fulfilled]: (state, action) => {
      const indexToRemoved = state.clients.findIndex(
        (client) => client.id === action.payload?.client?.id
      );

      // If the object is found, replace it with the new object
      if (indexToRemoved !== -1) {
        state.clients[indexToRemoved] = action.payload.client;
      }
      state.isLoading = false;
    },
    [modifyPersonalClientAccount.rejected]: (state) => {
      state.isLoading = false;
    },

    [blockClientPaymentMethod.pending]: (state) => {
      state.isLoading = true;
    },
    [blockClientPaymentMethod.fulfilled]: (state, action) => {
      const indexToRemoved = state.clients.findIndex(
        (client) => client.id === action.payload?.client?.id
      );

      // If the object is found, replace it with the new object
      if (indexToRemoved !== -1) {
        state.clients[indexToRemoved] = action.payload.client;
      }
      state.isLoading = false;
    },
    [blockClientPaymentMethod.rejected]: (state) => {
      state.isLoading = false;
    },

    [modifyMerchantClientAccount.pending]: (state) => {
      state.isLoading = true;
    },
    [modifyMerchantClientAccount.fulfilled]: (state, action) => {
      const indexToRemoved = state.clients.findIndex(
        (client) => client.id === action.payload?.client?.id
      );

      // If the object is found, replace it with the new object
      if (indexToRemoved !== -1) {
        state.clients[indexToRemoved] = action.payload.client;
      }
      state.isLoading = false;
    },
    [modifyMerchantClientAccount.rejected]: (state) => {
      state.isLoading = false;
    },

    [turnClientIntoMerchantAccount.pending]: (state) => {
      state.isLoading = true;
    },
    [turnClientIntoMerchantAccount.fulfilled]: (state, action) => {
      const indexToRemoved = state.clients.findIndex(
        (client) => client.id === action.payload?.client?.id
      );

      // If the object is found, replace it with the new object
      if (indexToRemoved !== -1) {
        state.clients[indexToRemoved] = action.payload.client;
      }
      state.isLoading = false;
    },
    [turnClientIntoMerchantAccount.rejected]: (state) => {
      state.isLoading = false;
    },

    [updateMerchantSchedule.pending]: (state) => {
      state.isLoading = true;
    },
    [updateMerchantSchedule.fulfilled]: (state, action) => {
      const indexToRemoved = state.clients.findIndex(
        (client) => client.id === action.payload?.client?.id
      );

      // If the object is found, replace it with the new object
      if (indexToRemoved !== -1) {
        state.clients[indexToRemoved] = action.payload.client;
      }
      state.isLoading = false;
    },
    [updateMerchantSchedule.rejected]: (state) => {
      state.isLoading = false;
    },

    [createMerchantClientAccount.pending]: (state) => {
      state.isLoading = true;
    },
    [createMerchantClientAccount.fulfilled]: (state, action) => {
      state.clients = [action.payload.client, ...state.clients];
      state.totalCount += 1;
      state.isLoading = false;
    },
    [createMerchantClientAccount.rejected]: (state) => {
      state.isLoading = false;
    }
    // ========= ooooo =========
  }
});

export const { resetFrom, replaceClientObjectByUpdatedOne } = clientSlice.actions;

export default clientSlice.reducer;
