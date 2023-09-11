import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const getClientRechargements = createAsyncThunk('/rechargements/user', async (params) => {
	const wallet = params.wallet;
	const transactionType = params.transactionType;
	const from = params.from;
	const to = params.to;
	const skip = params.skip;

	const response = await axios.get(`/api/rechargement/get-rechargements/${wallet}`, {
		params: {
			transactionType,
			to,
			from,
			skip,
		},
	});

	console.log(response.data);
	return response.data;
});

export const rechargementSlice = createSlice({
	name: 'rechargements',
	initialState: {
		isLoading: false,
		rechargements: [],
		skip: 0,
		noMoreQuery: false,
		totalCount: 0,
	},

	reducers: {
		resetForm: (state) => {
			state.from = 0;
			state.rechargements = [];
			state.noMoreQuery = false;
		},
	},

	extraReducers: {
		// Actions to get the users - (get request)
		[getClientRechargements.pending]: (state) => {
			state.isLoading = true;
		},
		[getClientRechargements.fulfilled]: (state, action) => {
			state.rechargements = [...state.rechargements, ...action.payload.rechargements];
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
		[getClientRechargements.rejected]: (state) => {
			state.isLoading = false;
		},
		// ========= ooooo =========
	},
});

export const { resetForm } = rechargementSlice.actions;

export default rechargementSlice.reducer;
