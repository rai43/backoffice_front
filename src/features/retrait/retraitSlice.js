import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const getClientRetraits = createAsyncThunk('/retraits/user', async (params) => {
	const wallet = params.wallet;
	const from = params.from;
	const to = params.to;
	const skip = params.skip;

	const response = await axios.get(`/api/retrait/get-retraits/${wallet}`, {
		params: {
			to,
			from,
			skip,
		},
	});

	console.log(response.data);
	return response.data;
});

export const retraitSlice = createSlice({
	name: 'retraits',
	initialState: {
		isLoading: false,
		retraits: [],
		skip: 0,
		noMoreQuery: false,
		totalCount: 0,
	},

	reducers: {
		resetForm: (state) => {
			state.from = 0;
			state.retraits = [];
			state.noMoreQuery = false;
		},
	},

	extraReducers: {
		[getClientRetraits.pending]: (state) => {
			state.isLoading = true;
		},
		[getClientRetraits.fulfilled]: (state, action) => {
			state.retraits = [...state.retraits, ...action.payload.retraits];
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
		[getClientRetraits.rejected]: (state) => {
			state.isLoading = false;
		},
		// ========= ooooo =========
	},
});

export const { resetForm } = retraitSlice.actions;

export default retraitSlice.reducer;
