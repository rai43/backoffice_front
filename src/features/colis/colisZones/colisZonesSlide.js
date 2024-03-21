import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import moment from 'moment';

import { REQUEST_QUERY_CONSTANTS } from '../../../utils/globalConstantUtil';

export const getColisZones = createAsyncThunk('colis/get-zones-livreurs', async (params) => {
  const response = await axios.get('/api/colis/get-zones-livreurs');
  console.log(response.data);
  return response.data;
});

export const changeZoneLivreurProvider = createAsyncThunk(
  'colis/set-zones-livreurs',
  async (params) => {
    const zoneName = params.zoneName;
    const livreurId = params.livreurId;
    const group = params.group;

    const response = await axios.post(
      `/api/colis/set-zones-livreurs/${zoneName}/${livreurId}/${group}`,
      {}
    );
    return response.data;
  }
);

function transformData(data) {
  const zonesSet = new Set(); // To track unique zones
  const transformed = [];

  // First, collect all unique zone names
  console.log({ data });
  Object.values(data).forEach((group) => {
    Object.keys(group).forEach((zone) => zonesSet.add(zone));
  });

  // Then, for each unique zone, construct the desired object structure
  zonesSet.forEach((zone) => {
    const zoneObj = { zone };

    Object.entries(data).forEach(([groupName, group]) => {
      if (group[zone]) {
        zoneObj[groupName] = group[zone];
      }
    });

    transformed.push(zoneObj);
  });

  return transformed;
}

export const colisZonesSlide = createSlice({
  name: 'providers',
  initialState: {
    isLoading: false,
    colisZones: [],
    totalCount: 0
  },
  reducers: {
    resetFrom: (state) => {
      state.skip = 0;
      state.colisZones = [];
      state.noMoreQuery = false;
    }
  },

  extraReducers: {
    [getColisZones.pending]: (state) => {
      state.isLoading = true;
    },
    [getColisZones.fulfilled]: (state, action) => {
      state.colisZones = transformData(action?.payload?.colisZones);
      state.isLoading = false;
    },
    [getColisZones.rejected]: (state) => {
      state.isLoading = false;
    },

    [changeZoneLivreurProvider.pending]: (state) => {
      state.isLoading = true;
    },
    [changeZoneLivreurProvider.fulfilled]: (state, action) => {
      console.log({ action: action?.payload });
      state.colisZones = transformData(action?.payload?.returnedColis);
      state.isLoading = false;
    },
    [changeZoneLivreurProvider.rejected]: (state) => {
      state.isLoading = false;
    }
  }
});

export const { resetFrom } = colisZonesSlide.actions;

export default colisZonesSlide.reducer;
