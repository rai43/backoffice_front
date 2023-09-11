import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { REQUEST_QUERY_CONSTANTS } from '../../utils/globalConstantUtil';

export const getLivreursContent = createAsyncThunk('/livreurs/content', async (params) => {
	const skip = params.skip;
	const active = params.active;
	const deleted = params.deleted;
	const direction = params.direction || 'DESC';
	const limit = params.limit || 1000;
	const searchPattern = params.searchPattern || '';

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
	const response = await axios.get(`/api/delivery/get-livreurs`, {
		params: {
			status: status,
			searchPattern: searchPattern,
			direction: direction,
			skip: skip,
			limit: limit,
		},
	});

	console.log(response.data);
	return response.data;
});

export const getLivreursBySearch = createAsyncThunk('/livreurs/livreur-search', async (params) => {
	const searchPattern = params.searchPattern || '';

	const response = await axios.get('/api/delivery/get-livreurs-by-search', {
		params: {
			searchPattern: searchPattern,
		},
	});

	console.log(response.data);
	return response.data;
});

// export const switchLivreurAccountStatusToServer = createAsyncThunk('/livreurs/switch-account-status', async (clientId) => {
// 	try {
// 		const response = await axios.patch(`/api/client/switch-client-account-status/${clientId}`);
// 		return response.data;
// 	} catch (e) {
// 		throw new Error(e.statusText);
// 	}
// });

export const livreurSlice = createSlice({
	name: 'livreurs',
	initialState: {
		isLoading: false,
		livreurs: [],
		searchedLivreurs: [],
		skip: 0,
		noMoreQuery: false,
		totalCount: 0,
	},
	reducers: {
		resetFrom: (state) => {
			state.skip = 0;
			state.livreurs = [];
			state.noMoreQuery = false;
		},
	},

	extraReducers: {
		[getLivreursContent.pending]: (state) => {
			state.isLoading = true;
		},
		[getLivreursContent.fulfilled]: (state, action) => {
			// Append the newly fetched users to the list
			state.livreurs = [...state.livreurs, ...action.payload.livreurs];
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
		[getLivreursContent.rejected]: (state) => {
			state.isLoading = false;
		},

		[getLivreursBySearch.pending]: (state) => {
			state.isLoading = true;
		},
		[getLivreursBySearch.fulfilled]: (state, action) => {
			state.searchedLivreurs = [...(action.payload.livreurs || [])];
			state.isLoading = false;
		},
		[getLivreursBySearch.rejected]: (state) => {
			state.isLoading = false;
		},
		// ========= ooooo =========

		// Actions for switch client account status
		// (patch request as it consists of setting the is_deleted field to true in the db)
		// [switchClientAccountStatusToServer.pending]: (state) => {
		// 	state.isLoading = true;
		// },
		// [switchClientAccountStatusToServer.fulfilled]: (state, action) => {
		// 	const indexToRemoved = state.livreurs.findIndex((client) => client.id === action.payload?.client?.id);

		// 	// If the object is found, replace it with the new object
		// 	if (indexToRemoved !== -1) {
		// 		state.livreurs.splice(indexToRemoved, 1);
		// 	}
		// 	state.isLoading = false;
		// },
		// [switchClientAccountStatusToServer.rejected]: (state) => {
		// 	state.isLoading = false;
		// },
		// ========= ooooo =========
	},
});

export const { resetFrom } = livreurSlice.actions;

export default livreurSlice.reducer;
