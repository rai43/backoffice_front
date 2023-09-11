import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { REQUEST_QUERY_CONSTANTS } from '../../utils/globalConstantUtil';

export const getMerchantsContent = createAsyncThunk('/merchants/content', async (params) => {
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

	const response = await axios.get(`/api/merchants-ordering/get-merchants`, {
		params: {
			status: status,
			searchPattern: searchPattern,
			direction: direction,
			skip: skip,
			limit: limit,
		},
	});
	// const response = await axios.get(`/api/merchants-ordering/get-merchants`, {
	// 	params: {
	// 		status: status,
	// 		searchPattern: searchPattern,
	// 		direction: direction,
	// 		skip: skip,
	// 		limit: limit,
	// 	},
	// });

	console.log('getMerchantsContent');
	console.log(response);
	return response.data;
});

export const saveMerchantsAccompagnement = createAsyncThunk('/merchants/save-accompagnement', async (params) => {
	const name = params.name;
	const merchant_id = params.merchant_id;

	const payload = JSON.stringify({ name, merchant_id });
	const response = await axios.post(`/api/accompagnements/save-accompagnement`, payload);

	console.log(response);
	return response.data;
});

export const editMerchantsAccompagnement = createAsyncThunk('/merchants/edit-accompagnement', async (params) => {
	const name = params.name;
	const id = params.id;

	const payload = JSON.stringify({ name, action: 'edit' });
	console.log('id', id);
	console.log(payload);
	const response = await axios.post(`/api/accompagnements/edit-accompagnement/${id}`, payload);

	console.log(response);
	return response.data;
});

export const deleteMerchantsAccompagnement = createAsyncThunk('/merchants/delete-accompagnement', async (params) => {
	const name = params.name;
	const id = params.id;

	const payload = JSON.stringify({ name, action: 'delete' });
	const response = await axios.post(`/api/accompagnements/edit-accompagnement/${id}`, payload);

	console.log(response);
	return response.data;
});

export const saveMerchantsArticle = createAsyncThunk('/merchants/save-article', async (params) => {
	try {
		const formData = new FormData();
		console.log(params);
		formData.append('title', JSON.stringify(params.title.trim()));
		formData.append('price', JSON.stringify(parseInt(params.price)));
		formData.append('description', JSON.stringify(params.description.trim()));
		formData.append('image', params.image);
		formData.append('merchant_id', JSON.stringify(params.merchant_id));

		console.log('11');
		const accompagnements = Object.keys(params?.accs).map((accKey) => {
			if (params?.accs[accKey]) return accKey;
		});
		const supplements = Object.keys(params?.supps).map((suppKey) => {
			const dataObj = params?.supps[suppKey];
			if (dataObj?.status && parseInt(dataObj?.price) > 0) return { accompagnement_id: parseInt(suppKey), accompagnement_price: parseInt(dataObj?.price) };
		});
		console.log('22');

		formData.append('accompagnements', JSON.stringify(accompagnements));
		formData.append('supplements', JSON.stringify(supplements));

		const response = await axios.post(`/api/articles/save-article`, formData, {
			headers: {
				'Content-type': 'multipart/form-data',
			},
		});
		console.log(response);
		return response.data;
	} catch (e) {
		throw new Error(e.statusText);
	}
});

export const merchantsSettingsSlice = createSlice({
	name: 'merchants',
	initialState: {
		isLoading: false,
		merchants: [],
		skip: 0,
		noMoreQuery: false,
		totalCount: 0,
	},
	reducers: {
		resetFrom: (state) => {
			state.skip = 0;
			state.articles = [];
			state.noMoreQuery = false;
		},
	},

	extraReducers: {
		[getMerchantsContent.pending]: (state) => {
			state.isLoading = true;
		},
		[getMerchantsContent.fulfilled]: (state, action) => {
			// Append the newly fetched users to the list
			state.merchants = [...state.merchants, ...(action.payload.merchants || [])];
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
		[getMerchantsContent.rejected]: (state) => {
			state.isLoading = false;
		},

		[saveMerchantsAccompagnement.pending]: (state) => {
			state.isLoading = true;
		},
		[saveMerchantsAccompagnement.fulfilled]: (state, action) => {
			const indexToReplaced = state.merchants.findIndex((merch) => merch.id === action.payload?.accompagnement?.merchant_id);
			// If the object is found, replace it with the new object
			if (indexToReplaced !== -1) {
				const newMerchantObj = state.merchants[indexToReplaced];
				newMerchantObj?.accompagnements?.push(action.payload?.accompagnement);
				state.merchants[indexToReplaced] = newMerchantObj;
				// state.clients.splice(indexToReplaced, 1);
			}

			state.isLoading = false;
		},
		[saveMerchantsAccompagnement.rejected]: (state) => {
			state.isLoading = false;
		},

		[editMerchantsAccompagnement.pending]: (state) => {
			state.isLoading = true;
		},
		[editMerchantsAccompagnement.fulfilled]: (state, action) => {
			console.log('here');
			const indexToReplaced = state.merchants.findIndex((merch) => merch.id === action.payload?.accompagnement?.merchant_id);
			// If the object is found, replace it with the new object
			if (indexToReplaced !== -1) {
				const newMerchantObj = state.merchants[indexToReplaced];
				const accIndexToReplaced = newMerchantObj?.accompagnements?.findIndex((acc) => acc.id === action.payload?.accompagnement?.id);
				if (accIndexToReplaced !== -1) {
					console.log(action.payload?.accompagnement);
					console.log(newMerchantObj.accompagnements);
					newMerchantObj.accompagnements[accIndexToReplaced] = action.payload?.accompagnement;
					console.log(newMerchantObj.accompagnements);
				}

				state.merchants[indexToReplaced] = newMerchantObj;
				// state.clients.splice(indexToReplaced, 1);
			}

			state.isLoading = false;
		},
		[editMerchantsAccompagnement.rejected]: (state) => {
			state.isLoading = false;
		},

		[deleteMerchantsAccompagnement.pending]: (state) => {
			state.isLoading = true;
		},
		[deleteMerchantsAccompagnement.fulfilled]: (state, action) => {
			const indexToReplaced = state.merchants.findIndex((merch) => merch.id === action.payload?.accompagnement?.merchant_id);

			// If the object is found, replace it with the new object
			if (indexToReplaced !== -1) {
				const newMerchantObj = state.merchants[indexToReplaced];
				const accIndexToReplaced = newMerchantObj?.accompagnements?.findIndex((acc) => acc.id === action.payload?.accompagnement?.id);
				if (accIndexToReplaced !== -1) {
					newMerchantObj?.accompagnements?.splice(accIndexToReplaced, 1);
				}

				state.merchants[indexToReplaced] = newMerchantObj;
			}

			state.isLoading = false;
		},
		[deleteMerchantsAccompagnement.rejected]: (state) => {
			state.isLoading = false;
		},

		[saveMerchantsArticle.pending]: (state) => {
			state.isLoading = true;
		},
		[saveMerchantsArticle.fulfilled]: (state, action) => {
			const indexToReplaced = state.merchants.findIndex((merch) => merch.id === action.payload?.article?.merchant_id);
			// If the object is found, replace it with the new object
			if (indexToReplaced !== -1) {
				const newMerchantObj = state.merchants[indexToReplaced];
				newMerchantObj.articles = [action.payload?.article, ...newMerchantObj.articles];
				state.merchants[indexToReplaced] = newMerchantObj;
				// state.clients.splice(indexToReplaced, 1);
			}

			state.isLoading = false;
		},
		[saveMerchantsArticle.rejected]: (state) => {
			state.isLoading = false;
		},
	},
});

export const { resetFrom } = merchantsSettingsSlice.actions;

export default merchantsSettingsSlice.reducer;
