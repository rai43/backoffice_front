import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { REQUEST_QUERY_CONSTANTS } from '../../utils/globalConstantUtil';
import moment from 'moment';

export const getSmsProviders = createAsyncThunk('/sms-providers/get-providers', async (params) => {
	const response = await axios.get('/api/sms-providers/get-sms-providers');
	console.log(response.data);
	return response.data;
});

export const changeSmsProvider = createAsyncThunk('/sms-providers/change-sms-providers', async (params) => {
	const operatorId = params.operatorId;
	const provider = params.provider;

	const payload = JSON.stringify({ provider });

	const response = await axios.post(`/api/sms-providers/change-sms-provider/${operatorId}`, payload);
	return response.data;
});

export const smsPorviderSlide = createSlice({
	name: 'providers',
	initialState: {
		isLoading: false,
		providers: [],
		totalCount: 0,
	},
	reducers: {
		resetFrom: (state) => {
			state.skip = 0;
			state.providers = [];
			state.noMoreQuery = false;
		},
	},

	extraReducers: {
		[getSmsProviders.pending]: (state) => {
			state.isLoading = true;
		},
		[getSmsProviders.fulfilled]: (state, action) => {
			state.providers = [...action.payload?.providers];
			state.isLoading = false;
		},
		[getSmsProviders.rejected]: (state) => {
			state.isLoading = false;
		},

		[changeSmsProvider.pending]: (state) => {
			state.isLoading = true;
		},
		[changeSmsProvider.fulfilled]: (state, action) => {
			const indexToRemoved = state.providers.findIndex((provider) => provider.id === action.payload?.provider?.id);

			if (indexToRemoved !== -1) {
				state.providers[indexToRemoved] = action.payload?.provider;
			}
			state.isLoading = false;
		},
		[changeSmsProvider.rejected]: (state) => {
			state.isLoading = false;
		},
	},
});

export const { resetFrom } = smsPorviderSlide.actions;

export default smsPorviderSlide.reducer;
