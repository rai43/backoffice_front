/* eslint-disable prettier/prettier,react/prop-types */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import * as _ from 'lodash';
import moment from 'moment';
import { useDispatch } from 'react-redux';

import { GiBrightExplosion } from 'react-icons/gi';
import { GoEyeClosed } from 'react-icons/go';
import { MdQrCodeScanner } from 'react-icons/md';
import { TiCancel } from 'react-icons/ti';

import {
  ABSOLUTE_STATUS_ACTIONS,
  ALL_STATUSES,
  COLIS_ASSIGNMENTS_VS_ACTIONS,
  STATUS_ACTIONS,
  STATUS_ICON_NAMES
} from '../../../utils/colisUtils';
import { showNotification } from '../../common/headerSlice';
import { getLivreursBySearch } from '../../livreurs/livreursSlice';
import parcelsUtils from '../parcels.utils';
import {
  changeColisStatus,
  createParcelAssignment,
  updateColisPaymentStatus
} from '../parcelsManagementSlice';

const SENDER_ISSUES = [
  'SENDER_ABSENT',
  'SENDER_UNREACHABLE',
  'SENDER_NOT_RESPONDING',
  'SENDER_POSTPONED',
  'SENDER_INCORRECT_ADDRESS',
  'SENDER_ACCESS_ISSUES',
  'SENDER_SECURITY_PROBLEMS'
];

const RECIPIENT_ISSUES = [
  'RECIPIENT_REFUSED',
  'RECIPIENT_ABSENT',
  'RECIPIENT_UNREACHABLE',
  'RECIPIENT_NOT_RESPONDING',
  'RECIPIENT_POSTPONED',
  'RECIPIENT_INCORRECT_ADDRESS',
  'RECIPIENT_ACCESS_ISSUES',
  'RECIPIENT_SECURITY_PROBLEMS'
];

/**
 * Finds the ongoing parcel assignment with status_id null and returns the one with the highest id.
 * @param {Array} assignments - Array of assignment objects.
 * @returns {Object|null} - The ongoing parcel assignment object or null if not found.
 */
function findOngoingParcelAssignment(assignments) {
  // Filter assignments with status_id null
  const ongoingAssignments = assignments.filter((assignment) => assignment.status_id === null);

  // If no ongoing assignments found, return null
  if (!ongoingAssignments.length) return null;

  // Sort the ongoing assignments by id in descending order and return the first one
  return ongoingAssignments.sort((a, b) => b.id - a.id)[0];
}

const ChangeStatus = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();

  // States to manage UI and data flow
  const [scanResult, setScanResult] = useState('');
  const [move, setMove] = useState(''); // Controls forward or backward movement in the status flow
  const [confirmAction, setConfirmAction] = useState(''); // Tracks the action to be confirmed
  const [chooseLivreur, setChooseLivreur] = useState(false); // Flag for choosing a delivery person
  const [livreur, setLivreur] = useState(''); // Selected delivery person ID
  const [statusActions, setStatusActions] = useState(ABSOLUTE_STATUS_ACTIONS['ABSOLUTE']); // Available actions based on current status
  const [colisAssignmentsVsActions, _] = useState(COLIS_ASSIGNMENTS_VS_ACTIONS); // Available actions based on current status
  // Update form values - mainly for selecting a delivery person
  const updateForm = useCallback(({ key, value }) => {
    if (key === 'livreur') {
      setLivreur(value);
    }
  }, []);

  // Async function to fetch delivery persons based on user input
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
                  livreur?.whatsapp?.toLowerCase()?.includes(inputValue.toLowerCase())
              )
              ?.map((livreur) => ({
                value: livreur.id,
                label: `${livreur.first_name} ${livreur.last_name} (${livreur?.whatsapp})`
              }))
          );
        });
      } else {
        resolve([]);
      }
    });

  // Component rendering logic
  return (
    <div>
      {/* Current status display */}
      <StatusDisplay extraObject={extraObject} />

      {/* Action buttons based on current status */}
      {!confirmAction?.length ? (
        <>
          <ActionButtons
            colisAssignmentsVsActions={colisAssignmentsVsActions}
            move={move}
            setConfirmAction={setConfirmAction}
            dispatch={dispatch}
            colis={extraObject?.colis}
            closeModal={closeModal}
            // parcelsUtils.findOngoingAssignment(colis)
            ongoingColisAssignment={parcelsUtils.findOngoingAssignment(extraObject?.colis)}
            colisCode={extraObject?.colis?.status?.colis_status?.code}
          />
        </>
      ) : (
        <></>
      )}

      <ConfirmationLogic
        confirmAction={confirmAction}
        extraObject={extraObject}
        setConfirmAction={setConfirmAction}
        chooseLivreur={chooseLivreur}
        setChooseLivreur={setChooseLivreur}
        livreur={livreur}
        dispatch={dispatch}
        closeModal={closeModal}
        changeColisStatus={changeColisStatus}
        livreursPromiseOptions={livreursPromiseOptions}
        updateFormValue={updateForm}
        scanResult={scanResult}
        setScanResult={setScanResult}
      />
    </div>
  );
};

export default ChangeStatus;

const StatusDisplay = ({ extraObject }) => (
  <div className="flex justify-center">
    <div className={'divider'}>Current Status</div>
    <span className={'p-2 shadow shadow-primary rounded'}>
      {extraObject?.colis?.colis_statuses[0]?.colis_status?.code
        // extraObject?.colis?.colis_statuses?.length - 1
        ?.toUpperCase()
        ?.replaceAll('_', ' ')}
    </span>
  </div>
);

const ActionButtons = ({
  colisAssignmentsVsActions,
  move,
  colis,
  setConfirmAction,
  dispatch,
  closeModal,
  ongoingColisAssignment,
  colisCode
}) => {
  const tomorrow = moment.utc().add(1, 'days').format('YYYY-MM-DD');
  const [deliveryDate, setDeliveryDate] = useState(tomorrow);
  const [returnDate, setReturnDate] = useState(tomorrow);

  // Determine the action set based on the status of the ongoing assignment
  let actionSet = [];

  const handleReassign = async (action) => {
    console.log('Reassigned for Delivery');

    if (!action) {
      dispatch(
        showNotification({
          message: 'Please provide a valid action',
          status: 0
        })
      );
    }

    try {
      const response = await dispatch(
        createParcelAssignment({
          colisId: colis?.id,
          action,
          operationDate: moment.utc(deliveryDate).format('YYYY-MM-DD')
        })
      );
      if (response?.error) {
        console.error(response.error);
        dispatch(
          showNotification({
            message: 'Error while created a delivery assignment for the parcel.',
            status: 0
          })
        );
        // setDeliveryDate(tomorrow);
      } else {
        dispatch(
          showNotification({
            message: 'Successfully created a delivery assignment for the parcel.',
            status: 1
          })
        );
        closeModal();
      }
    } catch (error) {
      console.error('Error while created a delivery assignment for the parcel.', error);
      dispatch(
        showNotification({
          message: 'Error while created a delivery assignment for the parcel.',
          status: 0
        })
      );
    }
  };

  const colisStatusCode = colisCode;

  console.log({ ongoingColisAssignment, colisStatusCode });

  if (['CANCELED', 'COMPLETED'].includes(ongoingColisAssignment?.status)) {
    // No actions for assignments marked as COMPLETED or CANCELED
    actionSet = [];
  } else if (
    ongoingColisAssignment?.status === 'PENDING' ||
    ongoingColisAssignment?.status === 'PROCESSING'
  ) {
    // Logic for PENDING or PROCESSING assignments
    // actionSet = ['No further actions are available for this parcel.']
    const colisStatusCode = ongoingColisAssignment?.colis_status?.colis_status?.code;
    actionSet = STATUS_ACTIONS?.[colisStatusCode]?.ACTIONS;
  } else if (!ongoingColisAssignment) {
    if (colisCode === ALL_STATUSES.PENDING) {
      actionSet = STATUS_ACTIONS?.[colisStatusCode]?.ACTIONS;
    }
    console.log({ colisCode });
    if (colisCode === 'WAREHOUSED') {
      actionSet = ['NOT_RETURNED_REASSIGN'];
    }
  }

  const normalActionsView = (
    <>
      <div className={'divider my-5'}>MAIN ACTIONS</div>
      <div className="flex justify-around flex-wrap gap-3">
        {actionSet?.map(({ action, isActive }, index) => (
          <div key={index} className="flex flex-col items-center justify-center my-4">
            <button
              className={`btn btn-outline ${
                action === 'DELIVERED'
                  ? 'btn-success'
                  : action === 'NOT_DELIVERED'
                  ? 'btn-secondary'
                  : action === 'REFUSED'
                  ? 'btn-error'
                  : action === 'POSTPONED'
                  ? 'btn-ghost'
                  : 'btn-primary'
              } gap-2 my-2`}
              disabled={!isActive}
              onClick={() =>
                isActive
                  ? setConfirmAction(action)
                  : dispatch(
                      showNotification({
                        message: `Please edit the colis to be able to change its status to ${action?.toUpperCase()}`,
                        status: 0
                      })
                    )
              }>
              MARK AS {action?.replaceAll('_', ' ')}
              {STATUS_ICON_NAMES[action]}{' '}
            </button>
            {!isActive ? (
              <h4 className="mt-2 text-center text-info font-bold">
                Please, scan the code on the parcel to change its status
              </h4>
            ) : (
              <></>
            )}
          </div>
        ))}
      </div>
    </>
  );

  const notReturnedReassignView = (
    <div className="flex justify-center gap-4 p-5">
      <div className="border border-gray-200 p-6 rounded-lg shadow-sm w-1/2">
        <h2 className="text-lg font-semibold">Reassign For Delivery</h2>
        <p className="mb-4">Choose this option if you want to reassign the item for delivery.</p>
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded w-full"
        />
        <button
          onClick={async () => await handleReassign('REASSIGN_FOR_DELIVERY')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Reassign for Delivery
        </button>
      </div>

      <div className="border border-gray-200 p-6 rounded-lg shadow-sm w-1/2">
        <h2 className="text-lg font-semibold">Assign For Return</h2>
        <p className="mb-4">Choose this option if the item needs to be returned.</p>
        <input
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded w-full"
        />
        <button
          onClick={async () => await handleReassign('REASSIGN_FOR_RETURN')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
          Assign for Return
        </button>
      </div>
    </div>
  );

  const defaultView =
    colis?.status?.colis_status?.code === 'PENDING' ? (
      <div className="flex justify-around flex-wrap gap-3 font-bold uppercase my-3 text-indigo-700"></div>
    ) : (
      <div className="flex justify-around flex-wrap gap-3 font-bold uppercase my-3 text-red-700">
        No Action Available
      </div>
    );

  return (
    <>
      {actionSet?.length && actionSet[0] !== 'NOT_RETURNED_REASSIGN'
        ? normalActionsView
        : actionSet?.length && actionSet[0] === 'NOT_RETURNED_REASSIGN'
        ? notReturnedReassignView
        : defaultView}
    </>
  );
};

const ActionButton = ({ action, label, Icon, className }) => (
  <button className={`inline-flex btn ${className}`} onClick={action}>
    <Icon className={'mr-2 h-4 w-4'} />
    {label}
  </button>
);

const ConfirmationLogic = ({
  confirmAction,
  extraObject,
  setConfirmAction,
  chooseLivreur,
  setChooseLivreur,
  livreur,
  dispatch,
  closeModal,
  changeColisStatus,
  livreursPromiseOptions,
  updateFormValue,
  scanResult,
  setScanResult
}) => {
  // Assuming ConfirmationLogic component starts here
  const [reason, setReason] = useState('');

  // Determine if the current action requires a reason
  const requiresReason = [
    'NOT_COLLECTED',
    'NOT_RETURNED',
    'NOT_DELIVERED',
    'POSTPONED'
    // 'REFUSED',
    // 'ARTICLE_TO_RETURN'
  ].includes(confirmAction);

  // Generate options based on the action
  const reasonOptions =
    confirmAction === 'NOT_COLLECTED' || confirmAction === 'NOT_RETURNED'
      ? SENDER_ISSUES
      : RECIPIENT_ISSUES;

  // Function to handle the status change confirmation
  const handleChangeStatus = async (action, qrcode = undefined) => {
    // if (
    //   ['ASSIGNED_FOR_COLLECTION', 'ASSIGNED_FOR_DELIVERY', 'ASSIGNED_FOR_RETURN'].includes(
    //     confirmAction
    //   )
    // ) {
    //   // If action requires choosing a livreur
    //   // setChooseLivreur(true);
    // } else {
    // Proceed with status change without choosing a livreur
    try {
      const response = await dispatch(
        changeColisStatus({
          colisId: extraObject?.colis?.id,
          action: confirmAction || action,
          assignmentId: parcelsUtils.findOngoingAssignment(extraObject?.colis)?.id,
          qrcode,
          reason
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
        setScanResult('');
      } else {
        dispatch(
          showNotification({
            message: 'Successfully updated the parcel status',
            status: 1
          })
        );
        closeModal();
      }
    } catch (error) {
      console.error('Error changing status:', error);
      dispatch(
        showNotification({
          message: 'An unexpected error occurred',
          status: 0
        })
      );
      setScanResult('');
    }
    // }
  };

  const scanInputRef = useRef(null);

  // useEffect(() => {
  //   if (scanInputRef.current) {
  //     scanInputRef.current.focus();
  //     setTimeout(function () {
  //       scanInputRef.current.focus();
  //     }, 100);
  //   }
  // });

  useEffect(() => {
    // Define a function to focus the input
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }
    const focusInput = () => {
      if (scanInputRef.current) {
        scanInputRef.current.focus();
      }
    };

    // Call the function immediately to focus on mount
    focusInput();

    // Set an interval to focus every 2 seconds
    const intervalId = setInterval(focusInput, 2000);

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this runs once on mount

  const handleScan = (scannedData) => {
    const separator = '-#$#-';
    const equalSign = '=';
    const slash = '/';
    const wrongSeparator = '/\\$\\/';
    const wrongEqualSign = ')';
    const wrongSlash = '&';
    const cleanedData = scannedData
      ?.replaceAll(wrongSeparator, separator)
      ?.replaceAll(wrongEqualSign, equalSign)
      ?.replaceAll(wrongSlash, slash);

    console.log({ cleanedData });
    setScanResult(cleanedData);
    debouncedChangeStatus(confirmAction, cleanedData);
    // You might want to call setConfirmAction or other logic here
  };

  const debouncedChangeStatus = useCallback(_.debounce(handleChangeStatus, 1500), []);

  if (confirmAction.length && !chooseLivreur) {
    return (
      <div className={'mt-4'}>
        <div className={'divider my-6'}>Confirmation Required</div>
        <div className="flex justify-center">
          <p>
            Are you sure you want to mark the status of the parcel with code{' '}
            <strong>{extraObject?.colis?.code}</strong> as{' '}
            <strong>{confirmAction.replace('_', ' ').toUpperCase()}</strong>?
          </p>
        </div>
        {requiresReason && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Reason:</span>
            </label>
            <select
              className="select select-bordered"
              value={reason}
              onChange={(e) => setReason(e.target.value)}>
              <option disabled value="">
                Select a reason
              </option>
              {reasonOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace('_', ' ')?.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}
        {confirmAction === 'COLLECTED' ? (
          <div>
            <div className="flex flex-col items-center justify-center p-4 my-4 text-center bg-gray-200 rounded-lg shadow">
              <MdQrCodeScanner className="w-12 h-12 mb-3 text-blue-500" />
              <p className="text-lg font-medium">Please use the barcode scanner</p>
              <p className="text-sm text-gray-600">Scan the QR code to proceed</p>
            </div>
            <button
              className="btn btn-outline btn-ghost"
              onClick={() => {
                setConfirmAction('');
                setScanResult('');
              }}>
              Cancel
            </button>

            {/* Visually hidden but focusable input for catching the scan result */}
            <input
              ref={scanInputRef}
              type="text"
              value={scanResult}
              onChange={(e) => handleScan(e.target.value)}
              className="absolute w-1 h-1 opacity-0 overflow-hidden"
              tabIndex="-1" // Make it focusable programmatically but not via keyboard navigation
            />
          </div>
        ) : (
          <div className="flex justify-around mt-4">
            <button
              className="btn btn-outline btn-ghost"
              onClick={() => {
                setConfirmAction('');
                setScanResult('');
              }}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={handleChangeStatus}>
              Confirm
            </button>
          </div>
        )}
      </div>
    );
  }

  // If action requires choosing a livreur
  // if (chooseLivreur) {
  //   return (
  //     <ChooseLivreur
  //       livreur={livreur}
  //       setLivreur={setChooseLivreur}
  //       livreursPromiseOptions={livreursPromiseOptions}
  //       confirmAction={confirmAction}
  //       extraObject={extraObject}
  //       closeModal={closeModal}
  //       dispatch={dispatch}
  //       changeColisStatus={changeColisStatus}
  //       updateFormValue={updateFormValue}
  //     />
  //   );
  // }

  return null;
};

// const ChooseLivreur = ({
//   livreur,
//   setLivreur,
//   livreursPromiseOptions,
//   confirmAction,
//   extraObject,
//   closeModal,
//   dispatch,
//   changeColisStatus,
//   updateFormValue
// }) => {
//   // Function to handle the confirmation and assignment of the selected livreur
//   const handleConfirmAssignment = async () => {
//     if (!livreur) {
//       alert('Please select a livreur.');
//       return;
//     }
//
//     try {
//       // // Assuming changeColisStatus is an async action that takes an object with colisId, livreurId, and action
//       const response = await dispatch(
//         changeColisStatus({
//           colisId: extraObject?.colis?.id,
//           livreurId: livreur,
//           action: confirmAction
//         })
//       );
//
//       if (response?.error) {
//         console.log(response.error);
//         dispatch(
//           showNotification({
//             message: 'Error while changing the parcel status.',
//             status: 0
//           })
//         );
//       } else {
//         dispatch(
//           showNotification({
//             message: 'Succefully updated the parcel status.',
//             status: 1
//           })
//         );
//         closeModal();
//       }
//     } catch (error) {
//       console.error('Error confirming assignment:', error);
//
//       dispatch(
//         showNotification({
//           message: 'An unexpected error occurred.',
//           status: 0
//         })
//       );
//     }
//   };
//
//   return (
//     <div className={'mt-4'}>
//       <div className={'divider my-6'}>Choose Livreur</div>
//       {/* InputAsyncSelect component for choosing a livreur */}
//       <InputAsyncSelect
//         type="text"
//         updateType="livreur"
//         containerStyle="mt-3"
//         labelTitle="Livreur"
//         updateFormValue={updateFormValue}
//         loadOptions={livreursPromiseOptions}
//       />
//       <div className="flex justify-around mt-4">
//         <button className="btn btn-outline btn-ghost" onClick={() => setLivreur(false)}>
//           Cancel
//         </button>
//         <button className="btn btn-success" onClick={handleConfirmAssignment}>
//           Confirm Assignment
//         </button>
//       </div>
//     </div>
//   );
// };
