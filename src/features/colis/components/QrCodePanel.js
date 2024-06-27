// noinspection JSUnresolvedReference

import React, { useCallback, useEffect, useRef, useState } from 'react';

import axios from 'axios';
import * as _ from 'lodash';
import moment from 'moment';
import { useDispatch } from 'react-redux';

import { MdQrCodeScanner } from 'react-icons/md';

import PointLivreurContent from './PointLivreurContent';
import PointVersementLivreurContent from './PointVersementLivreurContent';
import InputAsyncSelect from '../../../components/Input/InputAsyncSelect';
import NotFoundPage from '../../../pages/authenticated/404';
import { ALL_STATUSES, STATUS_ENGLISH_VS_FRENCH } from '../../../utils/colisUtils';
import groupColisByDeliveryLivreurPhone from '../../../utils/functions/groupColisByDeliveryLivreurPhone';
import handleCopyContent from '../../../utils/functions/handleCopyContent';
import {
  TABS_ENUMERATION_IN_COLIS,
  TABS_ENUMERATION_IN_QR_CODE_PANEL
} from '../../../utils/globalConstantUtil';
import Html5QrcodePlugin from '../../common/components/Html5QrcodeScannerPlugin';
import { showNotification } from '../../common/headerSlice';
import { getLivreursBySearch } from '../../livreurs/livreursSlice';
import parcelsUtils from '../parcels.utils';
import { setQrcodeAction } from '../parcelsManagementSlice';

const QrCodePanel = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  const [isScanning, setIsScanning] = useState(true);
  const [livreur, setLivreur] = useState(null);
  const [scanResult, setScanResult] = useState('');
  const scanRef = useRef(null);
  const [isScanningMode, setIsScanningMode] = useState(false);
  const [isReadyToRead, setIsReadyToRead] = useState(false);
  const [activeParcels, setActiveParcels] = useState([]);
  const [activeTab, setActiveTab] = useState(TABS_ENUMERATION_IN_QR_CODE_PANEL.parcels_summary);
  // State to manage whether the QR code scanner or input field should be shown
  const [showScanner, setShowScanner] = useState(true);
  const [groupedParcels, setGroupedParcels] = useState({
    recuperationPhase: [],
    deliveryPhase: [],
    returnPhase: [],
    notDeliveredReturned: []
  });
  const [paymentList, setPaymentList] = useState([]);

  useEffect(() => {
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
        const responseForActiveParcels = await axios.get('/api/colis/get-colis', {
          params: {
            from: moment.utc(extraObject?.from).subtract(1, 'days')?.format('YYYY-MM-DD'),
            to: moment.utc(extraObject?.to).subtract(1, 'days')?.format('YYYY-MM-DD'),
            skip: 0,
            type: TABS_ENUMERATION_IN_COLIS.active_parcels
          }
        });
        const fetchedActiveParcels = responseForActiveParcels.data?.colis;
        setActiveParcels(() => fetchedActiveParcels || []);

        // Initial empty groups
        const groups = {
          recuperationPhase: [],
          deliveryPhase: [],
          returnPhase: [],
          notDeliveredReturned: []
        };

        fetchedActiveParcels.forEach((colis) => {
          const ongoingAssignment = parcelsUtils.findOngoingAssignment(colis);
          if (ongoingAssignment && livreur === ongoingAssignment?.livreur_id) {
            const code = colis?.status?.colis_status?.code;
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

        // Update state with the grouped parcels
        setGroupedParcels((prevState) => {
          return { ...prevState, ...groups };
        });
      } catch (error) {
        console.error('Failed to fetch parcel data:', error);
      }
    };
    const fetchLivreurPaymentParcels = async (id) => {
      try {
        const responseForPaymentParcels = await axios.get('/api/colis/get-colis', {
          params: {
            from: moment.utc(extraObject?.from).subtract(1, 'days')?.format('YYYY-MM-DD'),
            to: moment.utc(extraObject?.to).subtract(1, 'days')?.format('YYYY-MM-DD'),
            skip: 0,
            type: TABS_ENUMERATION_IN_QR_CODE_PANEL.payment_summary
          }
        });

        const fetchedActivePaymentParcels = responseForPaymentParcels.data?.colis;

        const newData = fetchedActivePaymentParcels?.filter((colis) => {
          return colis?.commande_colis?.some((commandeColis) => {
            return (
              commandeColis.livreur_id === livreur &&
              commandeColis.versement_status === 'PENDING' &&
              ['DELIVERED', 'LOST', 'COLLECTED'].includes(
                commandeColis?.colis_status?.colis_status?.code
              )
            );
          });
        });

        setPaymentList(() => [...newData]);
      } catch (error) {
        console.error('Failed to fetch parcel data:', error);
      }
    };

    if (livreur) {
      if (activeTab === TABS_ENUMERATION_IN_QR_CODE_PANEL.parcels_summary) {
        fetchLivreursParcels(extraObject?.colis?.id);
        setIsScanningMode(false);
      } else if (TABS_ENUMERATION_IN_QR_CODE_PANEL.payment_summary) {
        fetchLivreurPaymentParcels(extraObject?.colis?.id);
      }
    }
  }, [livreur, activeTab]);

  const updateGroupedParcelsWithNewColis = (groups, updatedColis, livreurId) => {
    const updatedGroups = { ...groups };

    Object.keys(groups).forEach((groupKey) => {
      // Keep only the parcels that belong to the livreur or are the updated parcel
      updatedGroups[groupKey] = groups[groupKey]
        .filter((colis) => {
          // If the parcel is the updated one, check if it belongs to the livreur
          if (colis.id === updatedColis.id) {
            // If the updated parcel doesn't belong to the livreur, remove it from the list
            return updatedColis?.commande_colis?.some(
              (assignment) => assignment.livreur_id === livreurId
            );
          }
          // Otherwise, keep the parcel if it's not the one being updated
          return true;
        })
        .map((colis) => {
          // If this parcel is the updated one, return the updated parcel data
          if (colis.id === updatedColis.id) {
            return updatedColis;
          }
          // Otherwise, return the parcel as is
          return colis;
        });
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
        setGroupedParcels((prevState) => {
          // Use a function to update state to ensure you have the most recent state
          const newParcel = response.payload.colis;
          // noinspection UnnecessaryLocalVariableJS
          const updatedGroups = updateGroupedParcelsWithNewColis(prevState, newParcel);

          // This will return the new state which should trigger a re-render
          return updatedGroups;
        });

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

  const onNewScanResult = async (decodedText, decodedResult) => {
    setIsScanning(false);
    console.log({ decodedText, decodedResult });

    setScanResult(decodedText);
    await debouncedChangeStatus(decodedText, livreur);
    setIsScanning(true);
  };

  return (
    <div className="mb-5">
      <ChooseLivreur
        livreur={livreur}
        dispatch={dispatch}
        updateFormValue={(val) => {
          setLivreur(val?.value || null);
        }}
      />

      {livreur && (
        <div className="flex justify-center w-full my-4">
          <div>
            <div className="tabs tabs-boxed">
              <a
                className={`tab ${
                  activeTab === TABS_ENUMERATION_IN_QR_CODE_PANEL.parcels_summary
                    ? 'tab-active'
                    : ''
                }`}
                onClick={() => setActiveTab(TABS_ENUMERATION_IN_QR_CODE_PANEL.parcels_summary)}>
                {TABS_ENUMERATION_IN_QR_CODE_PANEL.parcels_summary}
              </a>
              <a
                className={`tab ${
                  activeTab === TABS_ENUMERATION_IN_QR_CODE_PANEL.payment_summary
                    ? 'tab-active'
                    : ''
                }`}
                onClick={() => setActiveTab(TABS_ENUMERATION_IN_QR_CODE_PANEL.payment_summary)}>
                {TABS_ENUMERATION_IN_QR_CODE_PANEL.payment_summary}
              </a>
            </div>
          </div>
        </div>
      )}

      {livreur && activeTab === TABS_ENUMERATION_IN_QR_CODE_PANEL.parcels_summary ? (
        !allGroupsAreEmpty ? (
          <>
            <div className="flex flex-col items-center justify-center p-2 my-4 text-center bg-gray-200 rounded-lg shadow">
              <MdQrCodeScanner className="w-12 h-12 mb-3 text-blue-500" />
              <p className="text-lg font-medium">Please use the barcode scanner</p>
              <p className="text-sm text-gray-600">Scan any QR code to take action.</p>
              <button
                className="btn btn-primary btn-outline btn-sm my-3"
                onClick={() => setShowScanner(!showScanner)}>
                {showScanner ? 'Switch to Input' : 'Switch to Scanner'}
              </button>
              {showScanner ? (
                <div>
                  <Html5QrcodePlugin
                    fps={10}
                    qrbox={250}
                    disableFlip={false}
                    rememberLastUsedCamera={true}
                    qrCodeSuccessCallback={isScanning ? onNewScanResult : () => {}}
                  />
                </div>
              ) : (
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const inputText = event.target.elements.inputText.value;
                    await onNewScanResult(inputText, null);
                  }}>
                  <input
                    type="text"
                    name="inputText"
                    placeholder="Enter code"
                    className="input input-bordered input-sm rounded shadow mx-3"
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    Submit
                  </button>
                </form>
              )}
            </div>
            <ParcelSummaryTables groupedParcels={groupedParcels} dispatch={dispatch} />
          </>
        ) : (
          <NotFoundPage message="No colis found" />
        )
      ) : livreur && activeTab === TABS_ENUMERATION_IN_QR_CODE_PANEL.payment_summary ? (
        paymentList?.length ? (
          <PointVersementLivreurContent
            livreur={livreur}
            data={paymentList}
            setPaymentList={setPaymentList}
            onCopy={() => handleCopyContent(`content-${1}`)}
          />
        ) : (
          <NotFoundPage message="No due payment" />
        )
      ) : (
        livreur && <NotFoundPage message="No colis found" />
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

const ParcelSummaryTables = ({ groupedParcels, dispatch }) => {
  useEffect(() => {
    // Perform actions that should happen after groupedParcels updates.
    // For example, if you need to fetch additional data based on the new parcels:
    // fetchAdditionalParcelData(groupedParcels);

    // Or simply log to the console to verify it's updating:
    console.log('Updated groupedParcels:', groupedParcels);
  }, [groupedParcels]);
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
      console.log({ parcel });
      const amount = parseInt(parcel.price);

      const fee = parseInt(parcel.fee || 0);
      return (
        <tr key={index}>
          <td
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(parcel?.code);
                dispatch(
                  showNotification({
                    message: 'Text copied to clipboard',
                    status: 1
                  })
                );
              } catch (err) {
                console.error('Failed to copy text: ', err);
              }
            }}>
            {parcel?.code}
          </td>
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
          <td>{parcel.fee_payment === 'PREPAID' ? amount : amount + fee}</td>
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
