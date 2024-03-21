// noinspection JSUnresolvedReference

import React, { useCallback, useEffect, useRef, useState } from 'react';

import axios from 'axios';
import * as _ from 'lodash';
import moment from 'moment';
import { useDispatch } from 'react-redux';

import { MdQrCodeScanner } from 'react-icons/md';

import InputAsyncSelect from '../../../components/Input/InputAsyncSelect';
import { ALL_STATUSES, STATUS_ENGLISH_VS_FRENCH } from '../../../utils/colisUtils';
import Html5QrcodePlugin from '../../common/components/Html5QrcodeScannerPlugin';
import { showNotification } from '../../common/headerSlice';
import { getLivreursBySearch } from '../../livreurs/livreursSlice';
import parcelsUtils from '../parcels.utils';
import { setQrcodeAction } from '../parcelsManagementSlice';

const QrCodePanel = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  const [livreur, setLivreur] = useState(null);
  const [scanResult, setScanResult] = useState('');
  const scanRef = useRef(null);
  const [isScanningMode, setIsScanningMode] = useState(false);
  const [isReadyToRead, setIsReadyToRead] = useState(false);
  const [colisForToday, setColisForToday] = useState([]);
  const [colisForYesterday, setColisForYesterday] = useState([]);
  const [groupedParcels, setGroupedParcels] = useState({
    recuperationPhase: [],
    deliveryPhase: [],
    returnPhase: [],
    notDeliveredReturned: []
  });

  useEffect(() => {
    console.log({ 1: 'here', livreur, sc: scanRef.current });
    if (livreur && scanRef.current) {
      scanRef.current.focus();
      setIsReadyToRead(true); // Indicator that input is ready
    } else {
      setIsReadyToRead(false); // Not ready since no livreur is chosen
    }
  }, [livreur]);

  useEffect(() => {
    const fetchLivreursParcels = async (id) => {
      try {
        const responseForYesterday = await axios.get('/api/colis/get-colis', {
          params: {
            from: moment.utc(extraObject?.from).subtract(1, 'days')?.format('YYYY-MM-DD'),
            to: moment.utc(extraObject?.to).subtract(1, 'days')?.format('YYYY-MM-DD'),
            skip: 0
          }
        });
        const fetchedColisForYesterday = responseForYesterday.data?.colis;
        setColisForYesterday(() => fetchedColisForYesterday || []);

        const responseForToday = await axios.get('/api/colis/get-colis', {
          params: { from: extraObject?.from, to: extraObject?.to, skip: 0 }
        });
        const fetchedColisForToday = responseForToday.data?.colis;
        setColisForToday(() => fetchedColisForToday || []);

        // Initial empty groups
        const groups = {
          recuperationPhase: [],
          deliveryPhase: [],
          returnPhase: [],
          notDeliveredReturned: []
        };

        [...fetchedColisForToday, ...fetchedColisForYesterday].forEach((colis) => {
          const ongoingAssignment = parcelsUtils.findOngoingAssignment(colis);
          if (ongoingAssignment && livreur === ongoingAssignment?.livreur_id) {
            const code = colis?.status?.colis_status?.code;
            // Grouping logic
            if (
              [
                // ALL_STATUSES.ASSIGNED_FOR_COLLECTION,
                // ALL_STATUSES.COLLECTION_IN_PROGRESS,
                ALL_STATUSES.COLLECTED
                // ALL_STATUSES.NOT_COLLECTED
              ].includes(code)
            ) {
              groups.recuperationPhase.push(colis);
            } else if (
              [
                ALL_STATUSES.ASSIGNED_FOR_DELIVERY
                // ALL_STATUSES.WAITING_FOR_DELIVERY,
                // ALL_STATUSES.DELIVERY_IN_PROGRESS
                // ALL_STATUSES.DELIVERED
              ].includes(code)
            ) {
              groups.deliveryPhase.push(colis);
            } else if (
              [
                ALL_STATUSES.ASSIGNED_FOR_RETURN
                // ALL_STATUSES.WAITING_FOR_DELIVERY,
                // ALL_STATUSES.DELIVERY_IN_PROGRESS
                // ALL_STATUSES.DELIVERED
              ].includes(code)
            ) {
              groups.returnPhase.push(colis);
            } else if ([ALL_STATUSES.NOT_DELIVERED, ALL_STATUSES.NOT_RETURNED].includes(code)) {
              groups.notDeliveredReturned.push(colis);
            }
          }
        });

        // fetchedColisForYesterday.forEach((colis) => {
        //   const ongoingAssignment = parcelsUtils.findOngoingAssignment(colis);
        //
        //   if (ongoingAssignment && livreur === ongoingAssignment?.livreur_id) {
        //     const code = colis?.status?.colis_status?.code;
        //   }
        // });

        // Update state with the grouped parcels
        setGroupedParcels((prevState) => {
          return { ...prevState, ...groups };
        });
      } catch (error) {
        console.error('Failed to fetch parcel data:', error);
      }
    };

    if (livreur) {
      fetchLivreursParcels(extraObject?.colis?.id);
      setIsScanningMode(false);
    }
  }, [livreur, extraObject?.from, extraObject?.to]);

  const handleScan = (scannedData) => {
    const separator = '-#$#-';
    const equalSign = '=';
    const slash = '/';
    const constY = 'y';
    const constCapY = 'Y';
    const constZ = 'z';
    const constCapZ = 'Z';
    const wrongSeparator = '/\\$\\/';
    const wrongEqualSign = ')';
    const wrongSlash = '&';
    const wrongConstY = 'z';
    const wrongConstCapY = 'Z';
    const wrongConstZ = 'y';
    const wrongConstCapZ = 'Y';
    const cleanedData = scannedData
      ?.replaceAll(wrongConstCapY, constCapY)
      ?.replaceAll(wrongConstY, constY)
      ?.replaceAll(wrongConstCapZ, constCapZ)
      ?.replaceAll(wrongConstZ, constZ)
      ?.replaceAll(wrongSeparator, separator)
      ?.replaceAll(wrongEqualSign, equalSign)
      ?.replaceAll(wrongSlash, slash);

    setScanResult(cleanedData);
    // console.log({
    //   cleanedData,
    //   saturnin: 'STREET-#$#-jQZZLIdmfUmmOslu9Ki5Vg==-#$#-J5',
    //   isequal: 'STREET-#$#-jQZZLIdmfUmmOslu9Ki5Vg==-#$#-J5' === cleanedData
    // });
    debouncedChangeStatus(cleanedData, livreur);
  };

  const updateGroupedParcelsWithNewColis = (groups, updatedColis) => {
    const updatedGroups = {};

    Object.keys(groups).forEach((groupKey) => {
      updatedGroups[groupKey] = groups[groupKey].map((colis) =>
        colis.id === updatedColis.id ? updatedColis : colis
      );
    });

    return updatedGroups;
  };

  const handleChangeStatus = async (qrcode, livreurId) => {
    try {
      const response = await dispatch(
        setQrcodeAction({
          qrcode,
          livreurId
        })
      );

      if (response?.error) {
        console.error(response.error);
        dispatch(
          showNotification({
            message: 'Error while changing the parcel status',
            status: 0
          })
        );
      } else {
        // Update groupedParcels with the new colis data
        const updatedGroups = updateGroupedParcelsWithNewColis(
          groupedParcels,
          response.payload.colis
        );
        console.log({ updatedGroups });
        // setGroupedParcels(updatedGroups);
        // setGroupedParcels((prevState) => {
        //   return { ...prevState, ...updatedGroups };
        // });

        dispatch(
          showNotification({
            message: 'Successfully updated the parcel status',
            status: 1
          })
        );
      }
    } catch (error) {
      console.error('Error changing status:', error);
      dispatch(
        showNotification({
          message: 'An unexpected error occurred',
          status: 0
        })
      );
    } finally {
      setScanResult('');
    }
  };

  const debouncedChangeStatus = useCallback(_.debounce(handleChangeStatus, 1000), []);

  const allGroupsAreEmpty = Object.values(groupedParcels).every((group) => group.length === 0);

  const onNewScanResult = (decodedText, decodedResult) => {
    // handle decoded results here
    console.log({ decodedText, decodedResult });
  };

  return (
    <div className="mb-5">
      {/*<div className="App" className>*/}
      {/*  <Html5QrcodePlugin*/}
      {/*    fps={10}*/}
      {/*    // qrbox={250}*/}
      {/*    qrbox={{ width: 400, height: 150 }}*/}
      {/*    disableFlip={false}*/}
      {/*    qrCodeSuccessCallback={onNewScanResult}*/}
      {/*  />*/}
      {/*</div>*/}

      <ChooseLivreur
        livreur={livreur}
        dispatch={dispatch}
        updateFormValue={(val) => {
          setLivreur(val?.value || null);
        }}
      />

      {livreur && !allGroupsAreEmpty ? (
        <>
          <input
            ref={scanRef}
            type="text"
            value={scanResult}
            onChange={(e) => (isScanningMode ? handleScan(e.target.value) : () => {})}
            className="opacity-0 absolute"
            tabIndex="-1"
            onBlur={() => {
              if (document.activeElement !== scanRef.current) {
                setIsReadyToRead(false);
              }
            }}
          />
          {isScanningMode ? (
            <>
              <div className="flex flex-col items-center justify-center p-2 my-4 text-center bg-gray-200 rounded-lg shadow">
                <MdQrCodeScanner className="w-12 h-12 mb-3 text-blue-500" />
                <p className="text-lg font-medium">Please use the barcode scanner</p>
                <p className="text-sm text-gray-600">Scan any QR code to take action.</p>
                <div
                  style={{ height: '10px', width: '10px', borderRadius: '50%' }}
                  className={isReadyToRead ? 'bg-green-500' : 'bg-red-500'}></div>
              </div>

              {/* Hidden but focusable input for catching the scan result */}

              {isReadyToRead ? (
                <></>
              ) : (
                <div className="flex items-center justify-center text-error">
                  The QR Code reader lost focus.{' '}
                  <button
                    className="btn btn-link"
                    onClick={() => {
                      console.log({ colisForToday, colisForYesterday });
                      if (livreur && scanRef.current) {
                        scanRef.current.focus();
                        setIsReadyToRead(true); // Indicator that input is ready
                      } else {
                        setIsReadyToRead(false); // Not ready since no livreur is chosen
                      }
                    }}>
                    {' '}
                    Click to start reading
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center">
              <button
                className="btn btn-outline btn-primary"
                onClick={() => {
                  setIsScanningMode(true);
                  scanRef.current.focus();
                  setIsReadyToRead(true);
                }}>
                Start Scanning
              </button>
            </div>
          )}

          <ParcelSummaryTables groupedParcels={groupedParcels} />
        </>
      ) : (
        <div className="flex items-center justify-center">{livreur ? 'No Parcel found.' : ''}</div>
      )}
    </div>
  );
};

export default QrCodePanel;

const ChooseLivreur = ({ livreur, dispatch, updateFormValue }) => {
  // Async function to fetch delivery persons based on user input
  // noinspection DuplicatedCode
  const livreursPromiseOptions = (inputValue) =>
    new Promise((resolve) => {
      // Fetch options only if input length is 3 or more characters
      if (inputValue?.length >= 3) {
        dispatch(getLivreursBySearch({ searchPattern: inputValue })).then((res) => {
          resolve(
            res?.payload.livreurs
              ?.filter(
                (livreur) =>
                  livreur?.first_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
                  livreur?.last_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
                  livreur?.client?.phone_number?.toLowerCase()?.includes(inputValue.toLowerCase())
              )
              ?.map((livreur) => ({
                value: livreur.id,
                label: `${livreur.first_name} ${livreur.last_name} (${livreur?.client?.phone_number})`
              }))
          );
        });
      } else {
        resolve([]);
      }
    });

  return (
    <div className={livreur ? 'mb-5' : 'mb-[8rem]'}>
      {/* InputAsyncSelect component for choosing a livreur */}
      <InputAsyncSelect
        type="text"
        updateType="livreur"
        containerStyle="mt-3"
        labelTitle="Choose a Livreur"
        updateFormValue={updateFormValue}
        loadOptions={livreursPromiseOptions}
      />
    </div>
  );
};

const ParcelSummaryTables = ({ groupedParcels }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-500';
      case 'LOST':
        return 'text-red-500';
      case 'PENDING':
        return 'text-yellow-500';
      case 'ARTICLE_TO_RETURN':
        return 'text-blue-500';
      case 'REGISTERED':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };
  // Helper function to generate table rows for each parcel in a group
  const renderTableRows = (parcels) => {
    return parcels.map((parcel, index) => {
      const amount =
        parcel?.status?.colis_status?.code === 'DELIVERED' && parseInt(parcel.price) > 0
          ? parcel.fee_payment === 'PREPAID' && parcel?.status?.colis_status?.code !== 'LOST'
            ? parseInt(parcel.price)
            : parseInt(parcel.price) - parseInt(parcel.fee || 0)
          : 0;

      const fee =
        parcel?.status?.colis_status?.code === 'DELIVERED' && parcel.fee_payment === 'POSTPAID'
          ? parseInt(parcel.fee || 0)
          : 0;
      return (
        <tr key={index}>
          <td>{parcel?.code}</td>
          <td>
            <span
              className={`px-3 py-1 uppercase text-xs font-bold rounded-full ${getStatusColor(
                parcel?.status?.colis_status?.code
              )}`}>
              {STATUS_ENGLISH_VS_FRENCH(parcel?.status?.colis_status?.code)}
            </span>
          </td>
          <td>{amount}</td>
          <td>{fee}</td>
          <td>{amount + fee}</td>
          <td>{parcel?.client?.phone_number}</td>
          <td>{parcel?.pickup_address?.description}</td>
          <td>{parcel?.delivery_phone_number}</td>
          <td>{parcel?.delivery_address?.description}</td>
        </tr>
      );
    });
  };

  const getGroupName = (groupName) => {
    let userFriendlyGroupName;
    switch (groupName) {
      case 'recuperationPhase':
        userFriendlyGroupName = 'Recuperation Phase';
        break;
      case 'deliveryPhase':
        userFriendlyGroupName = 'Delivery Phase';
        break;
      case 'returnPhase':
        userFriendlyGroupName = 'Return Phase';
        break;
      case 'notDeliveredReturned':
        userFriendlyGroupName = 'Not Delivered/Returned';
        break;
      default:
        return 'Other';
    }
    return userFriendlyGroupName;
  };

  // Iterate over each key in groupedParcels to generate a summary and table
  const renderGroupTables = Object.entries(groupedParcels).map(([groupName, parcels]) => {
    // Determine a user-friendly name for each group
    let userFriendlyGroupName = '';
    userFriendlyGroupName = getGroupName(groupName);

    return (
      <div key={groupName} className="mb-4 overflow-x-auto">
        {parcels?.length ? (
          <>
            <h3 className="text-lg font-semibold mb-2">{userFriendlyGroupName}</h3>
            <table className="table table-zebra table-compact table-auto w-full text-left whitespace-no-wrap my-5">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Delivery</th>
                  <th>Total</th>
                  <th>Merchant Number</th>
                  <th>Pickup Address</th>
                  <th>Delivery Number</th>
                  <th>Delivery Address</th>
                </tr>
              </thead>
              <tbody>{renderTableRows(parcels)}</tbody>
            </table>
          </>
        ) : (
          <></>
        )}
      </div>
    );
  });

  return (
    <div className="my-4">
      <h2 className="text-xl font-bold mb-4 text-primary">Parcel Summary</h2>
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="stats shadow">
          {Object.entries(groupedParcels).map(([groupName, parcels]) => (
            <div className="stat" key={groupName}>
              <div className="stat-title">{getGroupName(groupName)}</div>
              <div className="stat-value">{parcels?.length || 0}</div>
            </div>
          ))}
        </div>
      </div>
      {renderGroupTables}
    </div>
  );
};
