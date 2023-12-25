import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLiveLocations, resetForm } from './LiveLocationsSlice';
import { showNotification } from '../common/headerSlice';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { Icon } from 'leaflet';

import 'leaflet/dist/leaflet.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markShadowPng from 'leaflet/dist/images/marker-shadow.png';
import InputText from '../../components/Input/InputText';

const LiveLocations = (props) => {
  const dispatch = useDispatch();
  const [livreurInfo, setLivreurInfo] = useState('');
  const { liveLocations, isLoading } = useSelector((state) => state.liveLocations);
  console.log(liveLocations);

  useEffect(() => {
    onFetchClientLiveLocations();
  }, []);

  const applyFilter = async (dispatchParams) => {
    await dispatch(getLiveLocations(dispatchParams)).then(async (response) => {
      if (response?.error) {
        dispatch(
          showNotification({
            message: 'Error while fetching live locations',
            status: 0
          })
        );
      } else {
        dispatch(
          showNotification({
            message: 'Successfully fetched the live locations',
            status: 1
          })
        );
      }
    });
  };

  const onFetchClientLiveLocations = async () => {
    dispatch(resetForm());
    const dispatchParams = {};
    await applyFilter(dispatchParams);
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-3">
        <InputText
          type="text"
          defaultValue={livreurInfo}
          updateType=""
          containerStyle="my-2"
          labelTitle="Livreur Information"
          placeholder={'Livreur Information'}
          updateFormValue={({ _, value }) => setLivreurInfo((_) => value)}
        />
      </div>
      {!isLoading && (
        <div className="">
          <MapContainer
            center={[liveLocations[0]?.latitude || 0, liveLocations[0]?.longitude || 0]}
            zoom={15}
            scrollWheelZoom={false}
            // className='absolute'
            style={{ height: '750px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {liveLocations?.length &&
              liveLocations
                ?.filter(
                  (l) =>
                    l.phoneNumber?.toLocaleLowerCase()?.includes(livreurInfo) ||
                    l.firstName?.toLocaleLowerCase()?.includes(livreurInfo) ||
                    l.lastName?.toLocaleLowerCase()?.includes(livreurInfo)
                )
                ?.map((loc) => (
                  <Marker
                    key={loc?.phoneNumber}
                    position={[loc?.latitude || 0, loc?.longitude || 0]}
                    icon={
                      new Icon({
                        iconUrl: markerIconPng,
                        shadowUrl: markShadowPng
                      })
                    }
                  >
                    <Popup>
                      {loc?.firstName + ' ' + loc?.lastName} <br />
                      <span className="text-primary font-bold">{loc?.phoneNumber}</span>
                    </Popup>
                    <Tooltip direction="bottom" offset={[0, 20]} opacity={1} permanent>
                      {loc?.firstName + ' ' + loc?.lastName} <br />
                      <span className="text-primary font-bold">{loc?.phoneNumber}</span>
                    </Tooltip>
                  </Marker>
                ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default LiveLocations;
