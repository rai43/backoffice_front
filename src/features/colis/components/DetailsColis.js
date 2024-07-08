import React, { useState, useEffect } from 'react';

import axios from 'axios';
import L, { Icon } from 'leaflet';
import moment from 'moment';
import numeral from 'numeral';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline } from 'react-leaflet';
import { useDispatch } from 'react-redux';

import 'leaflet/dist/leaflet.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markShadowPng from 'leaflet/dist/images/marker-shadow.png';

import { MdDeleteOutline } from 'react-icons/md';

import BasicModal from '../../../components/Modals/BasicModal';
import { STATUS_COLORS, STATUS_ICON_NAMES } from '../../../utils/colisUtils';
import { calculateDistance } from '../../../utils/functions/calculateDistance';
import { enableScroll } from '../../../utils/functions/preventAndAllowScroll';
import {
  TABS_ENUMERATION_IN_COLIS,
  TABS_ENUMERATION_IN_COLIS_DETAILS
} from '../../../utils/globalConstantUtil';
import { showNotification } from '../../common/headerSlice';
import parcelsUtils from '../parcels.utils';
import { changeColisStatus, deleteColis } from '../parcelsManagementSlice';
const ACTIONS = {
  DELETE: 'DELETE'
};

const DetailsColis = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(TABS_ENUMERATION_IN_COLIS_DETAILS.general);
  const [actionsState, setActionsState] = useState({
    [ACTIONS.DELETE]: false
  });
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');

  const [isZoomed, setIsZoomed] = useState(false);

  const [latestColisObject, setLatestColisObject] = useState(null);
  const [assignments, setAssignments] = useState(null);

  useEffect(() => {
    const fetchParcelById = async (id) => {
      try {
        const response = await axios.get('/api/colis/get-colis-by-id-or-code', {
          params: { reference: id }
        });
        const fetchedColis = response.data?.colis;
        setUploadedFileUrl(fetchedColis?.expedition_receipt || '');
        setLatestColisObject(fetchedColis);
      } catch (error) {
        console.error('Failed to fetch parcel data:', error);
      }
    };

    if (extraObject?.colis?.id) {
      fetchParcelById(extraObject?.colis?.id);
    }

    const assignments = parcelsUtils.findOngoingAssignment(latestColisObject);
    setAssignments(() => assignments);
  }, [extraObject?.colis?.id]);

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const onCloseBlockModal = () => {
    enableScroll();
    setActionsState(() => {
      return {
        [ACTIONS.DELETE]: false
      };
    });
  };

  const handleDeleteColis = (method) => {
    setActionsState(() => {
      if (method === ACTIONS.DELETE) {
        return {
          [ACTIONS.DELETE]: true
        };
      }
    });
  };

  // file upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(
          `/api/colis/upload-expedition-receipt/${latestColisObject?.id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setUploadMessage('File uploaded successfully');
        setUploadedFileUrl(response?.data?.fileUrl);
      } catch (error) {
        setUploadMessage('Failed to upload file');
        console.error(error);
      }
    } else {
      alert('Please select a file to upload');
    }
  };

  return (
    <>
      {latestColisObject && (
        <>
          <BasicModal
            isOpen={actionsState[ACTIONS.DELETE]}
            onProceed={async () => {
              dispatch(
                deleteColis({
                  colisId: latestColisObject?.id
                })
              ).then(async (response) => {
                if (response?.error) {
                  console.log(response);
                  dispatch(
                    showNotification({
                      message: 'Error while deleting the parcel',
                      status: 0
                    })
                  );
                } else {
                  dispatch(
                    showNotification({
                      message: 'Successfully deleted the parcel',
                      status: 1
                    })
                  );
                  closeModal();
                }
              });
            }}
            onClose={onCloseBlockModal}>
            <p>
              ARE YOU SURE YOU WANT TO DELETE THE PARCEL{' '}
              <span className="text-secondary font-semibold">{latestColisObject?.code}</span>
            </p>
          </BasicModal>
          <div className="divider sm:col-span-3 uppercase text-primary font-bold text-3xl">
            {latestColisObject?.code}
          </div>
          <div className="flex justify-center w-full my-5">
            <div>
              <div className="tabs">
                <a
                  className={`tab tab-lifted ${
                    activeTab === TABS_ENUMERATION_IN_COLIS_DETAILS.general ? 'tab-active' : ''
                  }`}
                  onClick={() => setActiveTab(TABS_ENUMERATION_IN_COLIS_DETAILS.general)}>
                  {TABS_ENUMERATION_IN_COLIS_DETAILS.general}
                </a>
                <a
                  className={`tab tab-lifted ${
                    activeTab === TABS_ENUMERATION_IN_COLIS_DETAILS.expedition ? 'tab-active' : ''
                  } ${
                    !latestColisObject.expedition_fee ||
                    parseInt(latestColisObject.expedition_fee) === 0
                      ? 'tab-disabled'
                      : ''
                  }`}
                  onClick={() => {
                    if (parseInt(latestColisObject?.expedition_fee || 0) > 0) {
                      setActiveTab(TABS_ENUMERATION_IN_COLIS_DETAILS.expedition);
                    }
                  }}>
                  {TABS_ENUMERATION_IN_COLIS_DETAILS.expedition}
                </a>
              </div>
            </div>
          </div>
          {activeTab === TABS_ENUMERATION_IN_COLIS_DETAILS.general ? (
            <>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 sm:mb-3">
                <div className={'divider sm:col-span-3 m-0'}>General Information</div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Colis Code</h4>
                  <div className="col-span-2 text-primary">{latestColisObject?.code}</div>
                </div>
                {latestColisObject?.colis_statuses?.length ? (
                  <div className="grid grid-cols-3 font-semibold">
                    <h4 className="uppercase">Status</h4>
                    <div className="col-span-2 text-primary">
                      {latestColisObject?.colis_statuses[0]?.colis_status?.code?.replaceAll(
                        '_',
                        ' '
                      )}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Delete</h4>
                  <div className="col-span-2 text-primary">
                    <button
                      className={'btn btn-outline btn-sm btn-error'}
                      onClick={() => handleDeleteColis(ACTIONS.DELETE)}>
                      <MdDeleteOutline className={''} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className={'divider sm:col-span-2 m-0'}>Amount Information</div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Fee</h4>
                  <div className="col-span-2 text-primary">
                    {numeral(parseInt(latestColisObject?.fee || 0)).format('0,0')}
                  </div>
                </div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Fee Payment</h4>
                  <div className="col-span-2 text-primary">{latestColisObject?.fee_payment}</div>
                </div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Amount To Collect</h4>
                  <div className="col-span-2 text-primary">
                    {numeral(parseInt(latestColisObject?.price || 0)).format('0,0')}
                  </div>
                </div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Total To Collect</h4>
                  <div className="col-span-2 text-secondary font-bold">
                    {numeral(
                      parseInt(
                        latestColisObject?.fee_payment === 'PREPAID'
                          ? latestColisObject?.price
                          : (latestColisObject?.price ? parseInt(latestColisObject?.price) : 0) +
                              parseInt(latestColisObject?.fee) || 0
                      )
                    ).format('0,0')}
                  </div>
                </div>
                <div className={'divider sm:col-span-2 m-0'}>Sender Information</div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Client ID</h4>
                  <div className="col-span-2 text-primary">
                    {latestColisObject?.client ? latestColisObject?.client?.id : 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Phone Number</h4>
                  <div className="col-span-2 text-primary">
                    {latestColisObject?.client ? latestColisObject?.client?.phone_number : 'N/A'}
                  </div>
                </div>
                <div className={'divider sm:col-span-2 m-0'}>Pickup Information</div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Address</h4>
                  <div className="col-span-2 text-primary uppercase">
                    {latestColisObject?.pickup_address?.description?.toUpperCase()}
                  </div>
                </div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Pickup Phone Number</h4>
                  <div className="col-span-2 text-primary">
                    {latestColisObject?.pickup_phone_number || 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Pickup Latitude</h4>
                  <div className="col-span-2 text-primary">
                    {latestColisObject?.pickup_address?.latitude || 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Pickup Longitude</h4>
                  <div className="col-span-2 text-primary">
                    {latestColisObject?.pickup_address?.longitude || 'N/A'}
                  </div>
                </div>
                <div className={'divider sm:col-span-2 m-0'}>Delivery Information</div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Address</h4>
                  <div className="col-span-2 text-primary uppercase">
                    {latestColisObject?.delivery_address?.description?.toUpperCase()}
                  </div>
                </div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Delivery Phone Number</h4>
                  <div className="col-span-2 text-primary">
                    {latestColisObject?.delivery_phone_number || 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Delivery Latitude</h4>
                  <div className="col-span-2 text-primary">
                    {latestColisObject?.delivery_address?.latitude || 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Delivery Longitude</h4>
                  <div className="col-span-2 text-primary">
                    {latestColisObject?.delivery_address?.longitude || 'N/A'}
                  </div>
                </div>
                <div className={'divider sm:col-span-2 m-0'}>Creation Information</div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Created At</h4>
                  <div className="col-span-2 text-primary">
                    {moment.utc(latestColisObject?.created_at).format('DD-MM-YYYY HH:mm')}
                  </div>
                </div>
                <div className="grid grid-cols-3 font-semibold">
                  <h4 className="uppercase">Last Update At</h4>
                  <div className="col-span-2 text-primary">
                    {moment.utc(latestColisObject?.updated_at).format('DD-MM-YYYY HH:mm')}
                  </div>
                </div>
              </div>

              {latestColisObject?.colis_statuses?.length ? (
                <div>
                  <div className={'divider mt-4'}>Status Information</div>
                  <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 mb-4 mx-auto">
                    {/* assignments.slice().sort((a, b) => new Date(a.date) - new Date(b.date)) */}
                    {(latestColisObject?.colis_statuses?.slice() || []).map((status) => (
                      <StatusCard key={status.id} status={status} />
                    ))}
                  </div>
                </div>
              ) : (
                <></>
              )}

              {latestColisObject?.commande_colis?.length ? (
                <div>
                  <div className={'divider mt-4'}>Assignment Information</div>
                  <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-8 mb-4 mx-auto">
                    {/* assignments.slice().sort((a, b) => new Date(a.date) - new Date(b.date)) */}
                    {(
                      latestColisObject?.commande_colis?.slice().sort((a, b) => b.id - a.id) || []
                    ).map((assignment, index) => (
                      <AssignmentCard
                        key={assignment.id}
                        idx={index}
                        assignment={assignment}
                        latestColisObject={latestColisObject}
                        statuses={
                          (latestColisObject?.colis_statuses || []).reduce((acc, status) => {
                            (acc[status.colis_assignment_id] =
                              acc[status.colis_assignment_id] || []).push(status);
                            return acc;
                          }, {})[assignment.id] || []
                        }
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <></>
              )}
              <div>
                <div className={'divider mt-4'}>Map Information</div>
                <MapWithMarkersAndLine latestColisObject={latestColisObject} />
              </div>

              {latestColisObject?.photo && (
                <div className="mt-4">
                  <div className="max-w-md mx-auto bg-white rounded-lg shadow-md">
                    <img
                      className="w-full object-cover object-center rounded-t-lg"
                      src={latestColisObject?.photo}
                      alt="Parcel Photo"
                    />
                    <div className="p-4">
                      <h2 className="text-xl font-semibold mb-2">
                        Parcel Photo: #{latestColisObject?.code}
                      </h2>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <></>
          )}
          {activeTab === TABS_ENUMERATION_IN_COLIS_DETAILS.expedition ? (
            <>
              <div className="flex items-center justify-center py-8">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                  <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Upload Expedition Receipt
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <input
                      type="file"
                      id="file"
                      className="file-input file-input-bordered w-full"
                      onChange={handleFileChange}
                    />
                    <div className="flex items-center justify-between mt-4 py-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-outline w-full py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200">
                        Upload
                      </button>
                    </div>
                  </form>
                  {file && (
                    <div className="mt-4 text-center">
                      <p className="text-gray-600">Selected file: {file.name}</p>
                    </div>
                  )}
                  {uploadMessage && (
                    <div className="mt-4 text-center">
                      <p className="text-gray-600">{uploadMessage}</p>
                      {/*{uploadedFileUrl && (*/}
                      {/*  <a*/}
                      {/*    href={'http://localhost:8000/' + uploadedFileUrl}*/}
                      {/*    target="_blank"*/}
                      {/*    rel="noopener noreferrer"*/}
                      {/*    className="text-blue-500">*/}
                      {/*    View Uploaded File*/}
                      {/*  </a>*/}
                      {/*)}*/}
                    </div>
                  )}
                </div>
                {uploadedFileUrl && (
                  <div className="ml-8">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Current Receipt</h3>
                    <img
                      src={`https://bo.street.ci/${uploadedFileUrl}`}
                      // src={`http://localhost:8000/${uploadedFileUrl}`}
                      alt="Expedition Receipt"
                      className="w-80 h-auto border rounded-lg shadow"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <></>
          )}
        </>
      )}
    </>
  );
};

export default DetailsColis;

const AssignmentCard = ({ assignment, idx, latestColisObject }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
      <div className="p-5">
        <h5 className="text-gray-900 font-bold text-2xl tracking-tight mb-2">
          Colis Assignment #{assignment?.id}
        </h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-sm text-gray-600">Versement Status:</div>
          <div
            className={`text-sm font-semibold text-primary ${
              assignment?.versement_status === 'PENDING'
                ? 'badge badge-secondary badge-outline'
                : 'badge badge-accent badge-outline'
            }`}>
            {assignment?.versement_status?.toUpperCase()}
          </div>

          <div className="text-sm text-gray-600">Colis Status:</div>
          <div className="text-sm font-semibold text-primary">
            {assignment?.colis_status?.colis_status?.code?.replaceAll('_', ' ')?.toUpperCase()}
          </div>

          <div className="text-sm text-gray-600">Reason:</div>
          <div className="text-sm font-semibold text-gray-900">
            {assignment?.colis_status?.colis_status_reason_id
              ? assignment?.colis_status?.colis_status_reason?.code
                  ?.replaceAll('_', ' ')
                  ?.toUpperCase()
              : 'N/A'}
          </div>

          <div className="text-sm text-gray-600">Status Attempt:</div>
          <div className="text-sm font-semibold text-gray-900">
            {assignment?.colis_status?.attempt}
          </div>

          <div className="text-sm text-gray-600">Livreur:</div>
          <div className="text-sm font-semibold text-gray-900">
            {`${assignment?.livreur?.first_name} ${assignment?.livreur?.last_name}`?.toUpperCase()}
          </div>

          <div className="text-sm text-gray-600">Livreur Phone:</div>
          <div className="text-sm font-semibold text-gray-900">
            {`${assignment?.livreur?.client?.phone_number}`}
          </div>

          <div className="text-sm text-gray-600">Created At:</div>
          <div className="text-sm font-semibold text-gray-900">
            {moment.utc(assignment?.created_at)?.format('DD-MM-YYYY HH:mm')}
          </div>
        </div>
      </div>
      <div className="px-5 py-4 bg-gray-50">
        <span className="text-xs font-medium text-gray-600">
          {idx === 0 ? 'Note: This is the latest assignment of the parcel.' : 'Street CI'}
        </span>
      </div>
    </div>
  );

  // <div className="bg-gray-100 p-6 rounded-lg shadow mb-6">
  //   <div className="mb-4">
  //     <h3 className="text-xl font-bold">
  //       {`${assignment.colis_status?.code?.replaceAll('_', ' ') || ''} ${
  //         assignment.status
  //       } - ${moment(assignment.date).format('DD-MM-YYYY')}`}
  //     </h3>
  //     <p>{`Courier: ${assignment.livreur.first_name} ${assignment.livreur.last_name}`}</p>
  //   </div>
  //   <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 mb-4">
  //     {statuses.map((status) => (
  //       <StatusCard key={status.id} status={status} />
  //     ))}
  //   </div>
  // </div>
};

const StatusCard = ({ status }) => (
  <div className={`stats shadow shadow-primary`} key={status?.id}>
    <div className="stat">
      <div className={`stat-figure dark:text-slate-300 text-primary`}>
        {STATUS_ICON_NAMES[status?.colis_status?.code?.toUpperCase()]}
      </div>
      <div className="stat-title dark:text-slate-300">
        {status?.colis_status?.code?.replaceAll('_', ' ')} ({status?.attempt || 1})
      </div>
      <div
        className={`stat-value text-xl ${
          STATUS_COLORS[status?.colis_status?.code?.toUpperCase()]
        }`}>
        {status?.created_at ? moment.utc(status?.created_at).format('DD-MM-YYYY') : 'N/A'}
      </div>
      <div className={'stat-desc  '}>
        {status?.created_at ? 'Time: ' + moment.utc(status?.created_at).format('HH:mm') : 'N/A'}
      </div>
    </div>
  </div>
);

const MapWithMarkersAndLine = ({ latestColisObject }) => {
  // Check if both pickup and delivery addresses are available
  const areLocationsAvailable =
    latestColisObject?.pickup_address && latestColisObject?.delivery_address;

  // Create an array of positions for the Polyline if both locations are available
  const positions = areLocationsAvailable
    ? [
        [latestColisObject?.pickup_address?.latitude, latestColisObject?.pickup_address?.longitude],
        [
          latestColisObject?.delivery_address?.latitude,
          latestColisObject?.delivery_address?.longitude
        ]
      ]
    : [];

  // Calculate distance if locations are available
  let distance = 0;
  if (areLocationsAvailable) {
    distance = calculateDistance(
      latestColisObject?.pickup_address?.latitude,
      latestColisObject?.pickup_address?.longitude,
      latestColisObject?.delivery_address?.latitude,
      latestColisObject?.delivery_address?.longitude
    ).toFixed(2); // Rounds the distance to 2 decimal places
  }

  const icon = new L.Icon({
    iconUrl: markerIconPng,
    shadowUrl: markShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div>
      <MapContainer
        center={[
          latestColisObject?.pickup_address?.latitude || 0,
          latestColisObject?.pickup_address?.longitude || 0
        ]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: '250px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {areLocationsAvailable &&
          [latestColisObject?.pickup_address, latestColisObject?.delivery_address].map((loc) => (
            <Marker
              key={loc?.place_id}
              position={[loc?.latitude || 0, loc?.longitude || 0]}
              icon={icon}>
              <Popup>{loc?.description?.toUpperCase()?.split(',')[0]}</Popup>
            </Marker>
          ))}
        {areLocationsAvailable && <Polyline positions={positions} color="red" />}
      </MapContainer>
      {areLocationsAvailable && (
        <p style={{ textAlign: 'center' }}>Total Approximate distance: {distance} km</p>
      )}
    </div>
  );
};
