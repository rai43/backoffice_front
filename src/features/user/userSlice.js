import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const getUsersContent = createAsyncThunk('/users/content', async (params) => {
  const from = params.from;
  const active = params.active;
  const inactive = params.inactive;
  const limit = params.limit || 10;
  const searchPattern = params.searchPattern || 'undefined';
  const response = await axios.get(
    `/api/user/get-users/${active}/${inactive}/${from}/${limit}/${searchPattern}`
  );

  return response.data;
});

export const saveUserToServer = createAsyncThunk('/users/save', async (newUserStringifyObj) => {
  try {
    const response = await axios.post('/api/user/authenticate/save-user', newUserStringifyObj);
    return response.data;
  } catch (e) {
    throw new Error(e.statusText);
  }
});

export const updateUserToServer = createAsyncThunk('/users/update', async (params) => {
  const userId = params.userId;
  const updatedUserStringifyObj = params.updatedUserStringifyObj;

  try {
    const response = await axios.patch(`/api/user/update-user/${userId}`, updatedUserStringifyObj);
    return response.data;
  } catch (e) {
    throw new Error(e.statusText);
  }
});
export const deleteUserToServer = createAsyncThunk('/users/delete', async (userId) => {
  try {
    const response = await axios.patch(`/api/user/delete-user/${userId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.statusText);
  }
});

export const userSlice = createSlice({
  name: 'users',
  initialState: {
    isLoading: false,
    users: [],
    from: 0,
    noMoreQuery: false
  },
  reducers: {
    resetFrom: (state) => {
      state.from = 0;
      state.users = [];
      state.noMoreQuery = false;
    }
  },

  extraReducers: {
    // Actions to get the users - (get request)
    [getUsersContent.pending]: (state) => {
      state.isLoading = true;
    },
    [getUsersContent.fulfilled]: (state, action) => {
      state.users = [...state.users, ...action.payload.users];

      if (state.from === action.payload.lastId) {
        state.noMoreQuery = true;
      } else {
        state.from = action.payload.lastId;
      }
      state.isLoading = false;
    },
    [getUsersContent.rejected]: (state) => {
      state.isLoading = false;
    },
    // ========= ooooo =========

    // Actions for save - (post request)
    [saveUserToServer.pending]: (state) => {
      state.isLoading = true;
    },
    [saveUserToServer.fulfilled]: (state, action) => {
      // !!! Could later decide to append the user to the list (starting or ending)
      // state.products = [...state.users, action.payload.user];
      state.isLoading = false;
    },
    [saveUserToServer.rejected]: (state, action) => {
      state.isLoading = false;
    },
    // ========= ooooo =========

    // Actions for update - (patch request)
    [updateUserToServer.pending]: (state) => {
      state.isLoading = true;
    },
    [updateUserToServer.fulfilled]: (state, action) => {
      const indexToReplace = state.users.findIndex((obj) => obj.id === action.payload.user.id);

      // If the object is found, replace it with the new object
      if (indexToReplace !== -1) {
        state.users[indexToReplace] = action.payload.user;
      }
      state.isLoading = false;
    },
    [updateUserToServer.rejected]: (state) => {
      state.isLoading = false;
    },
    // ========= ooooo =========

    // Actions for delete - (patch request as it consists of setting the is_deleted field to true in the db)
    [deleteUserToServer.pending]: (state) => {
      state.isLoading = true;
    },
    [deleteUserToServer.fulfilled]: (state, action) => {
      const indexToRemoved = state.users.findIndex((obj) => obj.id === action.payload.user.id);

      // If the object is found, replace it with the new object
      if (indexToRemoved !== -1) {
        state.users.splice(indexToRemoved, 1);
      }
      state.isLoading = false;
    },
    [deleteUserToServer.rejected]: (state) => {
      state.isLoading = false;
    }
    // ========= ooooo =========
  }
});

export const { resetFrom } = userSlice.actions;

export default userSlice.reducer;
