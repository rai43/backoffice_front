import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, child, get } from 'firebase/database';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';

export const getLiveLocations = createAsyncThunk(
  '/liveLocations/get-live-locations',
  async (params) => {
    // const firebaseConfig = {
    //   apiKey: process.env.REACT_APP_API_KEY,
    //   authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    //   databaseURL: process.env.REACT_APP_DATABASE_URL,
    //   projectId: process.env.REACT_APP_PROJECT_ID,
    //   storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    //   messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    //   appId: process.env.REACT_APP_APP_ID,
    //   measurementId: process.env.REACT_APP_MEASUREMENT_ID,
    // };

    const firebaseConfig = {
      apiKey: 'AIzaSyAbHnmwDBmFOa1Isba71qHUr8VvnjC3MVI',
      authDomain: 'street-livreur.firebaseapp.com',
      databaseURL: 'https://street-livreur-default-rtdb.firebaseio.com',
      projectId: 'street-livreur',
      storageBucket: 'street-livreur.appspot.com',
      messagingSenderId: '1031857193910',
      appId: '1:1031857193910:web:a191ad89fc0ee568373717',
      measurementId: 'G-0CZHLCSHEM'
    };

    console.log(firebaseConfig);

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    // console.log(app);
    const db = getFirestore(app);
    // console.log(db);

    const dbRef = ref(getDatabase());
    let snapshot;
    try {
      snapshot = await get(child(dbRef, `users`));
    } catch (error) {
      console.error(error);
    }

    let availableUsersPhone = [];
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log('No data available');
    }

    // const response = await axios.get("/api/subscriptions/get-subscriptions");
    // console.log(response.data);
    // return response.data;
  }
);

export const liveLocationsSlice = createSlice({
  name: 'liveLocations',
  initialState: {
    isLoading: false,
    liveLocations: []
  },
  reducers: {
    resetForm: (state) => {
      state.liveLocations = [];
      state.isLoading = false;
    }
  },

  extraReducers: {
    [getLiveLocations.pending]: (state) => {
      state.isLoading = true;
    },
    [getLiveLocations.fulfilled]: (state, action) => {
      console.log(action);
      const newLocations = Object.values(action?.payload)?.filter((loc) => {
        if (loc?.latitude && loc?.longitude) {
          return loc;
        }
      });
      state.liveLocations = [...newLocations];

      state.isLoading = false;
    },
    [getLiveLocations.rejected]: (state) => {
      state.isLoading = false;
    }
  }
});

export const { resetForm } = liveLocationsSlice.actions;

export default liveLocationsSlice.reducer;
