import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';

import 'leaflet/dist/leaflet.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markShadowPng from 'leaflet/dist/images/marker-shadow.png';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

const position = [51.505, -0.09];

const OrderPosition = ({ extraObject }) => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const [position, setPosition] = useState(
    extraObject?.all
      ? [orders[0]?.address?.latitude, orders[0]?.address?.longitude]
      : extraObject?.selectedRows && extraObject?.orders?.length
        ? [
            extraObject?.orders[0]?.address?.latitude || 0,
            extraObject?.orders[0]?.address?.longitude || 0
          ]
        : [extraObject?.order?.address?.latitude || 0, extraObject?.order?.address?.longitude || 0]
  );
  // const [position, setPosition] = useState(extraObject?.all ? [5.4054433, -3.9922133]);

  // useEffect(() => {
  // 	if (extraObject?.all) {
  // 		if (orders?.length) {
  // 			console.log(orders[0]?.address?.latitude, orders[0]?.address?.longitude);
  // 			setPosition((_) => {
  // 				return [orders[0]?.address?.latitude, orders[0]?.address?.longitude];
  // 			});
  // 		}
  // 	} else if (extraObject?.selectedRows && extraObject?.orders?.length) {
  // 	} else {
  // 		setPosition((_) => {
  // 			return [extraObject?.order?.address?.latitude, extraObject?.order?.address?.longitude];
  // 		});
  // 	}
  // }, []);

  return (
    <div className="">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        // className='absolute'
        style={{ height: '750px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!extraObject?.all && !extraObject?.selectedRows && (
          <Marker
            position={position}
            icon={
              new Icon({
                iconUrl: markerIconPng,
                shadowUrl: markShadowPng
              })
            }
          >
            <Popup>
              Client <br />
              <span className="text-primary font-bold">
                {extraObject?.order?.client?.phone_number}
              </span>
              {/* <div className='grid md:grid-cols-3 md:gap-2 w-[3rem]'>
								<p className=''>Client</p>
								<p className='md:col-span-2'>{extraObject?.order?.client?.phone_number}</p>
							</div> */}
            </Popup>
          </Marker>
        )}
        {extraObject?.selectedRows &&
          extraObject?.orders?.length &&
          extraObject?.orders?.map((order) => (
            <Marker
              key={order?.id}
              position={[order?.address?.latitude || 0, order?.address?.longitude || 0]}
              icon={
                new Icon({
                  iconUrl: markerIconPng,
                  shadowUrl: markShadowPng
                })
              }
            >
              <Popup>
                Client <br />
                <span className="text-primary font-bold">{order?.client?.phone_number}</span>
              </Popup>
            </Marker>
          ))}
        {extraObject?.all &&
          orders?.length &&
          orders?.map((order) => (
            <Marker
              key={order?.id}
              position={[order?.address?.latitude || 0, order?.address?.longitude || 0]}
              icon={
                new Icon({
                  iconUrl: markerIconPng,
                  shadowUrl: markShadowPng
                })
              }
            >
              <Popup>
                Client <br />
                <span className="text-primary font-bold">{order?.client?.phone_number}</span>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
      {/* <Popup minWidth={150}>
								<div className='grid grid-cols-1 md:grid-cols-4 mt-4 gap-6'>
									<div className='col-span-4'>
										<img
											src={country.flag}
											alt={country.country}
										/>
									</div>
									<div className='col-span-2'>Name: </div>
									<div className='col-span-2'>{country.country}</div>
									<div className='col-span-2'>Active Cases: </div>
									<div className='col-span-2'>{country.active}</div>
									<div className='col-span-2'>Recovered: </div>
									<div className='col-span-2'>{country.recovered}</div>
									<div className='col-span-2'>Deaths: </div>
									<div className='col-span-2'>{country.deaths}</div>
								</div>
							</Popup> */}
    </div>
  );
};

export default OrderPosition;
