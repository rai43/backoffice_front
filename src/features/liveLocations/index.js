import React, { useEffect, useState, useRef } from 'react';

import { isEqual } from 'lodash';

import { FiMap } from 'react-icons/fi';

import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, child, get } from 'firebase/database';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markShadowPng from 'leaflet/dist/images/marker-shadow.png';

import InputText from '../../components/Input/InputText';

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

const tileLayers = [
  {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: 'Map data &copy; OpenStreetMap contributors'
  },
  {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri'
  },
  {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors, © CARTO'
  }
  // {
  //   url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
  //   attribution: 'Map data &copy; OpenStreetMap contributors'
  // },
  // {
  //   url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png',
  //   attribution: 'Map tiles by Stamen Design, CC BY 3.0 - Map data © OpenStreetMap'
  // },
  // {
  //   url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
  //   attribution: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
  // }
];

// Initialize Firebase app
initializeApp(firebaseConfig);

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const LiveLocations = () => {
  const [livreurInfo, setLivreurInfo] = useState('');
  const [livreurs, setLivreurs] = useState([]);
  const [filteredLivreurs, setFilteredLivreurs] = useState([]);
  const [mapCenter, setMapCenter] = useState([5.404875711628115, -3.9917047867311615]);
  const [tileLayer, setTileLayer] = useState('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

  // Initialize tileLayer state with the first tile layer option
  const [tileLayerIndex, setTileLayerIndex] = useState(0);

  const switchTileLayer = () => {
    // Cycle through the tileLayers array
    setTileLayerIndex((prevIndex) => (prevIndex + 1) % tileLayers.length);
  };
  // const [tileLayer, setTileLayer] = useState('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  const WAIT_TIME = 2000;

  // Function to fetch live location data from Firebase
  const fetchLiveLocations = () => {
    const dbRef = ref(db, `users`);
    get(dbRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const locations = Object.entries(snapshot.val());

          const validLocations = locations
            .filter(([_, locObj]) => locObj.latitude && locObj.longitude)
            .map(([phoneNumber, locObj]) => ({
              ...locObj,
              phoneNumber
            }));

          if (!isEqual(validLocations, [...livreurs])) {
            setLivreurs(validLocations);
          }
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    fetchLiveLocations();
    const intervalId = setInterval(fetchLiveLocations, WAIT_TIME);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const lowerCaseInfo = livreurInfo.toLowerCase();
    const filtered = livreurs.filter((loc) =>
      loc.phoneNumber?.toLowerCase().includes(lowerCaseInfo)
    );

    if (!isEqual(filtered, filteredLivreurs)) {
      setFilteredLivreurs(filtered);
      if (filtered.length) {
        // Recenter map based on the first filtered result
        setMapCenter([filtered[0].latitude, filtered[0].longitude]);
      }
    }
  }, [livreurs, livreurInfo, filteredLivreurs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="pb-4 flex items-center gap-4">
        <InputText
          type="text"
          value={livreurInfo} // Assuming this is a controlled component
          className="flex-grow" // Make input text take the remaining space
          placeholder="Search by Livreur Information"
          updateFormValue={({ _, value }) => setLivreurInfo(value)}
        />
        <button
          onClick={switchTileLayer}
          className="mt-4 p-2 bg-blue-500 text-white rounded flex items-center justify-center"
          title="Switch Map View">
          <FiMap className="text-lg" /> {/* React Icons usage for the button icon */}
        </button>
      </div>
      <div style={{ flexGrow: 1, minHeight: 0 }}>
        <MapContainer
          center={mapCenter}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: '85%', width: '100%' }}>
          <TileLayer
            attribution={tileLayers[tileLayerIndex].attribution}
            url={tileLayers[tileLayerIndex].url}
          />
          {/*<TileLayer attribution="Map data &copy; OpenStreetMap contributors" url={tileLayer} />*/}
          {filteredLivreurs.map((loc) => (
            <Marker
              key={loc.phoneNumber}
              position={[loc.latitude, loc.longitude]}
              icon={
                new Icon({
                  iconUrl: markerIconPng,
                  shadowUrl: markShadowPng,
                  iconSize: [25, 41],
                  iconAnchor: [12, 41]
                })
              }>
              <Popup className="text-primary font-bold">
                {loc.latitude},{loc.longitude}
              </Popup>
              <Tooltip direction="bottom" offset={[0, 5]} opacity={0.8} permanent>
                {loc.phoneNumber}
              </Tooltip>
            </Marker>
          ))}
          <MapUpdater center={mapCenter} />
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveLocations;

//import React, { useEffect, useState } from 'react';
//
// import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
// import { Icon } from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { initializeApp } from 'firebase/app';
// import { getDatabase, ref, child, get } from 'firebase/database';
// import markerIconPng from 'leaflet/dist/images/marker-icon.png';
// import markShadowPng from 'leaflet/dist/images/marker-shadow.png';
//
// import InputText from '../../components/Input/InputText';
//
// // Firebase configuration
// const firebaseConfig = {
//   apiKey: 'AIzaSyAbHnmwDBmFOa1Isba71qHUr8VvnjC3MVI',
//   authDomain: 'street-livreur.firebaseapp.com',
//   databaseURL: 'https://street-livreur-default-rtdb.firebaseio.com',
//   projectId: 'street-livreur',
//   storageBucket: 'street-livreur.appspot.com',
//   messagingSenderId: '1031857193910',
//   appId: '1:1031857193910:web:a191ad89fc0ee568373717',
//   measurementId: 'G-0CZHLCSHEM'
// };
//
// // Initialize Firebase app
// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);
//
// const LiveLocations = () => {
//   const [livreurInfo, setLivreurInfo] = useState('');
//   const [livreurs, setLivreurs] = useState([]);
//   const [filteredLivreurs, setFilteredLivreurs] = useState([]);
//   const [mapCenter, setMapCenter] = useState({ lat: 5.404875711628115, lng: -3.9917047867311615 });
//   const WAIT_TIME = 2000;
//
//   // Function to fetch live location data from Firebase
//   const fetchLiveLocations = () => {
//     const dbRef = ref(db, `users`);
//     get(dbRef)
//       .then((snapshot) => {
//         if (snapshot.exists()) {
//           const newLocations = Object.values(snapshot.val()).filter(
//             (loc) => loc.latitude && loc.longitude
//           );
//           setLivreurs(newLocations);
//           // Automatically update map center to the first livreur's location
//           if (newLocations.length) {
//             setMapCenter({ lat: newLocations[0].latitude, lng: newLocations[0].longitude });
//           }
//         } else {
//           console.log('No data available');
//         }
//       })
//       .catch((error) => console.error(error));
//   };
//
//   // Fetch live locations at component mount and every 2 seconds
//   useEffect(() => {
//     fetchLiveLocations();
//     const intervalId = setInterval(fetchLiveLocations, WAIT_TIME);
//     return () => clearInterval(intervalId);
//   }, []);
//
//   // Function to filter live locations based on the search input
//   useEffect(() => {
//     const lowerCaseInfo = livreurInfo.toLowerCase();
//     const filtered = livreurs.filter(
//       (loc) =>
//         loc.phoneNumber?.toLowerCase().includes(lowerCaseInfo) ||
//         loc.firstName?.toLowerCase().includes(lowerCaseInfo) ||
//         loc.lastName?.toLowerCase().includes(lowerCaseInfo)
//     );
//     setFilteredLivreurs(filtered);
//   }, [livreurs, livreurInfo]);
//
//   return (
//     <div>
//       <div className="grid grid-cols-1 gap-3 p-4">
//         <InputText
//           type="text"
//           defaultValue={livreurInfo}
//           updateType=""
//           containerStyle="my-2"
//           labelTitle="Livreur Information"
//           placeholder="Search by Livreur Information"
//           updateFormValue={({ _, value }) => setLivreurInfo(value)}
//         />
//       </div>
//
//       <MapContainer
//         center={[mapCenter.lat, mapCenter.lng]}
//         zoom={15}
//         scrollWheelZoom={true}
//         style={{ height: '720px', width: '100%' }}>
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
//         {filteredLivreurs.map((loc) => (
//           <Marker
//             key={loc.phoneNumber}
//             position={[loc.latitude, loc.longitude]}
//             icon={
//               new Icon({
//                 iconUrl: markerIconPng,
//                 shadowUrl: markShadowPng,
//                 iconSize: [25, 41],
//                 iconAnchor: [12, 41]
//               })
//             }>
//             <Popup>
//               {loc.firstName + ' ' + loc.lastName} <br />
//               <span className="text-primary font-bold">{loc.phoneNumber}</span>
//             </Popup>
//             <Tooltip direction="bottom" offset={[0, 20]} opacity={1} permanent>
//               {loc.firstName + ' ' + loc.lastName}
//             </Tooltip>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// };
//
// export default LiveLocations;
